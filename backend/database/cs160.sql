-- MySQL dump 10.13  Distrib 8.0.36, for macos14 (arm64)
--
-- Host: 127.0.0.1    Database: too_good_to_go
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dietary_restrictions`
--

DROP TABLE IF EXISTS `dietary_restrictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dietary_restrictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restriction_name` varchar(100) NOT NULL,
  `restriction_type` enum('allergen','dietary_preference','religious') NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--Default data for table `dietary_restrictions`
--
LOCK TABLES `dietary_restrictions` WRITE;
INSERT INTO dietary_restrictions (restriction_name, restriction_type, description) VALUES
('Gluten-Free', 'allergen', 'No gluten or wheat products'),
('Dairy-Free', 'allergen', 'No dairy or lactose'),
('Nut-Free', 'allergen', 'No nuts or nut-derived products'),
('Shellfish-Free', 'allergen', 'No shellfish products'),
('Vegan', 'dietary_preference', 'No animal products'),
('Vegetarian', 'dietary_preference', 'No meat, may include dairy/eggs'),
('Sugar-Free', 'dietary_preference', 'No sugar or sweeteners added'),
('Low Sodium', 'dietary_preference', 'Reduced salt content'),
('Halal', 'religious', 'Prepared according to Islamic law'),
('Kosher', 'religious', 'Prepared according to Jewish law');
UNLOCK TABLES;
-- Table structure for table `food_dietary_compliance`
--

DROP TABLE IF EXISTS `food_dietary_compliance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_dietary_compliance` (
  `food_id` int NOT NULL,
  `restriction_id` int NOT NULL,
  PRIMARY KEY (`food_id`,`restriction_id`),
  KEY `restriction_id` (`restriction_id`),
  CONSTRAINT `food_dietary_compliance_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `food_dietary_compliance_ibfk_2` FOREIGN KEY (`restriction_id`) REFERENCES `dietary_restrictions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_dietary_compliance`
--

