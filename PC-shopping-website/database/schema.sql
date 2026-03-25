-- database/schema.sql
-- Run this in phpMyAdmin or via: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS gaming_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gaming_store;

-- Admin accounts (managed manually or via seeding)
CREATE TABLE IF NOT EXISTS admin (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- bcrypt hash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer accounts (self-registered)
CREATE TABLE IF NOT EXISTS customer (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- bcrypt hash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products (image stores filename only, file lives in /uploads/products/)
CREATE TABLE IF NOT EXISTS product (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    description TEXT,
    image       VARCHAR(255),          -- filename only e.g. "prod_abc123.jpg"
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total       DECIMAL(10,2) NOT NULL,
    status      VARCHAR(50) DEFAULT 'Pending',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Order line items
CREATE TABLE IF NOT EXISTS order_item (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Seed: default admin (password = "admin123" — change immediately!)
INSERT IGNORE INTO admin (name, email, password)
VALUES ('Admin', 'admin@msistore.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
