-- ===================================================================
-- AI-Powered Transport Demand Prediction System
-- MySQL Schema (production). The Flask app ships with SQLite by
-- default for zero-config local/demo use — run this file against
-- MySQL and switch DB_ENGINE=mysql in backend/.env to go to production.
-- ===================================================================

CREATE DATABASE IF NOT EXISTS transport_ai;
USE transport_ai;

CREATE TABLE passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_name VARCHAR(150) NOT NULL,
    org_type ENUM('Bus','Train','Flight','Multi-modal') NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km DECIMAL(8,2),
    org_id INT,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    vehicle_type ENUM('Bus','Train','Flight') NOT NULL,
    identifier VARCHAR(50),
    capacity INT NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('passenger','organization') NOT NULL,
    user_id INT NOT NULL,
    transport_mode VARCHAR(20),
    source VARCHAR(100),
    destination VARCHAR(100),
    travel_date DATE,
    predicted_demand DECIMAL(6,2),
    predicted_occupancy DECIMAL(6,2),
    predicted_revenue DECIMAL(12,2),
    predicted_seat_availability INT,
    recommendation_score DECIMAL(5,2),
    raw_response JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    route_id INT,
    transport_mode VARCHAR(20),
    travel_date DATE,
    fare DECIMAL(10,2),
    status ENUM('Confirmed','Waitlisted','Cancelled') DEFAULT 'Confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES passengers(id)
);

CREATE TABLE seat_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    travel_date DATE,
    total_seats INT,
    booked_seats INT,
    available_seats INT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE revenue_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT NOT NULL,
    travel_date DATE,
    revenue DECIMAL(12,2),
    profit DECIMAL(12,2),
    fuel_cost DECIMAL(12,2),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE TABLE weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100),
    date DATE,
    condition_text VARCHAR(50),
    temperature DECIMAL(5,2)
);

CREATE TABLE demand_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT,
    transport_mode VARCHAR(20),
    date DATE,
    demand_score DECIMAL(6,2),
    occupancy_pct DECIMAL(6,2),
    FOREIGN KEY (route_id) REFERENCES routes(id)
);
