CREATE TABLE IF NOT EXISTS users (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(255) NOT NULL UNIQUE,
 password_hash VARCHAR(255), name VARCHAR(255), phone VARCHAR(255),
 provider ENUM('GOOGLE','LOCAL'), provider_id VARCHAR(255),
 role ENUM('ADMIN','OWNER'), enabled BIT NOT NULL,
 reset_otp_hash VARCHAR(255), reset_otp_expiry DATETIME(6)
);
CREATE TABLE IF NOT EXISTS pets (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 pet_uuid BINARY(16) NOT NULL UNIQUE,
 name VARCHAR(255) NOT NULL, photo_url VARCHAR(255) NOT NULL,
 qr_code_url VARCHAR(255), breed VARCHAR(255), description VARCHAR(255),
 if_found_instructions VARCHAR(255), status ENUM('LOST','SAFE'),
 owner_id BIGINT NOT NULL, deleted_at DATETIME(6),
 CONSTRAINT fk_pet_owner FOREIGN KEY(owner_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS scan_reports (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 message VARCHAR(255) NOT NULL, photo_url VARCHAR(255),
 latitude DOUBLE, longitude DOUBLE, pet_id BIGINT NOT NULL, created_at DATETIME(6),
 CONSTRAINT fk_report_pet FOREIGN KEY(pet_id) REFERENCES pets(id)
);
