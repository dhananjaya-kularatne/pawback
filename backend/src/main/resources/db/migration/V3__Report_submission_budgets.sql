ALTER TABLE scan_reports ADD COLUMN submission_key VARCHAR(64), ADD COLUMN request_hash VARCHAR(64);
CREATE UNIQUE INDEX uk_report_submission_key ON scan_reports(submission_key);
CREATE TABLE report_budgets (
 budget_key VARCHAR(100) PRIMARY KEY,
 attempts INT NOT NULL,
 window_started_at DATETIME(6) NOT NULL,
 INDEX idx_budget_expiry(window_started_at)
);
