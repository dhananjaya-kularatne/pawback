package com.pawback.pawback.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// Represents a single report submitted by a finder after scanning a Lost pet's QR code
@Entity
@Table(name = "scan_reports", indexes = @Index(name = "idx_report_history", columnList = "pet_id,created_at,id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(length = 32)
    private String finderPhone;

    private String photoUrl;
    private String photoPublicId;
    @Column(unique = true, length = 64)
    private String submissionKey;
    @Column(length = 64)
    private String requestHash;

    private Double latitude;
    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
