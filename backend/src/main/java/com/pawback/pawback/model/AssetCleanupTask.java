package com.pawback.pawback.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "asset_cleanup_tasks", indexes = @Index(name = "idx_cleanup_due", columnList = "next_attempt_at"))
@Getter @Setter @NoArgsConstructor
public class AssetCleanupTask {
    @Id
    private String publicId;
    @Column(length = 2048)
    private String sourceUrl;
    private Instant nextAttemptAt;
    private int attempts;
}
