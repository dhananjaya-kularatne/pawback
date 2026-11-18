-- Old reset codes must not cross the reset-policy/timezone transition.
UPDATE users SET reset_otp_hash=NULL, reset_otp_expiry=NULL;
CREATE UNIQUE INDEX uq_user_provider_identity ON users(provider,provider_id);
