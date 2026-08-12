package com.pawback.pawback.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// Represents a single report submitted by a finder after scanning a Lost pet's QR code
@Entity
@Table(name = "scan_reports")
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

    private String photoUrl;

    private Double latitude;
    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Builder.Default
    private Instant createdAt = Instant.now();
}