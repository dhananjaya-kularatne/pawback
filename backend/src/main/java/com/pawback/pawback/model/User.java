package com.pawback.pawback.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uq_user_provider_identity", columnNames = {"provider", "provider_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash; // nullable â€” null for OAuth-only users

    private String name;
    private String phone;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.OWNER;

    @Builder.Default
    private boolean enabled = true;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "bigint default 0")
    private long tokenVersion = 0;
    @Builder.Default
    @Column(nullable = false, columnDefinition = "int default 0")
    private int resetOtpAttempts = 0;
    private String resetOtpHash;
    private java.time.LocalDateTime resetOtpExpiry;
}
