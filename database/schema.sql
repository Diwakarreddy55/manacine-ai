CREATE DATABASE IF NOT EXISTS manacine;
USE manacine;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  prompt LONGTEXT NOT NULL,
  language VARCHAR(30) DEFAULT 'te',
  duration_minutes INT NOT NULL DEFAULT 5,
  status ENUM('draft','queued','generating','rendering','completed','failed') DEFAULT 'draft',
  progress INT DEFAULT 0,
  final_video_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_projects_user (user_id)
);

CREATE TABLE characters (
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

CREATE TABLE scenes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  scene_number INT NOT NULL,
  title VARCHAR(255) NULL,
  description TEXT NOT NULL,
  dialogue LONGTEXT NULL,
  duration_seconds INT DEFAULT 8,
  status ENUM('pending','generating','completed','failed') DEFAULT 'pending',
  image_url TEXT NULL,
  video_url TEXT NULL,
  audio_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_scenes_project (project_id)
);

CREATE TABLE generation_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  status ENUM('queued','running','completed','failed') DEFAULT 'queued',
  progress INT DEFAULT 0,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
