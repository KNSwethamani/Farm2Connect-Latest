USE farm2connect;

-- ===============================
-- CATEGORIES
-- ===============================

INSERT INTO categories (category_name)
VALUES
('Vegetables'),
('Fruits'),
('Leafy Greens');


-- ===============================
-- PRODUCE
-- ===============================

INSERT INTO produce (category_id, produce_name)
VALUES
(1, 'Tomato'),
(1, 'Onion'),
(1, 'Carrot'),
(1, 'Brinjal'),
(2, 'Apple'),
(2, 'Banana'),
(3, 'Spinach');


-- ===============================
-- FARMER USERS
-- ===============================

INSERT INTO users
(full_name, email, phone, password_hash, role)
VALUES
(
    'Arun Kumar',
    'arunfarmer@gmail.com',
    '9000000001',
    '$2a$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'FARMER'
),
(
    'Suresh Kumar',
    'sureshfarmer@gmail.com',
    '9000000002',
    '$2a$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'FARMER'
);


-- ===============================
-- FARMER PROFILES
-- ===============================

INSERT INTO farmer_profiles
(user_id, farm_name, address, area, district, city, pincode, description, is_verified)
VALUES
(
    1,
    'Arun Fresh Farms',
    'Main Road',
    'Chengalpattu',
    'Chengalpattu',
    'Chengalpattu',
    '603001',
    'Fresh vegetables directly from our farm.',
    TRUE
),
(
    2,
    'Suresh Organic Farm',
    'Farm Road',
    'Kanchipuram',
    'Kanchipuram',
    'Kanchipuram',
    '631501',
    'Fresh and quality farm produce.',
    TRUE
);


-- ===============================
-- CUSTOMER USER
-- ===============================

INSERT INTO users
(full_name, email, phone, password_hash, role)
VALUES
(
    'Test Customer',
    'customer@gmail.com',
    '9000000003',
    '$2a$10$abcdefghijklmnopqrstuu123456789012345678901234567890',
    'CUSTOMER'
);


-- ===============================
-- CUSTOMER PROFILE
-- ===============================

INSERT INTO customer_profiles
(user_id, address, area, district, city, pincode)
VALUES
(
    3,
    'Customer Address',
    'Tambaram',
    'Chengalpattu',
    'Chennai',
    '600045'
);


-- ===============================
-- FARMER LISTINGS
-- ===============================

INSERT INTO listings
(
    farmer_id,
    produce_id,
    quantity,
    unit,
    expected_price,
    quality,
    harvest_date,
    location,
    pickup_available,
    delivery_available,
    status
)
VALUES
(
    1,
    1,
    100,
    'kg',
    30,
    'Fresh',
    CURDATE(),
    'Chengalpattu',
    TRUE,
    FALSE,
    'AVAILABLE'
),
(
    1,
    2,
    200,
    'kg',
    28,
    'Fresh',
    CURDATE(),
    'Chengalpattu',
    TRUE,
    FALSE,
    'AVAILABLE'
),
(
    2,
    3,
    80,
    'kg',
    45,
    'Premium',
    CURDATE(),
    'Kanchipuram',
    TRUE,
    TRUE,
    'AVAILABLE'
),
(
    2,
    5,
    60,
    'kg',
    120,
    'Good',
    CURDATE(),
    'Kanchipuram',
    TRUE,
    TRUE,
    'AVAILABLE'
);

