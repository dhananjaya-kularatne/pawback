package com.pawback.pawback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/** Schema mapping for counters updated atomically through JdbcTemplate. */
@Entity
@Table(name = "report_budgets", indexes = @Index(name = "idx_budget_expiry", columnList = "window_started_at"))
@Getter @Setter
public class ReportBudget {
    @Id @Column(length = 100)
    private String budgetKey;
    @Column(nullable = false)
    private int attempts;
    @Column(nullable = false)
    private LocalDateTime windowStartedAt;
}
