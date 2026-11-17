package com.pawback.pawback.service;

import com.pawback.pawback.model.AssetCleanupTask;
import com.pawback.pawback.repository.AssetCleanupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class AssetCleanupService {
    private final AssetCleanupRepository repository;

    // Persist the recovery record before starting an external upload. A failed DB
    // transaction or interrupted request then leaves an idempotent cleanup job.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void stage(String publicId) {
        AssetCleanupTask task = new AssetCleanupTask();
        task.setPublicId(publicId);
        task.setNextAttemptAt(Instant.now().plusSeconds(3600));
        repository.saveAndFlush(task);
    }

    @Transactional
    public void attach(UploadedAsset asset) {
        repository.removeById(asset.publicId());
    }

    @Transactional
    public void retire(String publicId, String sourceUrl) {
        if (publicId == null) return;
        AssetCleanupTask task = repository.findById(publicId).orElseGet(AssetCleanupTask::new);
        task.setPublicId(publicId);
        task.setSourceUrl(sourceUrl);
        task.setNextAttemptAt(Instant.now());
        repository.save(task);
    }
}
