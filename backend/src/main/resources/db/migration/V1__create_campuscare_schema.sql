CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE request_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL,
    sort_order INT NOT NULL,
    CONSTRAINT pk_request_categories PRIMARY KEY (id),
    CONSTRAINT uk_request_categories_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE maintenance_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(24) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    location_text VARCHAR(160) NOT NULL,
    priority VARCHAR(16) NOT NULL,
    status VARCHAR(20) NOT NULL,
    submitted_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    resolved_at DATETIME(6),
    deleted_at DATETIME(6),
    student_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    assigned_admin_id BIGINT,
    CONSTRAINT pk_maintenance_requests PRIMARY KEY (id),
    CONSTRAINT uk_maintenance_requests_public_id UNIQUE (public_id),
    CONSTRAINT fk_maintenance_requests_student
        FOREIGN KEY (student_id) REFERENCES users (id),
    CONSTRAINT fk_maintenance_requests_category
        FOREIGN KEY (category_id) REFERENCES request_categories (id),
    CONSTRAINT fk_maintenance_requests_assigned_admin
        FOREIGN KEY (assigned_admin_id) REFERENCES users (id),
    INDEX idx_maintenance_requests_student_submitted (student_id, submitted_at),
    INDEX idx_maintenance_requests_status_submitted (status, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE request_status_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    note VARCHAR(500),
    changed_at DATETIME(6) NOT NULL,
    request_id BIGINT NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    CONSTRAINT pk_request_status_history PRIMARY KEY (id),
    CONSTRAINT fk_request_status_history_request
        FOREIGN KEY (request_id) REFERENCES maintenance_requests (id),
    CONSTRAINT fk_request_status_history_changed_by
        FOREIGN KEY (changed_by_user_id) REFERENCES users (id),
    INDEX idx_request_status_history_request_changed (request_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO request_categories (name, active, sort_order)
SELECT seed.name, TRUE, seed.sort_order
FROM (
    SELECT 'Electrical' AS name, 1 AS sort_order
    UNION ALL SELECT 'Plumbing', 2
    UNION ALL SELECT 'Furniture', 3
    UNION ALL SELECT 'Cleanliness', 4
    UNION ALL SELECT 'IT & Networking', 5
    UNION ALL SELECT 'Other', 6
) AS seed
WHERE NOT EXISTS (
    SELECT 1
    FROM request_categories AS existing_category
    WHERE existing_category.name = seed.name
);
