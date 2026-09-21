package com.pawback.pawback.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    @Value("${app.security.rate-limit.login.max-attempts:10}")
    private int maxAttempts;

    @Value("${app.security.rate-limit.login.window-minutes:15}")
    private int windowMinutes;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String ip) {
        return buckets.computeIfAbsent(ip, this::newBucket);
    }

    private Bucket newBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(maxAttempts)
                .refillGreedy(maxAttempts, Duration.ofMinutes(windowMinutes))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