LOCK TABLES `food_dietary_compliance` WRITE;
/*!40000 ALTER TABLE `food_dietary_compliance` DISABLE KEYS */;
INSERT INTO `food_dietary_compliance` VALUES (1,1),(7,1),(9,1),(10,1),(12,1),(13,1),(2,2),(7,2),(9,2),(10,2),(13,2),(1,3),(11,3),(9,6),(1,7),(2,7),(3,7),(4,7),(5,7),(6,7),(10,7),(11,7),(12,7),(1,8),(10,8),(11,8),(7,9),(8,9),(9,9),(12,12),(13,12);
/*!40000 ALTER TABLE `food_dietary_compliance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foods`
--

DROP TABLE IF EXISTS `foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `discount_percent` int DEFAULT '0',
  `photo_url` varchar(500) DEFAULT NULL,
  `available_quantity` int DEFAULT '0',
  `pickup_start` time DEFAULT NULL,
  `pickup_end` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `foods_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foods`
--

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `food_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `food_id` (`food_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `pickup_slot_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','ready','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `pickup_slot_id` (`pickup_slot_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`pickup_slot_id`) REFERENCES `pickup_slots` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--
-- Table structure for table `pickup_slots`
--

DROP TABLE IF EXISTS `pickup_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickup_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `slot_start` datetime NOT NULL,
  `slot_end` datetime NOT NULL,
  `max_orders` int NOT NULL DEFAULT '10',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_restaurant_time` (`restaurant_id`,`slot_start`),
  CONSTRAINT `pickup_slots_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;





--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
    id INT NOT NULL AUTO_INCREMENT,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    cuisine_type VARCHAR(100),
    phone VARCHAR(20),
    rating DECIMAL(2,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




--
-- Table structure for table `user_dietary_restrictions`
--

DROP TABLE IF EXISTS `user_dietary_restrictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_dietary_restrictions` (
  `user_id` int NOT NULL,
  `restriction_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`restriction_id`),
  KEY `restriction_id` (`restriction_id`),
  CONSTRAINT `user_dietary_restrictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_dietary_restrictions_ibfk_2` FOREIGN KEY (`restriction_id`) REFERENCES `dietary_restrictions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_dietary_restrictions`
--



--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer','restaurant') DEFAULT 'customer',
    restaurant_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE user_dietary_restrictions;
TRUNCATE TABLE users;
TRUNCATE TABLE restaurants;

-- Step 1: Insert Users
INSERT INTO users (id, name, email, password_hash, phone, role)
VALUES
-- Restaurant owners
(1, 'Alice Chen', 'alice.chen@example.com', '$2b$10$abc1234567890', '415-555-1010', 'restaurant'),
(2, 'Marco Rossi', 'marco.rossi@example.com', '$2b$10$abc1234567890', '408-555-2020', 'restaurant'),
-- Customers
(3, 'Sarah Lee', 'sarah.lee@example.com', '$2b$10$abc1234567890', '510-555-3030', 'customer'),
(4, 'David Kim', 'david.kim@example.com', '$2b$10$abc1234567890', '650-555-4040', 'customer'),
(5, 'Emma Lopez', 'emma.lopez@example.com', '$2b$10$abc1234567890', '831-555-5050', 'customer');

-- Step 2: Insert Restaurants (linked to owners)
TRUNCATE TABLE restaurants;
INSERT INTO restaurants (id, owner_id, name, address, latitude, longitude, cuisine_type, phone, rating)
VALUES
(1, 1, 'Golden Dragon', '123 Market St, San Francisco, CA', 37.774929, -122.419416, 'Chinese', '415-555-1234', 4.5),
(2, 2, 'La Bella Vita', '456 Mission Blvd, San Jose, CA', 37.338208, -121.886329, 'Italian', '408-555-5678', 4.3),
(3, 3, 'Green Garden', '321 Blossom Hill Rd, Los Gatos, CA', 37.226611, -121.974678, 'Vegan', '408-555-3456', 4.6),
(4, 4, 'El Ranchito', '654 Main St, Santa Clara, CA', 37.354108, -121.955238, 'Mexican', '408-555-7890', 4.4),
(5, 5, 'Sushi Zen', '987 Pacific Ave, Santa Cruz, CA', 36.974117, -122.030792, 'Japanese', '831-555-4321', 4.8);

-- Link restaurant to owner (users table)
UPDATE users SET restaurant_id = id WHERE id <= 5;

-- FOODS
TRUNCATE TABLE foods;
INSERT INTO foods (id, restaurant_id, name, description, price, discount_percent, photo_url, available_quantity, pickup_start, pickup_end)
VALUES
(1, 1, 'Kung Pao Chicken', 'Spicy stir-fried chicken with peanuts', 12.99, 10, 'https://example.com/kungpao.jpg', 20, '11:00:00', '15:00:00'),
(2, 2, 'Margherita Pizza', 'Classic Italian pizza with mozzarella and basil', 10.50, 0, 'https://example.com/pizza.jpg', 15, '11:00:00', '16:00:00'),
(3, 3, 'Vegan Buddha Bowl', 'Healthy mixed bowl with tofu and veggies', 9.75, 5, 'https://example.com/buddha.jpg', 25, '10:00:00', '14:00:00'),
(4, 4, 'Taco Platter', 'Assorted beef, chicken, and veggie tacos', 11.25, 15, 'https://example.com/tacos.jpg', 30, '12:00:00', '17:00:00'),
(5, 5, 'Salmon Sushi Roll', 'Fresh salmon roll with wasabi and soy sauce', 8.99, 0, 'https://example.com/sushi.jpg', 40, '11:00:00', '15:00:00');

-- FOOD_DIETARY_COMPLIANCE
TRUNCATE TABLE food_dietary_compliance;
INSERT INTO food_dietary_compliance (food_id, restriction_id)
VALUES
(1, 3), -- Kung Pao Chicken: nut-free
(2, 6), -- Margherita Pizza: vegetarian
(3, 5), -- Buddha Bowl: vegan
(4, 9), -- Taco Platter: halal
(5, 10); -- Sushi Roll: kosher


-- USER_DIETARY_RESTRICTIONS
TRUNCATE TABLE user_dietary_restrictions;
INSERT INTO user_dietary_restrictions (user_id, restriction_id)
VALUES
(3, 5), -- Sarah: Vegan
(3, 7), -- Sarah: Sugar-Free
(4, 9), -- David: Halal
(5, 6), -- Emma: Vegetarian
(5, 10); -- Emma: Kosher

-- PICKUP_SLOTS
TRUNCATE TABLE pickup_slots;
INSERT INTO pickup_slots (id, restaurant_id, slot_start, slot_end, max_orders)
VALUES
(1, 1, '2025-10-29 11:00:00', '2025-10-29 12:00:00', 10),
(2, 2, '2025-10-29 12:00:00', '2025-10-29 13:00:00', 8),
(3, 3, '2025-10-29 13:00:00', '2025-10-29 14:00:00', 10),
(4, 4, '2025-10-29 14:00:00', '2025-10-29 15:00:00', 12),
(5, 5, '2025-10-29 15:00:00', '2025-10-29 16:00:00', 10);

-- ORDERS
TRUNCATE TABLE orders;
INSERT INTO orders (id, user_id, restaurant_id, pickup_slot_id, total_amount, status)
VALUES
(1, 3, 1, 1, 25.98, 'confirmed'),
(2, 4, 2, 2, 10.50, 'pending'),
(3, 5, 3, 3, 9.75, 'ready'),
(4, 3, 4, 4, 22.50, 'completed'),
(5, 4, 5, 5, 17.98, 'cancelled');

-- ORDER_ITEMS
TRUNCATE TABLE order_items;
INSERT INTO order_items (id, order_id, food_id, quantity, price)
VALUES
(1, 1, 1, 2, 12.99),
(2, 2, 2, 1, 10.50),
(3, 3, 3, 1, 9.75),
(4, 4, 4, 2, 11.25),
(5, 5, 5, 2, 8.99);


ALTER TABLE foods ADD COLUMN is_deleted TINYINT(1) DEFAULT 0;

SET FOREIGN_KEY_CHECKS = 1;

