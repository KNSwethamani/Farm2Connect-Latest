CREATE DATABASE IF NOT EXISTS farm2connect;

USE farm2connect;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('FARMER', 'CUSTOMER', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farmer_profiles (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    farm_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    area VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10),
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE customer_profiles (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    address VARCHAR(255),
    area VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE produce (
    produce_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    produce_name VARCHAR(100) NOT NULL UNIQUE,

    FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
);

CREATE TABLE listings (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    produce_id INT NOT NULL,

    quantity DECIMAL(10,2) NOT NULL,
    unit ENUM('kg', 'g', 'ton', 'piece', 'dozen', 'box') NOT NULL,

    expected_price DECIMAL(10,2) NOT NULL,
    quality ENUM('Fresh', 'Premium', 'Good') DEFAULT 'Fresh',

    harvest_date DATE,
    location VARCHAR(255),

    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,

    image_url VARCHAR(500),

    status ENUM('AVAILABLE', 'LOW STOCK', 'SOLD OUT', 'EXPIRED')
        DEFAULT 'AVAILABLE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (farmer_id)
        REFERENCES farmer_profiles(farmer_id)
        ON DELETE CASCADE,

    FOREIGN KEY (produce_id)
        REFERENCES produce(produce_id)
        ON DELETE RESTRICT,

    INDEX idx_listing_produce (produce_id),
    INDEX idx_listing_status (status),
    INDEX idx_listing_farmer (farmer_id)
);

CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (customer_id, listing_id),

    FOREIGN KEY (customer_id)
        REFERENCES customer_profiles(customer_id)
        ON DELETE CASCADE,

    FOREIGN KEY (listing_id)
        REFERENCES listings(listing_id)
        ON DELETE CASCADE
);

CREATE TABLE contact_requests (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    farmer_id INT NOT NULL,
    listing_id INT NOT NULL,

    message TEXT,
    status ENUM('PENDING', 'CONTACTED', 'CLOSED')
        DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customer_profiles(customer_id)
        ON DELETE CASCADE,

    FOREIGN KEY (farmer_id)
        REFERENCES farmer_profiles(farmer_id)
        ON DELETE CASCADE,

    FOREIGN KEY (listing_id)
        REFERENCES listings(listing_id)
        ON DELETE CASCADE
);

CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reported_by INT NOT NULL,
    listing_id INT,
    reason VARCHAR(255) NOT NULL,
    description TEXT,

    status ENUM('PENDING', 'REVIEWED', 'RESOLVED')
        DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reported_by)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (listing_id)
        REFERENCES listings(listing_id)
        ON DELETE SET NULL
);

