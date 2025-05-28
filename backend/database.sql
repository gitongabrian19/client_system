-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS client_system;
USE client_system;

-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_name VARCHAR(255) NOT NULL,
    device_type ENUM('switch', 'router', 'ap', 'gateway', 'firewall', 'other') DEFAULT 'other',
    mac_address VARCHAR(17) NOT NULL UNIQUE,
    management_ip VARCHAR(15) NOT NULL,
    location_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Create ip_addresses table
CREATE TABLE IF NOT EXISTS ip_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(15) NOT NULL UNIQUE,
    device_id INT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    device_id INT,
    ip_id INT,
    description TEXT,
    contact_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
    FOREIGN KEY (ip_id) REFERENCES ip_addresses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sms_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;