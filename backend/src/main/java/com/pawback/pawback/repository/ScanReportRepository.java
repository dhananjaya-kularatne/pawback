package com.pawback.pawback.repository;

import com.pawback.pawback.model.ScanReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ScanReportRepository extends JpaRepository<ScanReport, Long> {

    List<ScanReport> findByPetIdOrderByCreatedAtDesc(Long petId);

    // Platform-wide report search for the admin moderation view. Every filter is
    // optional: a null bound is skipped, so passing nothing returns every report.
    @Query("""
            SELECT r FROM ScanReport r
            WHERE (:petId IS NULL OR r.pet.id = :petId)
              AND (:from IS NULL OR r.createdAt >= :from)
              AND (:to IS NULL OR r.createdAt < :to)
            """)
    Page<ScanReport> search(@Param("petId") Long petId,
                             @Param("from") Instant from,
                             @Param("to") Instant to,
                             Pageable pageable);
}
