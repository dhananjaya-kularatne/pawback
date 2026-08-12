package com.pawback.pawback.repository;

import com.pawback.pawback.model.ScanReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScanReportRepository extends JpaRepository<ScanReport, Long> {

    List<ScanReport> findByPetIdOrderByCreatedAtDesc(Long petId);
}