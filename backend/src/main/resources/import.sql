-- This file will be executed by Hibernate on application startup
-- It will recreate the crops table with the correct schema

DROP TABLE IF EXISTS crops;

CREATE TABLE crops (
    crop_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(255) NOT NULL,
    batch_id VARCHAR(255) NOT NULL UNIQUE,
    crop_name VARCHAR(255) NOT NULL,
    price VARCHAR(255),
    quantity VARCHAR(255),
    description TEXT,
    crop_type VARCHAR(255),
    variety VARCHAR(255),
    location VARCHAR(255),
    qr_code_url VARCHAR(1024),
    quality_grade VARCHAR(64),
    status VARCHAR(64),
    actual_yield VARCHAR(255),
    estimated_yield VARCHAR(255),
    ai_confidence_score DOUBLE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    sow_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_farmer_id (farmer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Batch summary table for tracking batches
DROP TABLE IF EXISTS batch_records;
CREATE TABLE batch_records (
    batch_id VARCHAR(255) PRIMARY KEY,
    farmer_id VARCHAR(255),
    crop_type VARCHAR(255),
    total_quantity DECIMAL(12,2),
    avg_quality_score DECIMAL(5,2),
    harvest_date DATE,
    status VARCHAR(50),
    qr_code_url VARCHAR(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listings table for marketplace
DROP TABLE IF EXISTS listings;
CREATE TABLE listings (
    listing_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    crop_id BIGINT,
    farmer_id VARCHAR(255),
    batch_id VARCHAR(255),
    price DECIMAL(12,2),
    quantity DECIMAL(12,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_listing_crop (crop_id),
    INDEX idx_listing_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support System Tables
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    reported_by_id VARCHAR(255) NOT NULL,
    reported_by_role VARCHAR(50) NOT NULL,
    reported_against_id VARCHAR(255),
    reported_against_role VARCHAR(50),
    issue_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_ticket_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);