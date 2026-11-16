package com.pawback.pawback.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.pawback.pawback.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service @RequiredArgsConstructor @Slf4j
public class AssetCleanupWorker {
    private final AssetCleanupRepository tasks;
    private final PetRepository pets;
    private final ScanReportRepository reports;
    private final Cloudinary cloudinary;

    @Transactional
    public void process(String id) {
        var task = tasks.lockById(id).orElse(null);
        if (task == null || task.getNextAttemptAt().isAfter(Instant.now())) return;
        boolean referenced = pets.existsByDeletedAtIsNullAndPhotoPublicId(id)
                || pets.existsByDeletedAtIsNullAndQrCodePublicId(id) || reports.existsByPhotoPublicId(id);
        if (task.getSourceUrl() != null) referenced |= pets.existsByDeletedAtIsNullAndPhotoUrl(task.getSourceUrl())
                || pets.existsByDeletedAtIsNullAndQrCodeUrl(task.getSourceUrl()) || reports.existsByPhotoUrl(task.getSourceUrl());
        if (referenced) { tasks.delete(task); return; }
        try {
            Object result = cloudinary.uploader().destroy(id, ObjectUtils.asMap("resource_type", "image", "invalidate", true, "timeout", 10000)).get("result");
            if (!"ok".equals(result) && !"not found".equals(result)) throw new IllegalStateException("Cloud deletion was not acknowledged");
            tasks.delete(task);
        } catch (Exception exception) {
            task.setAttempts(task.getAttempts() + 1);
            task.setNextAttemptAt(Instant.now().plusSeconds(Math.min(21600, 60L << Math.min(task.getAttempts(), 8))));
            tasks.save(task);
            log.warn("Cloud asset cleanup will retry for {} (attempt {})", id, task.getAttempts());
        }
    }
}
