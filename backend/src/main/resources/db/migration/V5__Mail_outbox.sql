CREATE TABLE mail_outbox (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 event_key VARCHAR(100) NOT NULL UNIQUE,
 recipient VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL,
 payload LONGTEXT, kind VARCHAR(16) NOT NULL, report_id BIGINT,
 status VARCHAR(16) NOT NULL DEFAULT 'PENDING', attempts INT NOT NULL DEFAULT 0,
 next_attempt_at DATETIME(6) NOT NULL, expires_at DATETIME(6) NOT NULL,
 locked_until DATETIME(6), lock_token VARCHAR(36), last_error VARCHAR(80),
 created_at DATETIME(6) NOT NULL,
 INDEX ix_mail_due(status,next_attempt_at), INDEX ix_mail_created(created_at)
);
