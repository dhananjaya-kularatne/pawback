package com.pawback.pawback.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;
import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/** Shared counters contain HMAC identities, expire, and commit independently of failed authentication. */
@Service
public class LoginRateLimiter {
    private final JdbcTemplate jdbc;
    private final byte[] secret;
    public LoginRateLimiter(JdbcTemplate jdbc,@Value("${jwt.secret}") String secret){this.jdbc=jdbc;this.secret=secret.getBytes(StandardCharsets.UTF_8);}
    @Transactional(propagation=Propagation.REQUIRES_NEW)
    public boolean tryConsume(String category,String identity,int maximum,int minutes) {
        String key="auth:"+category+":"+digest(identity);
        jdbc.update("""
            INSERT INTO report_budgets(budget_key,attempts,window_started_at) VALUES(?,1,UTC_TIMESTAMP(6))
            ON DUPLICATE KEY UPDATE attempts=IF(window_started_at<=TIMESTAMPADD(MINUTE,?,UTC_TIMESTAMP(6)),1,LEAST(attempts+1,?)),
            window_started_at=IF(window_started_at<=TIMESTAMPADD(MINUTE,?,UTC_TIMESTAMP(6)),UTC_TIMESTAMP(6),window_started_at)
            """,key,-minutes,maximum+1,-minutes);
        return jdbc.queryForObject("SELECT attempts FROM report_budgets WHERE budget_key=? FOR UPDATE",Integer.class,key)<=maximum;
    }
    private String digest(String value) {
        try {Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret,"HmacSHA256"));return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));}
        catch(java.security.GeneralSecurityException exception){throw new IllegalStateException(exception);}
    }
    @Scheduled(fixedDelay=3600000)
    public void expire(){jdbc.update("DELETE FROM report_budgets WHERE budget_key LIKE 'auth:%' AND window_started_at<TIMESTAMPADD(DAY,-2,UTC_TIMESTAMP(6))");}
}
