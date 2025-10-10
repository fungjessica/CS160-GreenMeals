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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dietary_restrictions`
--

LOCK TABLES `dietary_restrictions` WRITE;
/*!40000 ALTER TABLE `dietary_restrictions` DISABLE KEYS */;
INSERT INTO `dietary_restrictions` VALUES (1,'Gluten-Free','allergen','Contains no gluten'),(2,'Dairy-Free','allergen','Contains no dairy products'),(3,'Nut-Free','allergen','Contains no nuts'),(4,'Shellfish-Free','allergen','Contains no shellfish'),(5,'Egg-Free','allergen','Contains no eggs'),(6,'Soy-Free','allergen','Contains no soy'),(7,'Vegetarian','dietary_preference','No meat or fish'),(8,'Vegan','dietary_preference','No animal products'),(9,'Pescatarian','dietary_preference','Fish allowed, no other meat'),(10,'Keto','dietary_preference','Low carb, high fat'),(11,'Paleo','dietary_preference','No grains, legumes, or processed foods'),(12,'Halal','religious','Prepared according to Islamic law'),(13,'Kosher','religious','Prepared according to Jewish law');
/*!40000 ALTER TABLE `dietary_restrictions` ENABLE KEYS */;
UNLOCK TABLES;

--
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

LOCK TABLES `foods` WRITE;
/*!40000 ALTER TABLE `foods` DISABLE KEYS */;
INSERT INTO `foods` VALUES (1,1,'Surprise Salad Box','Fresh mixed greens with various toppings',12.99,50,NULL,5,'17:00:00','20:00:00','2025-10-10 01:29:44'),(2,1,'Veggie Wrap Bundle','Assorted vegetable wraps',9.99,60,NULL,3,'17:00:00','20:00:00','2025-10-10 01:29:44'),(3,1,'Breakfast Bagel Pack','Assorted bagels with spreads',8.99,55,NULL,4,'08:00:00','11:00:00','2025-10-10 01:29:44'),(4,2,'Pasta Mystery Box','Selection of fresh pasta dishes',15.99,50,NULL,4,'18:00:00','21:00:00','2025-10-10 01:29:44'),(5,2,'Pizza Slices Bundle','4-6 assorted pizza slices',11.99,55,NULL,6,'18:00:00','21:00:00','2025-10-10 01:29:44'),(6,2,'Italian Combo Pack','Mix of pasta, pizza, and salad',18.99,45,NULL,3,'18:00:00','21:00:00','2025-10-10 01:29:44'),(7,3,'Sushi Roll Pack','Assorted sushi rolls',18.99,45,NULL,3,'19:00:00','21:30:00','2025-10-10 01:29:44'),(8,3,'Bento Box Surprise','Mixed bento boxes',14.99,50,NULL,4,'19:00:00','21:30:00','2025-10-10 01:29:44'),(9,3,'Sashimi Selection','Fresh sashimi variety',22.99,40,NULL,2,'19:00:00','21:30:00','2025-10-10 01:29:44'),(10,4,'Vegan Bowl Trio','Three different vegan bowls',16.99,50,NULL,5,'11:00:00','14:00:00','2025-10-10 01:29:44'),(11,4,'Plant Power Pack','Assorted vegan meals',13.99,55,NULL,4,'17:00:00','20:00:00','2025-10-10 01:29:44'),(12,5,'Curry Combo','Selection of curry dishes with rice',14.99,50,NULL,5,'18:00:00','21:00:00','2025-10-10 01:29:44'),(13,5,'Tandoori Mix','Assorted tandoori specialties',17.99,45,NULL,3,'18:00:00','21:00:00','2025-10-10 01:29:44');
/*!40000 ALTER TABLE `foods` ENABLE KEYS */;
UNLOCK TABLES;

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

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `pickup_slots`
--

LOCK TABLES `pickup_slots` WRITE;
/*!40000 ALTER TABLE `pickup_slots` DISABLE KEYS */;
INSERT INTO `pickup_slots` VALUES (1,1,'2025-10-09 17:00:00','2025-10-09 17:30:00',5,'2025-10-10 01:29:44'),(2,1,'2025-10-09 18:00:00','2025-10-09 18:30:00',5,'2025-10-10 01:29:44'),(3,1,'2025-10-09 19:00:00','2025-10-09 19:30:00',5,'2025-10-10 01:29:44'),(4,2,'2025-10-09 18:00:00','2025-10-09 18:30:00',8,'2025-10-10 01:29:44'),(5,2,'2025-10-09 19:00:00','2025-10-09 19:30:00',8,'2025-10-10 01:29:44'),(6,3,'2025-10-09 19:00:00','2025-10-09 19:30:00',6,'2025-10-10 01:29:44'),(7,3,'2025-10-09 20:00:00','2025-10-09 20:30:00',6,'2025-10-10 01:29:44'),(8,1,'2025-10-10 17:00:00','2025-10-10 17:30:00',5,'2025-10-10 01:29:45'),(9,1,'2025-10-10 18:00:00','2025-10-10 18:30:00',5,'2025-10-10 01:29:45'),(10,1,'2025-10-10 19:00:00','2025-10-10 19:30:00',5,'2025-10-10 01:29:45'),(11,2,'2025-10-10 18:00:00','2025-10-10 18:30:00',8,'2025-10-10 01:29:45'),(12,2,'2025-10-10 19:00:00','2025-10-10 19:30:00',8,'2025-10-10 01:29:45'),(13,2,'2025-10-10 20:00:00','2025-10-10 20:30:00',8,'2025-10-10 01:29:45'),(14,3,'2025-10-10 19:00:00','2025-10-10 19:30:00',6,'2025-10-10 01:29:45'),(15,3,'2025-10-10 20:00:00','2025-10-10 20:30:00',6,'2025-10-10 01:29:45'),(16,3,'2025-10-10 21:00:00','2025-10-10 21:30:00',6,'2025-10-10 01:29:45'),(17,4,'2025-10-10 17:00:00','2025-10-10 17:30:00',7,'2025-10-10 01:29:45'),(18,4,'2025-10-10 18:00:00','2025-10-10 18:30:00',7,'2025-10-10 01:29:45'),(19,5,'2025-10-10 18:00:00','2025-10-10 18:30:00',10,'2025-10-10 01:29:45'),(20,5,'2025-10-10 19:00:00','2025-10-10 19:30:00',10,'2025-10-10 01:29:45'),(21,5,'2025-10-10 20:00:00','2025-10-10 20:30:00',10,'2025-10-10 01:29:45'),(22,1,'2025-10-11 17:00:00','2025-10-11 17:30:00',5,'2025-10-10 01:29:45'),(23,1,'2025-10-11 18:00:00','2025-10-11 18:30:00',5,'2025-10-10 01:29:45'),(24,2,'2025-10-11 18:00:00','2025-10-11 18:30:00',8,'2025-10-10 01:29:45'),(25,2,'2025-10-11 19:00:00','2025-10-11 19:30:00',8,'2025-10-10 01:29:45'),(26,3,'2025-10-11 19:00:00','2025-10-11 19:30:00',6,'2025-10-10 01:29:45'),(27,4,'2025-10-11 17:00:00','2025-10-11 17:30:00',7,'2025-10-10 01:29:45'),(28,5,'2025-10-11 18:00:00','2025-10-11 18:30:00',10,'2025-10-10 01:29:45');
/*!40000 ALTER TABLE `pickup_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'Green Plate Cafe','123 Main St, San Jose, CA 95113',37.33820000,-121.88630000,'American','408-555-0100',4.5,'2025-10-10 01:29:44'),(2,'Pasta Paradise','456 Market St, San Jose, CA 95113',37.33520000,-121.89000000,'Italian','408-555-0200',4.3,'2025-10-10 01:29:44'),(3,'Sushi Express','789 First St, San Jose, CA 95113',37.34000000,-121.89250000,'Japanese','408-555-0300',4.7,'2025-10-10 01:29:44'),(4,'Veggie Delight','321 Park Ave, San Jose, CA 95110',37.34500000,-121.89500000,'Vegetarian','408-555-0400',4.6,'2025-10-10 01:29:44'),(5,'Spice Garden','654 Santa Clara St, San Jose, CA 95113',37.33700000,-121.88900000,'Indian','408-555-0500',4.4,'2025-10-10 01:29:44');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

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

LOCK TABLES `user_dietary_restrictions` WRITE;
/*!40000 ALTER TABLE `user_dietary_restrictions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_dietary_restrictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','restaurant') NOT NULL DEFAULT 'customer',
  `restaurant_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User','test@example.com','$2b$10$abcdefghijklmnopqrstuvwxyz123456','408-555-0100','customer',NULL,'2025-10-10 01:29:44'),(2,'Muyi Lin','customer@test.com','$2b$10$GXPsbldVRGgNSDZmILKTQe5KKsxLWaU3jcVmEVFMYgxnNMtp3WevO','4084890304','customer',NULL,'2025-10-10 01:30:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 20:25:52
