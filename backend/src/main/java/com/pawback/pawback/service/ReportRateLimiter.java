package com.pawback.pawback.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class ReportRateLimiter {
    private final JdbcTemplate jdbc;
    private final byte[] secret;
    private final int clientLimit, petLimit, windowMinutes;
    public ReportRateLimiter(JdbcTemplate jdbc, @Value("${jwt.secret}") String secret,
            @Value("${app.report-limit.client:5}") int clientLimit,
            @Value("${app.report-limit.pet:20}") int petLimit,
            @Value("${app.report-limit.window-minutes:60}") int windowMinutes) {
        if (clientLimit < 1 || petLimit < 1 || clientLimit > 1000 || petLimit > 1000 || windowMinutes < 1 || windowMinutes > 1440) {
            throw new IllegalArgumentException("Invalid report rate-limit configuration");
        }
        this.jdbc=jdbc; this.secret=secret.getBytes(StandardCharsets.UTF_8);
        this.clientLimit=clientLimit; this.petLimit=petLimit; this.windowMinutes=windowMinutes;
    }
    // Shared database counters serialize concurrent requests across application instances.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean tryConsume(UUID petUuid, String remoteAddress) {
        return consume("client:" + clientHash(remoteAddress), clientLimit) && consume("pet:" + petUuid, petLimit);
    }
    public int retryAfterSeconds() { return windowMinutes * 60; }
    private boolean consume(String key, int maximum) {
        Timestamp now=Timestamp.from(Instant.now()), cutoff=Timestamp.from(Instant.now().minusSeconds(windowMinutes * 60L));
        jdbc.update("""
            INSERT INTO report_budgets(budget_key, attempts, window_started_at) VALUES(?, 1, ?)
            ON DUPLICATE KEY UPDATE attempts=IF(window_started_at <= ?, 1, LEAST(attempts+1, ?)),
              window_started_at=IF(window_started_at <= ?, ?, window_started_at)
            """, key, now, cutoff, maximum+1, cutoff, now);
        return jdbc.queryForObject("SELECT attempts FROM report_budgets WHERE budget_key=? FOR UPDATE", Integer.class, key) <= maximum;
    }
    private String clientHash(String address) {
        try {
            Mac mac=Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret,"HmacSHA256"));
            return java.util.HexFormat.of().formatHex(mac.doFinal(address.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException exception) { throw new IllegalStateException(exception); }
    }
    @Scheduled(fixedDelay = 3600000)
    public void expire() { jdbc.update("DELETE FROM report_budgets WHERE window_started_at < ?", Timestamp.from(Instant.now().minusSeconds(172800))); }
}
