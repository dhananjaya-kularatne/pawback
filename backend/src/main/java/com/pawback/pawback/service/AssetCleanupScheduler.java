package com.pawback.pawback.service;

import com.pawback.pawback.repository.AssetCleanupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import java.time.Instant;

@Component @RequiredArgsConstructor
@ConditionalOnProperty(name = "app.asset-cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class AssetCleanupScheduler {
    private final AssetCleanupRepository tasks;
    private final AssetCleanupWorker worker;
    @Scheduled(fixedDelayString = "${app.asset-cleanup.interval-ms:60000}")
    public void clean() {
        for (var task : tasks.findTop50ByNextAttemptAtBeforeOrderByNextAttemptAtAsc(Instant.now())) worker.process(task.getPublicId());
    }
}
