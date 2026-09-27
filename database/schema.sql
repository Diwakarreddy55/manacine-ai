USE manacine;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    prompt LONGTEXT NOT NULL,
    language VARCHAR(30) DEFAULT 'te',
    duration_minutes INT NOT NULL DEFAULT 5,
    status ENUM(
        'draft',
        'queued',
        'generating',
        'rendering',
        'completed',
        'failed'
    ) DEFAULT 'draft',
    progress INT DEFAULT 0,
    final_video_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_user (user_id)
);

CREATE TABLE IF NOT EXISTS characters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    role_name VARCHAR(120) NULL,
    gender VARCHAR(30) NULL,
    age INT NULL,
    appearance TEXT NULL,
    personality TEXT NULL,
    reference_image_url TEXT NULL,
    voice_id VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scenes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    scene_number INT NOT NULL,
    title VARCHAR(255) NULL,
    description TEXT NOT NULL,
    dialogue LONGTEXT NULL,
    duration_seconds INT DEFAULT 8,
    status ENUM(
        'pending',
        'generating',
        'completed',
        'failed'
    ) DEFAULT 'pending',
    image_url TEXT NULL,
    video_url TEXT NULL,
    audio_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_scenes_project (project_id)
);

CREATE TABLE IF NOT EXISTS generation_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    status ENUM(
        'queued',
        'running',
        'completed',
        'failed'
    ) DEFAULT 'queued',
    progress INT DEFAULT 0,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    project_id BIGINT UNSIGNED NULL,
    scene_id BIGINT UNSIGNED NULL,
    asset_type ENUM(
        'image',
        'video',
        'audio',
        'music',
        'voice',
        'thumbnail',
        'final_video'
    ) NOT NULL,
    provider VARCHAR(100) NULL,
    provider_asset_id VARCHAR(255) NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NULL,
    mime_type VARCHAR(100) NULL,
    file_size BIGINT UNSIGNED NULL,
    duration_seconds DECIMAL(10,2) NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    FOREIGN KEY (scene_id)
        REFERENCES scenes(id)
        ON DELETE CASCADE,

    INDEX idx_media_project (project_id),
    INDEX idx_media_scene (scene_id),
    INDEX idx_media_user (user_id)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_cycle ENUM(
        'free',
        'monthly',
        'yearly'
    ) DEFAULT 'monthly',

    max_projects INT DEFAULT 1,
    max_video_minutes INT DEFAULT 5,
    max_generations INT DEFAULT 5,

    features JSON NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,

    status ENUM(
        'active',
        'cancelled',
        'expired',
        'trial'
    ) DEFAULT 'active',

    starts_at DATETIME NOT NULL,
    ends_at DATETIME NULL,

    provider VARCHAR(100) NULL,
    provider_subscription_id VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (plan_id)
        REFERENCES subscription_plans(id),

    INDEX idx_subscription_user (user_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,
    subscription_id BIGINT UNSIGNED NULL,

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',

    provider VARCHAR(100) NULL,
    provider_payment_id VARCHAR(255) NULL,
    provider_order_id VARCHAR(255) NULL,

    status ENUM(
        'created',
        'pending',
        'success',
        'failed',
        'refunded'
    ) DEFAULT 'created',

    payment_method VARCHAR(50) NULL,

    metadata JSON NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (subscription_id)
        REFERENCES user_subscriptions(id)
        ON DELETE SET NULL,

    INDEX idx_payment_user (user_id)
);

CREATE TABLE IF NOT EXISTS usage_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,

    usage_type VARCHAR(100) NOT NULL,

    quantity DECIMAL(12,2) DEFAULT 1,

    provider VARCHAR(100) NULL,

    metadata JSON NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL,

    INDEX idx_usage_user (user_id),
    INDEX idx_usage_project (project_id)
);

INSERT INTO subscription_plans
(
    name,
    description,
    price,
    currency,
    billing_cycle,
    max_projects,
    max_video_minutes,
    max_generations,
    features
)
VALUES
(
    'Free',
    'Free ManaCine plan',
    0,
    'INR',
    'free',
    2,
    5,
    5,
    JSON_OBJECT(
        'telugu', true,
        'basic_video', true,
        'watermark', true
    )
),
(
    'Creator',
    'Creator plan',
    499,
    'INR',
    'monthly',
    20,
    20,
    50,
    JSON_OBJECT(
        'telugu', true,
        'basic_video', true,
        'watermark', false
    )
),
(
    'Studio',
    'Studio plan',
    1499,
    'INR',
    'monthly',
    100,
    60,
    200,
    JSON_OBJECT(
        'telugu', true,
        'advanced_video', true,
        'watermark', false
    )
);