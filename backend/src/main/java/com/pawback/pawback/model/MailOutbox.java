package com.pawback.pawback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/** Schema mapping for the transactional mail queue managed through JdbcTemplate. */
@Entity
@Table(name = "mail_outbox", uniqueConstraints = @UniqueConstraint(name = "uq_mail_event", columnNames = "event_key"),
       indexes = {@Index(name = "ix_mail_due", columnList = "status,next_attempt_at"), @Index(name = "ix_mail_created", columnList = "created_at")})
@Getter @Setter
public class MailOutbox {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String eventKey;
    @Column(nullable = false)
    private String recipient;
    @Column(nullable = false)
    private String subject;
    @Column(columnDefinition = "longtext")
    private String payload;
    @Column(nullable = false, length = 16)
    private String kind;
    private Long reportId;
    @Column(nullable = false, length = 16)
    private String status;
    @Column(nullable = false, columnDefinition = "int default 0")
    private int attempts;
    @Column(nullable = false)
    private LocalDateTime nextAttemptAt;
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    private LocalDateTime lockedUntil;
    @Column(length = 36)
    private String lockToken;
    @Column(length = 80)
    private String lastError;
    @Column(nullable = false)
    private LocalDateTime createdAt;
}
