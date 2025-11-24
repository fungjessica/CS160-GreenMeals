-- MySQL dump structure and data for GreenMeals
-- Includes 50 restaurants and extensive food mappings

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Drop existing tables to reset state
--
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `pickup_slots`;
DROP TABLE IF EXISTS `food_dietary_compliance`;
DROP TABLE IF EXISTS `user_dietary_restrictions`;
DROP TABLE IF EXISTS `foods`;
DROP TABLE IF EXISTS `restaurants`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `dietary_restrictions`;
SET FOREIGN_KEY_CHECKS = 1;

--
-- Table structure for table `dietary_restrictions`
--
CREATE TABLE `dietary_restrictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restriction_name` varchar(100) NOT NULL,
  `restriction_type` enum('allergen','dietary_preference','religious') NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dietary_restrictions`
--
INSERT INTO dietary_restrictions (id, restriction_name, restriction_type, description) VALUES
(1, 'Gluten-Free', 'allergen', 'No gluten or wheat products'),
(2, 'Dairy-Free', 'allergen', 'No dairy or lactose'),
(3, 'Nut-Free', 'allergen', 'No nuts or nut-derived products'),
(4, 'Shellfish-Free', 'allergen', 'No shellfish products'),
(5, 'Vegan', 'dietary_preference', 'No animal products'),
(6, 'Vegetarian', 'dietary_preference', 'No meat, may include dairy/eggs'),
(7, 'Sugar-Free', 'dietary_preference', 'No sugar or sweeteners added'),
(8, 'Low Sodium', 'dietary_preference', 'Reduced salt content'),
(9, 'Halal', 'religious', 'Prepared according to Islamic law'),
(10, 'Kosher', 'religious', 'Prepared according to Jewish law');

--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20),
  `role` enum('customer','restaurant') DEFAULT 'customer',
  `restaurant_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
-- All passwords are 'password123' hashed with bcrypt
--
INSERT INTO `users` (id, name, email, password_hash, phone, role) VALUES 
(1, 'John Doe', 'john@example.com', '$2b$10$abc1234567890', '555-0100', 'customer'),
(2, 'Jane Smith', 'jane@example.com', '$2b$10$abc1234567890', '555-0101', 'customer'),
-- Restaurant Owners (IDs 3-52)
(3, 'Mario Rossi', 'mario@italy.com', '$2b$10$abc1234567890', '555-0001', 'restaurant'),
(4, 'Kenji Sato', 'kenji@sushi.com', '$2b$10$abc1234567890', '555-0002', 'restaurant'),
(5, 'Carlos Garcia', 'carlos@tacos.com', '$2b$10$abc1234567890', '555-0003', 'restaurant'),
(6, 'Priya Patel', 'priya@spice.com', '$2b$10$abc1234567890', '555-0004', 'restaurant'),
(7, 'Sam Smith', 'sam@burger.com', '$2b$10$abc1234567890', '555-0005', 'restaurant'),
(8, 'Noy Sompong', 'noy@thai.com', '$2b$10$abc1234567890', '555-0006', 'restaurant'),
(9, 'Wei Chen', 'wei@dragon.com', '$2b$10$abc1234567890', '555-0007', 'restaurant'),
(10, 'Ahmed Hassan', 'ahmed@falafel.com', '$2b$10$abc1234567890', '555-0008', 'restaurant'),
(11, 'Lisa Green', 'lisa@vegan.com', '$2b$10$abc1234567890', '555-0009', 'restaurant'),
(12, 'Marie Curie', 'marie@bakery.com', '$2b$10$abc1234567890', '555-0010', 'restaurant'),
(13, 'Luigi Verde', 'luigi@pasta.com', '$2b$10$abc1234567890', '555-0011', 'restaurant'),
(14, 'Yuki Tanaka', 'yuki@ramen.com', '$2b$10$abc1234567890', '555-0012', 'restaurant'),
(15, 'Diego Luna', 'diego@burrito.com', '$2b$10$abc1234567890', '555-0013', 'restaurant'),
(16, 'Rahul Sharma', 'rahul@curry.com', '$2b$10$abc1234567890', '555-0014', 'restaurant'),
(17, 'Jack Black', 'jack@bbq.com', '$2b$10$abc1234567890', '555-0015', 'restaurant'),
(18, 'Ben White', 'ben@pizza.com', '$2b$10$abc1234567890', '555-0016', 'restaurant'),
(19, 'Sarah Connor', 'sarah@salad.com', '$2b$10$abc1234567890', '555-0017', 'restaurant'),
(20, 'Mike Tyson', 'mike@wings.com', '$2b$10$abc1234567890', '555-0018', 'restaurant'),
(21, 'Gordon R', 'gordon@hells.com', '$2b$10$abc1234567890', '555-0019', 'restaurant'),
(22, 'Jamie O', 'jamie@fresh.com', '$2b$10$abc1234567890', '555-0020', 'restaurant'),
(23, 'Alice Waters', 'alice@organic.com', '$2b$10$abc1234567890', '555-0021', 'restaurant'),
(24, 'David Chang', 'david@momofuku.com', '$2b$10$abc1234567890', '555-0022', 'restaurant'),
(25, 'Julia Child', 'julia@french.com', '$2b$10$abc1234567890', '555-0023', 'restaurant'),
(26, 'Anthony B', 'tony@travel.com', '$2b$10$abc1234567890', '555-0024', 'restaurant'),
(27, 'Guy Fieri', 'guy@diner.com', '$2b$10$abc1234567890', '555-0025', 'restaurant'),
(28, 'Wolfgang P', 'wolf@spago.com', '$2b$10$abc1234567890', '555-0026', 'restaurant'),
(29, 'Emeril L', 'emeril@bam.com', '$2b$10$abc1234567890', '555-0027', 'restaurant'),
(30, 'Bobby Flay', 'bobby@grill.com', '$2b$10$abc1234567890', '555-0028', 'restaurant'),
(31, 'Giada L', 'giada@home.com', '$2b$10$abc1234567890', '555-0029', 'restaurant'),
(32, 'Rachael Ray', 'rachael@yum.com', '$2b$10$abc1234567890', '555-0030', 'restaurant'),
(33, 'Ina Garten', 'ina@barefoot.com', '$2b$10$abc1234567890', '555-0031', 'restaurant'),
(34, 'Alton Brown', 'alton@science.com', '$2b$10$abc1234567890', '555-0032', 'restaurant'),
(35, 'Martha S', 'martha@goodthings.com', '$2b$10$abc1234567890', '555-0033', 'restaurant'),
(36, 'Snoop Dogg', 'snoop@kitchen.com', '$2b$10$abc1234567890', '555-0034', 'restaurant'),
(37, 'Padma L', 'padma@topchef.com', '$2b$10$abc1234567890', '555-0035', 'restaurant'),
(38, 'Tom C', 'tom@colicchio.com', '$2b$10$abc1234567890', '555-0036', 'restaurant'),
(39, 'Cat Cora', 'cat@ironchef.com', '$2b$10$abc1234567890', '555-0037', 'restaurant'),
(40, 'Masaharu M', 'mora@sushi.com', '$2b$10$abc1234567890', '555-0038', 'restaurant'),
(41, 'Nobu M', 'nobu@matsuhisa.com', '$2b$10$abc1234567890', '555-0039', 'restaurant'),
(42, 'Jiro O', 'jiro@dreams.com', '$2b$10$abc1234567890', '555-0040', 'restaurant'),
(43, 'Dominique C', 'dom@crenn.com', '$2b$10$abc1234567890', '555-0041', 'restaurant'),
(44, 'Thomas K', 'thomas@laundry.com', '$2b$10$abc1234567890', '555-0042', 'restaurant'),
(45, 'Rene R', 'rene@noma.com', '$2b$10$abc1234567890', '555-0043', 'restaurant'),
(46, 'Massimo B', 'massimo@osteria.com', '$2b$10$abc1234567890', '555-0044', 'restaurant'),
(47, 'Heston B', 'heston@fatduck.com', '$2b$10$abc1234567890', '555-0045', 'restaurant'),
(48, 'Ferran A', 'ferran@elbulli.com', '$2b$10$abc1234567890', '555-0046', 'restaurant'),
(49, 'Grant A', 'grant@alinea.com', '$2b$10$abc1234567890', '555-0047', 'restaurant'),
(50, 'Daniel H', 'daniel@eleven.com', '$2b$10$abc1234567890', '555-0048', 'restaurant'),
(51, 'Eric R', 'eric@lebernardin.com', '$2b$10$abc1234567890', '555-0049', 'restaurant'),
(52, 'Jose A', 'jose@bazaar.com', '$2b$10$abc1234567890', '555-0050', 'restaurant');

--
-- Table structure for table `restaurants`
--
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_owner` (`owner_id`),
  CONSTRAINT `fk_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurants`
--
INSERT INTO `restaurants` (id, owner_id, name, address, latitude, longitude, cuisine_type, phone, rating) VALUES
(1, 3, 'Luigis Trattoria', '123 Little Italy Way, San Jose, CA', 37.3382, -121.8863, 'Italian', '408-555-0101', 4.5),
(2, 4, 'Sakura Sushi', '456 Japantown Dr, San Jose, CA', 37.3489, -121.8942, 'Japanese', '408-555-0102', 4.8),
(3, 5, 'Tacos El Guero', '789 Eastside Blvd, San Jose, CA', 37.3500, -121.8500, 'Mexican', '408-555-0103', 4.2),
(4, 6, 'Spice of India', '321 El Camino Real, Santa Clara, CA', 37.3541, -121.9552, 'Indian', '408-555-0104', 4.6),
(5, 7, 'Burger Barn', '654 The Alameda, San Jose, CA', 37.3300, -121.9000, 'American', '408-555-0105', 4.0),
(6, 8, 'Thai Orchid', '987 First St, San Jose, CA', 37.3350, -121.8900, 'Thai', '408-555-0106', 4.4),
(7, 9, 'Golden Dragon', '147 Chinatown Alley, San Francisco, CA', 37.7941, -122.4078, 'Chinese', '415-555-0107', 4.3),
(8, 10, 'Mediterranean Oasis', '258 Falafel Ln, Sunnyvale, CA', 37.3688, -122.0363, 'Mediterranean', '408-555-0108', 4.7),
(9, 11, 'Earthly Delights', '369 Green St, Palo Alto, CA', 37.4419, -122.1430, 'Vegan', '650-555-0109', 4.9),
(10, 12, 'Sweet Tooth Bakery', '741 Sugar Ave, Mountain View, CA', 37.3861, -122.0839, 'Bakery', '650-555-0110', 4.8),
(11, 13, 'Pasta Palace', '852 Noodle Rd, Campbell, CA', 37.2872, -121.9455, 'Italian', '408-555-0111', 4.1),
(12, 14, 'Ramen House', '963 Soup St, Cupertino, CA', 37.3230, -122.0322, 'Japanese', '408-555-0112', 4.6),
(13, 15, 'Burrito Bros', '159 Salsa Way, Milpitas, CA', 37.4323, -121.8996, 'Mexican', '408-555-0113', 4.3),
(14, 16, 'Curry Corner', '357 Naan Ln, Fremont, CA', 37.5485, -121.9886, 'Indian', '510-555-0114', 4.5),
(15, 17, 'Texas BBQ Pit', '753 Ribs Rd, Gilroy, CA', 37.0058, -121.5683, 'American', '408-555-0115', 4.7),
(16, 18, 'Pizza Express', '951 Cheese Dr, Morgan Hill, CA', 37.1305, -121.6544, 'Italian', '408-555-0116', 3.9),
(17, 19, 'Fresh Greens', '147 Lettuce Ln, Los Altos, CA', 37.3861, -122.1180, 'Vegan', '650-555-0117', 4.6),
(18, 20, 'Wing Stop', '258 Chicken Blvd, Newark, CA', 37.5297, -122.0400, 'American', '510-555-0118', 4.2),
(19, 21, 'Hells Kitchen', '369 Gordon Way, San Jose, CA', 37.3382, -121.8863, 'American', '408-555-0119', 4.9),
(20, 22, 'Jamies Italian', '741 Oliver St, Santa Clara, CA', 37.3541, -121.9552, 'Italian', '408-555-0120', 4.4),
(21, 23, 'Chez Panisse', '1517 Shattuck Ave, Berkeley, CA', 37.8768, -122.2695, 'French', '510-555-0121', 4.8),
(22, 24, 'Momofuku', '852 Peach Dr, San Jose, CA', 37.3382, -121.8863, 'Asian Fusion', '408-555-0122', 4.7),
(23, 25, 'French Laundry', '6640 Washington St, Yountville, CA', 38.4044, -122.3647, 'French', '707-555-0123', 5.0),
(24, 26, 'No Reservations', '987 Travel Ln, San Francisco, CA', 37.7749, -122.4194, 'International', '415-555-0124', 4.5),
(25, 27, 'Flavor Town', '123 Diner Dr, San Jose, CA', 37.3382, -121.8863, 'American', '408-555-0125', 4.1),
(26, 28, 'Spago', '456 Sunset Blvd, Beverly Hills, CA', 34.0736, -118.4004, 'Californian', '310-555-0126', 4.6),
(27, 29, 'Bam Kitchen', '789 Spice Way, New Orleans, LA', 29.9511, -90.0715, 'Cajun', '504-555-0127', 4.4),
(28, 30, 'Mesa Grill', '321 Cactus Rd, Las Vegas, NV', 36.1699, -115.1398, 'Southwestern', '702-555-0128', 4.5),
(29, 31, 'Giadas', '654 Lemon Ln, Las Vegas, NV', 36.1699, -115.1398, 'Italian', '702-555-0129', 4.3),
(30, 32, 'Yum-o', '987 EVOO St, New York, NY', 40.7128, -74.0060, 'American', '212-555-0130', 4.0),
(31, 33, 'Barefoot Contessa', '147 Hamptons Hwy, East Hampton, NY', 40.9634, -72.1848, 'American', '631-555-0131', 4.9),
(32, 34, 'Good Eats', '258 Science Way, Atlanta, GA', 33.7490, -84.3880, 'American', '404-555-0132', 4.7),
(33, 35, 'Marthas Table', '369 Home Dr, Bedford, NY', 41.2043, -73.6437, 'American', '914-555-0133', 4.8),
(34, 36, 'Dogghouse', '741 Gin Ln, Los Angeles, CA', 34.0522, -118.2437, 'Soul Food', '323-555-0134', 4.6),
(35, 37, 'Top Chef Kitchen', '852 Bravo Blvd, New York, NY', 40.7128, -74.0060, 'Fusion', '212-555-0135', 4.5),
(36, 38, 'Craft', '963 Artisan Way, New York, NY', 40.7128, -74.0060, 'American', '212-555-0136', 4.6),
(37, 39, 'Kouzzina', '159 Boardwalk, Orlando, FL', 28.5383, -81.3792, 'Greek', '407-555-0137', 4.4),
(38, 40, 'Morimoto', '357 Iron Chef Dr, Philadelphia, PA', 39.9526, -75.1652, 'Japanese', '215-555-0138', 4.7),
(39, 41, 'Nobu', '753 Malibu Rd, Malibu, CA', 34.0259, -118.7798, 'Japanese', '310-555-0139', 4.8),
(40, 42, 'Sukiyabashi Jiro', '951 Subway St, Tokyo, JP', 35.6895, 139.6917, 'Sushi', '03-555-0140', 5.0),
(41, 43, 'Atelier Crenn', '147 Poetic Ln, San Francisco, CA', 37.7749, -122.4194, 'French', '415-555-0141', 4.9),
(42, 44, 'Per Se', '258 Central Park S, New York, NY', 40.7680, -73.9819, 'French', '212-555-0142', 4.9),
(43, 45, 'Noma', '369 Nordic Way, Copenhagen, DK', 55.6761, 12.5683, 'New Nordic', '45-555-0143', 4.9),
(44, 46, 'Osteria Francescana', '741 Modena St, Modena, IT', 44.6471, 10.9252, 'Italian', '39-555-0144', 5.0),
(45, 47, 'The Fat Duck', '852 Bray Rd, Bray, UK', 51.5099, -0.7032, 'Modern', '44-555-0145', 4.8),
(46, 48, 'El Bulli', '963 Cala Montjoi, Roses, ES', 42.2570, 3.2276, 'Molecular', '34-555-0146', 5.0),
(47, 49, 'Alinea', '159 Halsted St, Chicago, IL', 41.9134, -87.6482, 'Modern', '312-555-0147', 5.0),
(48, 50, 'Eleven Madison Park', '357 Madison Ave, New York, NY', 40.7417, -73.9872, 'American', '212-555-0148', 4.9),
(49, 51, 'Le Bernardin', '753 51st St, New York, NY', 40.7615, -73.9818, 'Seafood', '212-555-0149', 4.9),
(50, 52, 'The Bazaar', '951 Cienega Blvd, Los Angeles, CA', 34.0745, -118.3774, 'Tapas', '310-555-0150', 4.6);

--
-- Update users to link to their restaurants
--
UPDATE users SET restaurant_id = id - 2 WHERE id BETWEEN 3 AND 52;

--
-- Table structure for table `foods`
--
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `foods`
--
INSERT INTO `foods` (restaurant_id, name, description, price, discount_percent, available_quantity, pickup_start, pickup_end) VALUES
-- 1. Luigis Trattoria (Italian)
(1, 'Spaghetti Carbonara', 'Classic Roman pasta with eggs, cheese, pork, and black pepper', 18.00, 10, 10, '12:00:00', '20:00:00'),
(1, 'Bruschetta', 'Grilled bread rubbed with garlic and topped with olive oil and salt', 8.00, 0, 15, '12:00:00', '20:00:00'),
(1, 'Tiramisu', 'Coffee-flavoured Italian dessert', 9.00, 5, 20, '12:00:00', '20:00:00'),

-- 2. Sakura Sushi (Japanese)
(2, 'Salmon Nigiri', 'Fresh salmon on vinegared rice', 5.00, 0, 30, '11:30:00', '21:30:00'),
(2, 'Vegetable Tempura', 'Battered and deep fried vegetables', 12.00, 10, 20, '11:30:00', '21:30:00'),
(2, 'Miso Soup', 'Traditional Japanese soup consisting of a dashi stock', 4.00, 0, 50, '11:30:00', '21:30:00'),

-- 3. Tacos El Guero (Mexican)
(3, 'Carne Asada Taco', 'Grilled beef taco with cilantro and onion', 3.50, 0, 50, '10:00:00', '22:00:00'),
(3, 'Bean Burrito', 'Flour tortilla filled with beans and cheese', 8.00, 10, 25, '10:00:00', '22:00:00'),
(3, 'Churros', 'Fried dough pastry', 4.00, 5, 40, '10:00:00', '22:00:00'),

-- 4. Spice of India (Indian)
(4, 'Butter Chicken', 'Chicken in a mildly spiced curry sauce', 16.00, 15, 15, '11:00:00', '21:00:00'),
(4, 'Palak Paneer', 'Spinach and cottage cheese curry', 14.00, 10, 20, '11:00:00', '21:00:00'),
(4, 'Garlic Naan', 'Leavened, oven-baked flatbread with garlic', 3.00, 0, 50, '11:00:00', '21:00:00'),

-- 5. Burger Barn (American)
(5, 'Classic Cheeseburger', 'Beef patty with cheese, lettuce, and tomato', 12.00, 0, 30, '11:00:00', '23:00:00'),
(5, 'Vegan Burger', 'Plant-based patty with lettuce and tomato', 14.00, 10, 15, '11:00:00', '23:00:00'),
(5, 'Fries', 'Golden crispy french fries', 4.00, 0, 50, '11:00:00', '23:00:00'),

-- 6. Thai Orchid (Thai)
(6, 'Pad Thai', 'Stir-fried rice noodle dish', 13.00, 10, 20, '11:00:00', '21:00:00'),
(6, 'Green Curry', 'Thai curry based on green chilies', 14.00, 5, 15, '11:00:00', '21:00:00'),
(6, 'Mango Sticky Rice', 'Traditional Thai dessert', 7.00, 0, 25, '11:00:00', '21:00:00'),

-- 7. Golden Dragon (Chinese)
(7, 'Kung Pao Chicken', 'Spicy stir-fry with chicken, peanuts, and vegetables', 14.00, 10, 20, '11:00:00', '21:00:00'),
(7, 'Vegetable Chow Mein', 'Stir-fried noodles with vegetables', 11.00, 5, 25, '11:00:00', '21:00:00'),
(7, 'Spring Rolls', 'Fried pastry filled with vegetables', 5.00, 0, 40, '11:00:00', '21:00:00'),

-- 8. Mediterranean Oasis (Mediterranean)
(8, 'Falafel Wrap', 'Deep-fried ball made from ground chickpeas in pita', 9.00, 10, 30, '10:00:00', '20:00:00'),
(8, 'Hummus Plate', 'Mashed chickpeas blended with tahini, lemon, and garlic', 8.00, 5, 25, '10:00:00', '20:00:00'),
(8, 'Greek Salad', 'Salad with tomatoes, cucumbers, onion, feta cheese, and olives', 10.00, 0, 20, '10:00:00', '20:00:00'),

-- 9. Earthly Delights (Vegan)
(9, 'Quinoa Bowl', 'Quinoa with roasted vegetables and tahini dressing', 12.00, 10, 25, '09:00:00', '18:00:00'),
(9, 'Avocado Toast', 'Toasted bread topped with smashed avocado', 9.00, 0, 30, '09:00:00', '18:00:00'),
(9, 'Smoothie Bowl', 'Blended fruits topped with granola and seeds', 10.00, 5, 20, '09:00:00', '18:00:00'),

-- 10. Sweet Tooth Bakery (Bakery)
(10, 'Chocolate Croissant', 'Puff pastry with chocolate filling', 4.00, 0, 40, '07:00:00', '16:00:00'),
(10, 'Blueberry Muffin', 'Baked product with blueberries', 3.00, 10, 35, '07:00:00', '16:00:00'),
(10, 'Sourdough Bread', 'Bread made by the fermentation of dough', 6.00, 0, 15, '07:00:00', '16:00:00'),

-- 11. Pasta Palace (Italian)
(11, 'Penne Arrabbiata', 'Pasta with spicy tomato sauce', 13.00, 10, 20, '12:00:00', '21:00:00'),
(11, 'Garlic Bread', 'Bread topped with garlic and butter', 5.00, 0, 30, '12:00:00', '21:00:00'),
(11, 'Panna Cotta', 'Creamy dessert', 8.00, 5, 15, '12:00:00', '21:00:00'),

-- 12. Ramen House (Japanese)
(12, 'Tonkotsu Ramen', 'Ramen in pork bone broth', 15.00, 5, 25, '11:30:00', '21:30:00'),
(12, 'Shoyu Ramen', 'Ramen in soy sauce based broth', 14.00, 5, 25, '11:30:00', '21:30:00'),
(12, 'Gyoza', 'Pan-fried dumplings', 7.00, 0, 40, '11:30:00', '21:30:00'),

-- 13. Burrito Bros (Mexican)
(13, 'Chicken Burrito', 'Burrito with grilled chicken', 10.00, 10, 30, '10:00:00', '22:00:00'),
(13, 'Veggie Quesadilla', 'Tortilla filled with cheese and vegetables', 9.00, 5, 25, '10:00:00', '22:00:00'),
(13, 'Chips and Salsa', 'Tortilla chips with spicy tomato sauce', 4.00, 0, 50, '10:00:00', '22:00:00'),

-- 14. Curry Corner (Indian)
(14, 'Lamb Vindaloo', 'Spicy curry with lamb', 17.00, 10, 15, '11:00:00', '21:00:00'),
(14, 'Aloo Gobi', 'Potato and cauliflower curry', 13.00, 5, 20, '11:00:00', '21:00:00'),
(14, 'Samosa', 'Fried pastry with savory filling', 4.00, 0, 40, '11:00:00', '21:00:00'),

-- 15. Texas BBQ Pit (American)
(15, 'BBQ Ribs', 'Pork ribs with BBQ sauce', 20.00, 10, 15, '11:00:00', '20:00:00'),
(15, 'Pulled Pork Sandwich', 'Sandwich with slow-cooked pork', 12.00, 5, 25, '11:00:00', '20:00:00'),
(15, 'Coleslaw', 'Salad consisting primarily of finely shredded raw cabbage', 4.00, 0, 40, '11:00:00', '20:00:00'),

-- 16. Pizza Express (Italian)
(16, 'Pepperoni Pizza', 'Pizza with pepperoni slices', 15.00, 10, 20, '11:00:00', '22:00:00'),
(16, 'Veggie Pizza', 'Pizza with assorted vegetables', 14.00, 10, 20, '11:00:00', '22:00:00'),
(16, 'Garlic Knots', 'Bread dough knotted and baked with garlic', 6.00, 0, 30, '11:00:00', '22:00:00'),

-- 17. Fresh Greens (Vegan)
(17, 'Kale Salad', 'Salad with kale and vinaigrette', 11.00, 5, 25, '10:00:00', '19:00:00'),
(17, 'Vegan Wrap', 'Tortilla wrap with hummus and veggies', 10.00, 5, 25, '10:00:00', '19:00:00'),
(17, 'Fruit Cup', 'Assorted fresh fruits', 5.00, 0, 40, '10:00:00', '19:00:00'),

-- 18. Wing Stop (American)
(18, 'Buffalo Wings', 'Chicken wings with spicy sauce', 12.00, 10, 30, '11:00:00', '23:00:00'),
(18, 'BBQ Wings', 'Chicken wings with BBQ sauce', 12.00, 10, 30, '11:00:00', '23:00:00'),
(18, 'Onion Rings', 'Deep fried onion rings', 5.00, 0, 40, '11:00:00', '23:00:00'),

-- 19. Hells Kitchen (American)
(19, 'Beef Wellington', 'Steak coated with pâté and duxelles, wrapped in puff pastry', 35.00, 10, 10, '17:00:00', '22:00:00'),
(19, 'Scallops', 'Pan-seared scallops', 25.00, 5, 15, '17:00:00', '22:00:00'),
(19, 'Sticky Toffee Pudding', 'Sponge cake with toffee sauce', 12.00, 0, 20, '17:00:00', '22:00:00'),

-- 20. Jamies Italian (Italian)
(20, 'Lasagna', 'Pasta sheets layered with meat sauce and cheese', 16.00, 10, 15, '12:00:00', '21:00:00'),
(20, 'Risotto', 'Creamy rice dish', 15.00, 5, 15, '12:00:00', '21:00:00'),
(20, 'Focaccia', 'Italian flatbread', 5.00, 0, 30, '12:00:00', '21:00:00'),

-- 21. Chez Panisse (French)
(21, 'Roasted Chicken', 'Free-range chicken roasted with herbs', 28.00, 5, 10, '17:30:00', '21:30:00'),
(21, 'Goat Cheese Salad', 'Mixed greens with baked goat cheese', 14.00, 0, 20, '17:30:00', '21:30:00'),
(21, 'Fruit Galette', 'Rustic fruit tart', 10.00, 0, 15, '17:30:00', '21:30:00'),

-- 22. Momofuku (Asian Fusion)
(22, 'Pork Buns', 'Steamed buns with pork belly', 12.00, 0, 40, '11:00:00', '22:00:00'),
(22, 'Ramen', 'Noodle soup with pork and egg', 16.00, 5, 30, '11:00:00', '22:00:00'),
(22, 'Spicy Noodles', 'Chilled noodles with spicy sauce', 14.00, 5, 30, '11:00:00', '22:00:00'),

-- 23. French Laundry (French)
(23, 'Oysters and Pearls', 'Tapioca pudding with oysters and caviar', 50.00, 0, 5, '17:00:00', '21:00:00'),
(23, 'Lobster Mac & Cheese', 'Macaroni and cheese with lobster chunks', 45.00, 0, 5, '17:00:00', '21:00:00'),
(23, 'Truffle Risotto', 'Risotto with shaved truffles', 60.00, 0, 5, '17:00:00', '21:00:00'),

-- 24. No Reservations (International)
(24, 'Pho', 'Vietnamese noodle soup', 12.00, 10, 25, '11:00:00', '21:00:00'),
(24, 'Banh Mi', 'Vietnamese sandwich', 8.00, 5, 30, '11:00:00', '21:00:00'),
(24, 'Spring Rolls', 'Fresh rice paper rolls with shrimp', 6.00, 0, 35, '11:00:00', '21:00:00'),

-- 25. Flavor Town (American)
(25, 'Trash Can Nachos', 'Nachos piled high with cheese and toppings', 15.00, 10, 20, '11:00:00', '22:00:00'),
(25, 'Bacon Burger', 'Burger topped with crispy bacon', 14.00, 5, 25, '11:00:00', '22:00:00'),
(25, 'Mac Daddy Mac & Cheese', 'Creamy mac and cheese', 10.00, 0, 30, '11:00:00', '22:00:00'),

-- 26. Spago (Californian)
(26, 'Smoked Salmon Pizza', 'Pizza topped with smoked salmon and caviar', 25.00, 5, 15, '17:00:00', '22:00:00'),
(26, 'Chinois Chicken Salad', 'Salad with chicken and asian dressing', 18.00, 0, 20, '17:00:00', '22:00:00'),
(26, 'Wiener Schnitzel', 'Breaded veal cutlet', 30.00, 5, 10, '17:00:00', '22:00:00'),

-- 27. Bam Kitchen (Cajun)
(27, 'Jambalaya', 'Rice dish with meat and vegetables', 16.00, 10, 20, '11:00:00', '21:00:00'),
(27, 'Gumbo', 'Stew with meat or shellfish', 15.00, 5, 20, '11:00:00', '21:00:00'),
(27, 'Beignets', 'Fried dough pastry dusted with powdered sugar', 6.00, 0, 40, '11:00:00', '21:00:00'),

-- 28. Mesa Grill (Southwestern)
(28, 'Shrimp Tacos', 'Tacos filled with grilled shrimp', 14.00, 5, 25, '11:00:00', '22:00:00'),
(28, 'Queso Fundido', 'Melted cheese with chorizo', 10.00, 0, 30, '11:00:00', '22:00:00'),
(28, 'Cornbread', 'Sweet corn bread', 5.00, 0, 40, '11:00:00', '22:00:00'),

-- 29. Giadas (Italian)
(29, 'Lemon Spaghetti', 'Spaghetti with lemon cream sauce', 18.00, 5, 20, '12:00:00', '22:00:00'),
(29, 'Chicken Piccata', 'Chicken with lemon caper sauce', 22.00, 10, 15, '12:00:00', '22:00:00'),
(29, 'Tiramisu', 'Coffee-flavoured dessert', 10.00, 0, 25, '12:00:00', '22:00:00'),

-- 30. Yum-o (American)
(30, 'Sloppy Joes', 'Sandwich with ground beef in tomato sauce', 10.00, 5, 30, '11:00:00', '21:00:00'),
(30, 'Mac and Cheese', 'Baked macaroni and cheese', 9.00, 0, 35, '11:00:00', '21:00:00'),
(30, 'Brownies', 'Chocolate fudge brownies', 4.00, 0, 50, '11:00:00', '21:00:00'),

-- 31. Barefoot Contessa (American)
(31, 'Roast Chicken', 'Herb roasted chicken', 24.00, 5, 15, '17:00:00', '21:00:00'),
(31, 'Coconut Cake', 'Layer cake with coconut frosting', 8.00, 0, 20, '17:00:00', '21:00:00'),
(31, 'Lentil Soup', 'Hearty lentil soup', 9.00, 5, 25, '17:00:00', '21:00:00'),

-- 32. Good Eats (American)
(32, 'Steak Au Poivre', 'Steak crusted with peppercorns', 30.00, 10, 10, '17:00:00', '22:00:00'),
(32, 'Mashed Potatoes', 'Creamy mashed potatoes', 6.00, 0, 30, '17:00:00', '22:00:00'),
(32, 'Apple Pie', 'Classic apple pie', 7.00, 0, 25, '17:00:00', '22:00:00'),

-- 33. Marthas Table (American)
(33, 'Pot Roast', 'Slow cooked beef roast', 22.00, 5, 15, '17:00:00', '21:00:00'),
(33, 'Chicken Noodle Soup', 'Classic chicken soup', 8.00, 0, 30, '17:00:00', '21:00:00'),
(33, 'Lemon Meringue Pie', 'Tart lemon pie with meringue topping', 7.00, 0, 20, '17:00:00', '21:00:00'),

-- 34. Dogghouse (Soul Food)
(34, 'Fried Chicken', 'Crispy fried chicken', 14.00, 10, 30, '11:00:00', '23:00:00'),
(34, 'Waffles', 'Fluffy waffles with syrup', 8.00, 5, 30, '11:00:00', '23:00:00'),
(34, 'Collard Greens', 'Braised collard greens', 5.00, 0, 40, '11:00:00', '23:00:00'),

-- 35. Top Chef Kitchen (Fusion)
(35, 'Scallop Crudo', 'Raw scallops with citrus dressing', 18.00, 5, 15, '17:00:00', '22:00:00'),
(35, 'Duck Breast', 'Pan seared duck breast', 28.00, 10, 10, '17:00:00', '22:00:00'),
(35, 'Chocolate Ganache', 'Rich chocolate dessert', 10.00, 0, 20, '17:00:00', '22:00:00'),

-- 36. Craft (American)
(36, 'Braised Short Ribs', 'Tender beef ribs', 32.00, 5, 10, '17:30:00', '21:30:00'),
(36, 'Roasted Mushrooms', 'Assorted roasted mushrooms', 12.00, 0, 20, '17:30:00', '21:30:00'),
(36, 'Polenta', 'Creamy cornmeal', 9.00, 0, 25, '17:30:00', '21:30:00'),

-- 37. Kouzzina (Greek)
(37, 'Spanakopita', 'Spinach and feta pastry', 8.00, 0, 30, '11:00:00', '21:00:00'),
(37, 'Lamb Souvlaki', 'Grilled lamb skewers', 16.00, 10, 20, '11:00:00', '21:00:00'),
(37, 'Baklava', 'Layered pastry with nuts and honey', 6.00, 0, 40, '11:00:00', '21:00:00'),

-- 38. Morimoto (Japanese)
(38, 'Tuna Tartare', 'Raw tuna with condiments', 18.00, 5, 20, '17:00:00', '22:00:00'),
(38, 'Black Cod Miso', 'Cod fish marinated in miso', 30.00, 10, 10, '17:00:00', '22:00:00'),
(38, 'Rock Shrimp Tempura', 'Tempura battered shrimp with spicy sauce', 16.00, 5, 25, '17:00:00', '22:00:00'),

-- 39. Nobu (Japanese)
(39, 'Yellowtail Jalapeno', 'Yellowtail sashimi with jalapeno', 22.00, 5, 15, '17:30:00', '22:30:00'),
(39, 'Miso Soup', 'Classic miso soup', 6.00, 0, 40, '17:30:00', '22:30:00'),
(39, 'Mochi Ice Cream', 'Ice cream wrapped in rice dough', 8.00, 0, 30, '17:30:00', '22:30:00'),

-- 40. Sukiyabashi Jiro (Sushi)
(40, 'Omakase Sushi Set', 'Chef\'s selection of premium sushi', 100.00, 0, 5, '12:00:00', '20:00:00'),
(40, 'Tamago', 'Sweet egg omelette', 5.00, 0, 20, '12:00:00', '20:00:00'),
(40, 'Miso Soup', 'Traditional soup', 5.00, 0, 30, '12:00:00', '20:00:00'),

-- 41. Atelier Crenn (French)
(41, 'Tasting Menu A', 'Seasonal tasting menu', 150.00, 0, 5, '18:00:00', '21:00:00'),
(41, 'Tasting Menu B', 'Vegetarian tasting menu', 120.00, 0, 5, '18:00:00', '21:00:00'),
(41, 'Wine Pairing', 'Selection of wines', 80.00, 0, 10, '18:00:00', '21:00:00'),

-- 42. Per Se (French)
(42, 'Oysters', 'Fresh oysters', 30.00, 0, 15, '17:30:00', '22:00:00'),
(42, 'Foie Gras', 'Duck liver delicacy', 40.00, 0, 10, '17:30:00', '22:00:00'),
(42, 'Truffle Pasta', 'Pasta with black truffles', 50.00, 0, 10, '17:30:00', '22:00:00'),

-- 43. Noma (New Nordic)
(43, 'Reindeer Moss', 'Fried reindeer moss', 20.00, 0, 20, '18:00:00', '22:00:00'),
(43, 'Pickled Vegetables', 'Assorted pickled seasonal vegetables', 15.00, 0, 30, '18:00:00', '22:00:00'),
(43, 'Smoked Fish', 'Locally sourced smoked fish', 25.00, 0, 15, '18:00:00', '22:00:00'),

-- 44. Osteria Francescana (Italian)
(44, 'Five Ages of Parmesan', 'Parmesan cheese in five textures', 35.00, 0, 10, '19:00:00', '22:00:00'),
(44, 'Tortellini', 'Pasta filled with pork and cheese', 25.00, 0, 15, '19:00:00', '22:00:00'),
(44, 'Lemon Tart', 'Deconstructed lemon tart', 18.00, 0, 20, '19:00:00', '22:00:00'),

-- 45. The Fat Duck (Modern)
(45, 'Snail Porridge', 'Porridge with snails', 28.00, 0, 10, '18:30:00', '21:30:00'),
(45, 'Bacon and Egg Ice Cream', 'Savory ice cream', 15.00, 0, 20, '18:30:00', '21:30:00'),
(45, 'Sound of the Sea', 'Seafood dish with audio accompaniment', 40.00, 0, 5, '18:30:00', '21:30:00'),

-- 46. El Bulli (Molecular)
(46, 'Liquid Olives', 'Olives in liquid form', 10.00, 0, 30, '19:00:00', '23:00:00'),
(46, 'Foam Espresso', 'Espresso foam', 8.00, 0, 40, '19:00:00', '23:00:00'),
(46, 'Deconstructed Omelette', 'Potato foam and onion puree', 20.00, 0, 15, '19:00:00', '23:00:00'),

-- 47. Alinea (Modern)
(47, 'Edible Balloon', 'Apple taffy balloon with helium', 15.00, 0, 20, '17:00:00', '22:00:00'),
(47, 'Lamb 86', 'Lamb prepared 86 ways', 50.00, 0, 10, '17:00:00', '22:00:00'),
(47, 'Truffle Explosion', 'Ravioli filled with truffle soup', 25.00, 0, 20, '17:00:00', '22:00:00'),

-- 48. Eleven Madison Park (American)
(48, 'Honey Lavender Duck', 'Duck glazed with honey and lavender', 45.00, 0, 10, '17:30:00', '22:00:00'),
(48, 'Celery Root', 'Braised celery root', 20.00, 0, 20, '17:30:00', '22:00:00'),
(48, 'Milk and Honey', 'Milk ice cream with honey', 12.00, 0, 30, '17:30:00', '22:00:00'),

-- 49. Le Bernardin (Seafood)
(49, 'Tuna Carpaccio', 'Thinly sliced raw tuna', 28.00, 0, 20, '12:00:00', '22:00:00'),
(49, 'Baked Salmon', 'Salmon fillet baked with herbs', 32.00, 0, 15, '12:00:00', '22:00:00'),
(49, 'Lobster Bisque', 'Creamy lobster soup', 18.00, 0, 30, '12:00:00', '22:00:00'),

-- 50. The Bazaar (Tapas)
(50, 'Philly Cheesesteak', 'Air bread with cheese and steak', 12.00, 0, 30, '17:00:00', '23:00:00'),
(50, 'Cotton Candy Foie Gras', 'Foie gras wrapped in cotton candy', 15.00, 0, 25, '17:00:00', '23:00:00'),
(50, 'Patatas Bravas', 'Fried potatoes with spicy sauce', 8.00, 0, 40, '17:00:00', '23:00:00');


--
-- Table structure for table `food_dietary_compliance`
--
CREATE TABLE `food_dietary_compliance` (
  `food_id` int NOT NULL,
  `restriction_id` int NOT NULL,
  PRIMARY KEY (`food_id`,`restriction_id`),
  KEY `restriction_id` (`restriction_id`),
  CONSTRAINT `food_dietary_compliance_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `food_dietary_compliance_ibfk_2` FOREIGN KEY (`restriction_id`) REFERENCES `dietary_restrictions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `food_dietary_compliance`
--
-- Logic: If only one allergen (e.g., nuts), compliant with others (GF, DF, SF, etc.)
-- IDs: 1:GF, 2:DF, 3:NF, 4:SF, 5:Vegan, 6:Veg, 7:SugarFree, 8:LowSod, 9:Halal, 10:Kosher

INSERT INTO `food_dietary_compliance` (food_id, restriction_id) VALUES
-- 1. Spaghetti Carbonara (Contains: Gluten, Dairy, Meat) -> NF, SF
(1, 3), (1, 4), (1, 7),
-- 2. Bruschetta (Contains: Gluten) -> DF, NF, SF, Vegan, Veg
(2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 9), (2, 10),
-- 3. Tiramisu (Contains: Dairy, Gluten, Sugar) -> NF, SF, Veg
(3, 3), (3, 4), (3, 6), (3, 9), (3, 10),
-- 4. Salmon Nigiri (Contains: Fish) -> GF, DF, NF, SF(maybe no shellfish), Halal, Kosher
(4, 1), (4, 2), (4, 3), (4, 4), (4, 9), (4, 10),
-- 5. Veg Tempura (Contains: Gluten) -> DF, NF, SF, Vegan, Veg
(5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 9), (5, 10),
-- 6. Miso Soup (Soy) -> GF(if no wheat), DF, NF, SF, Vegan, Veg
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 8), (6, 9), (6, 10),
-- 7. Carne Asada (Meat) -> GF, DF, NF, SF
(7, 1), (7, 2), (7, 3), (7, 4), (7, 7), (7, 9), (7, 10),
-- 8. Bean Burrito (Gluten, Dairy) -> NF, SF, Veg
(8, 3), (8, 4), (8, 6), (8, 9), (8, 10),
-- 9. Churros (Gluten, Sugar) -> DF, NF, SF, Vegan, Veg
(9, 2), (9, 3), (9, 4), (9, 5), (9, 6), (9, 9), (9, 10),
-- 10. Butter Chicken (Dairy, Meat) -> GF, NF, SF
(10, 1), (10, 3), (10, 4), (10, 7), (10, 9), (10, 10),
-- 11. Palak Paneer (Dairy) -> GF, NF, SF, Veg
(11, 1), (11, 3), (11, 4), (11, 6), (11, 7), (11, 9), (11, 10),
-- 12. Garlic Naan (Gluten) -> DF, NF, SF, Vegan, Veg
(12, 2), (12, 3), (12, 4), (12, 5), (12, 6), (12, 9), (12, 10),
-- 13. Cheeseburger (Gluten, Dairy, Meat) -> NF, SF
(13, 3), (13, 4), (13, 7),
-- 14. Vegan Burger (Gluten?) -> DF, NF, SF, Vegan, Veg
(14, 2), (14, 3), (14, 4), (14, 5), (14, 6), (14, 9), (14, 10),
-- 15. Fries -> GF, DF, NF, SF, Vegan, Veg
(15, 1), (15, 2), (15, 3), (15, 4), (15, 5), (15, 6), (15, 7), (15, 9), (15, 10),
-- 16. Pad Thai (Peanuts!) -> GF, DF, SF. Not NF.
(16, 1), (16, 2), (16, 4), (16, 9), (16, 10),
-- 17. Green Curry -> GF, DF, NF, SF
(17, 1), (17, 2), (17, 3), (17, 4), (17, 9), (17, 10),
-- 18. Mango Sticky Rice -> GF, DF, NF, SF, Vegan, Veg
(18, 1), (18, 2), (18, 3), (18, 4), (18, 5), (18, 6), (18, 9), (18, 10),
-- 19. Kung Pao (Peanuts!) -> DF, SF. Not NF.
(19, 2), (19, 4), (19, 9), (19, 10),
-- 20. Veg Chow Mein (Gluten) -> DF, NF, SF, Vegan, Veg
(20, 2), (20, 3), (20, 4), (20, 5), (20, 6), (20, 9), (20, 10),
-- 21. Spring Rolls (Gluten) -> DF, NF, SF, Vegan, Veg
(21, 2), (21, 3), (21, 4), (21, 5), (21, 6), (21, 9), (21, 10),
-- 22. Falafel Wrap (Gluten) -> DF, NF, SF, Vegan, Veg
(22, 2), (22, 3), (22, 4), (22, 5), (22, 6), (22, 9), (22, 10),
-- 23. Hummus Plate -> GF, DF, NF, SF, Vegan, Veg
(23, 1), (23, 2), (23, 3), (23, 4), (23, 5), (23, 6), (23, 7), (23, 9), (23, 10),
-- 24. Greek Salad (Dairy) -> GF, NF, SF, Veg
(24, 1), (24, 3), (24, 4), (24, 6), (24, 7), (24, 9), (24, 10),
-- 25. Quinoa Bowl -> GF, DF, NF, SF, Vegan, Veg
(25, 1), (25, 2), (25, 3), (25, 4), (25, 5), (25, 6), (25, 7), (25, 8), (25, 9), (25, 10),
-- 26. Avocado Toast (Gluten) -> DF, NF, SF, Vegan, Veg
(26, 2), (26, 3), (26, 4), (26, 5), (26, 6), (26, 7), (26, 9), (26, 10),
-- 27. Smoothie Bowl -> GF, DF, SF, Vegan, Veg. (May have nuts in granola)
(27, 1), (27, 2), (27, 4), (27, 5), (27, 6), (27, 9), (27, 10),
-- 28. Choc Croissant (Gluten, Dairy, Sugar) -> NF, SF, Veg
(28, 3), (28, 4), (28, 6), (28, 9), (28, 10),
-- 29. Blueberry Muffin (Gluten, Sugar) -> DF, NF, SF, Veg
(29, 2), (29, 3), (29, 4), (29, 6), (29, 9), (29, 10),
-- 30. Sourdough (Gluten) -> DF, NF, SF, Vegan, Veg
(30, 2), (30, 3), (30, 4), (30, 5), (30, 6), (30, 7), (30, 9), (30, 10),
-- 31. Penne Arrabbiata (Gluten) -> DF, NF, SF, Vegan, Veg
(31, 2), (31, 3), (31, 4), (31, 5), (31, 6), (31, 9), (31, 10),
-- 32. Garlic Bread (Gluten, Dairy) -> NF, SF, Veg
(32, 3), (32, 4), (32, 6), (32, 9), (32, 10),
-- 33. Panna Cotta (Dairy, Sugar) -> GF, NF, SF, Veg
(33, 1), (33, 3), (33, 4), (33, 6), (33, 9), (33, 10),
-- 34. Tonkotsu Ramen (Gluten, Meat) -> DF, NF, SF
(34, 2), (34, 3), (34, 4), (34, 7), (34, 9), (34, 10),
-- 35. Shoyu Ramen (Gluten, Meat) -> DF, NF, SF
(35, 2), (35, 3), (35, 4), (35, 7), (35, 9), (35, 10),
-- 36. Gyoza (Gluten, Meat) -> DF, NF, SF
(36, 2), (36, 3), (36, 4), (36, 7), (36, 9), (36, 10),
-- 37. Chicken Burrito (Gluten, Dairy, Meat) -> NF, SF
(37, 3), (37, 4), (37, 7), (37, 9), (37, 10),
-- 38. Veggie Quesadilla (Gluten, Dairy) -> NF, SF, Veg
(38, 3), (38, 4), (38, 6), (38, 9), (38, 10),
-- 39. Chips and Salsa -> GF, DF, NF, SF, Vegan, Veg
(39, 1), (39, 2), (39, 3), (39, 4), (39, 5), (39, 6), (39, 7), (39, 9), (39, 10),
-- 40. Lamb Vindaloo (Meat) -> GF, DF, NF, SF
(40, 1), (40, 2), (40, 3), (40, 4), (40, 7), (40, 9), (40, 10),
-- 41. Aloo Gobi -> GF, DF, NF, SF, Vegan, Veg
(41, 1), (41, 2), (41, 3), (41, 4), (41, 5), (41, 6), (41, 7), (41, 9), (41, 10),
-- 42. Samosa (Gluten) -> DF, NF, SF, Vegan, Veg
(42, 2), (42, 3), (42, 4), (42, 5), (42, 6), (42, 9), (42, 10),
-- 43. Ribs (Meat) -> GF, DF, NF, SF
(43, 1), (43, 2), (43, 3), (43, 4), (43, 7), (43, 9), (43, 10),
-- 44. Pulled Pork (Gluten if bun, Meat) -> DF, NF, SF
(44, 2), (44, 3), (44, 4), (44, 7),
-- 45. Coleslaw (Egg usually) -> GF, DF(if vinegar), NF, SF, Veg
(45, 1), (45, 3), (45, 4), (45, 6), (45, 7), (45, 9), (45, 10),
-- 46. Pepperoni Pizza (Gluten, Dairy, Meat) -> NF, SF
(46, 3), (46, 4), (46, 7),
-- 47. Veggie Pizza (Gluten, Dairy) -> NF, SF, Veg
(47, 3), (47, 4), (47, 6), (47, 9), (47, 10),
-- 48. Garlic Knots (Gluten) -> DF, NF, SF, Vegan, Veg
(48, 2), (48, 3), (48, 4), (48, 5), (48, 6), (48, 9), (48, 10),
-- 49. Kale Salad -> GF, DF, NF, SF, Vegan, Veg
(49, 1), (49, 2), (49, 3), (49, 4), (49, 5), (49, 6), (49, 7), (49, 9), (49, 10),
-- 50. Vegan Wrap (Gluten) -> DF, NF, SF, Vegan, Veg
(50, 2), (50, 3), (50, 4), (50, 5), (50, 6), (50, 9), (50, 10),
-- 51. Fruit Cup -> GF, DF, NF, SF, Vegan, Veg
(51, 1), (51, 2), (51, 3), (51, 4), (51, 5), (51, 6), (51, 7), (51, 8), (51, 9), (51, 10),
-- 52. Buffalo Wings (Meat, Dairy in sauce sometimes?) -> GF, NF, SF
(52, 1), (52, 3), (52, 4), (52, 7), (52, 9), (52, 10),
-- 53. BBQ Wings (Meat) -> GF, DF, NF, SF
(53, 1), (53, 2), (53, 3), (53, 4), (53, 7), (53, 9), (53, 10),
-- 54. Onion Rings (Gluten) -> DF, NF, SF, Vegan, Veg
(54, 2), (54, 3), (54, 4), (54, 5), (54, 6), (54, 9), (54, 10),
-- 55. Beef Wellington (Gluten, Meat, Dairy) -> NF, SF
(55, 3), (55, 4), (55, 7),
-- 56. Scallops (Shellfish) -> GF, DF, NF
(56, 1), (56, 2), (56, 3), (56, 7), (56, 8), (56, 9), (56, 10),
-- 57. Pudding (Gluten, Dairy, Sugar) -> NF, SF, Veg
(57, 3), (57, 4), (57, 6), (57, 9), (57, 10),
-- 58. Lasagna (Gluten, Dairy, Meat) -> NF, SF
(58, 3), (58, 4), (58, 7),
-- 59. Risotto (Dairy) -> GF, NF, SF, Veg
(59, 1), (59, 3), (59, 4), (59, 6), (59, 7), (59, 9), (59, 10),
-- 60. Focaccia (Gluten) -> DF, NF, SF, Vegan, Veg
(60, 2), (60, 3), (60, 4), (60, 5), (60, 6), (60, 9), (60, 10),
-- 61. Roasted Chicken (Meat) -> GF, DF, NF, SF
(61, 1), (61, 2), (61, 3), (61, 4), (61, 7), (61, 9), (61, 10),
-- 62. Goat Cheese Salad (Dairy) -> GF, NF, SF, Veg
(62, 1), (62, 3), (62, 4), (62, 6), (62, 7), (62, 9), (62, 10),
-- 63. Fruit Galette (Gluten, Sugar) -> DF, NF, SF, Vegan, Veg
(63, 2), (63, 3), (63, 4), (63, 5), (63, 6), (63, 9), (63, 10),
-- 64. Pork Buns (Gluten, Meat) -> DF, NF, SF
(64, 2), (64, 3), (64, 4), (64, 7),
-- 65. Ramen (Gluten, Meat, Egg) -> DF, NF, SF
(65, 2), (65, 3), (65, 4), (65, 7),
-- 66. Spicy Noodles (Gluten) -> DF, NF, SF, Vegan, Veg
(66, 2), (66, 3), (66, 4), (66, 5), (66, 6), (66, 9), (66, 10),
-- 67. Oysters (Shellfish) -> GF, DF, NF
(67, 1), (67, 2), (67, 3), (67, 7), (67, 8), (67, 9), (67, 10),
-- 68. Lobster Mac (Gluten, Dairy, Shellfish) -> NF, SF
(68, 3), (68, 7),
-- 69. Truffle Risotto (Dairy) -> GF, NF, SF, Veg
(69, 1), (69, 3), (69, 4), (69, 6), (69, 7), (69, 9), (69, 10),
-- 70. Pho (Meat) -> GF, DF, NF, SF
(70, 1), (70, 2), (70, 3), (70, 4), (70, 7), (70, 9), (70, 10),
-- 71. Banh Mi (Gluten, Meat) -> DF, NF, SF
(71, 2), (71, 3), (71, 4), (71, 7),
-- 72. Spring Rolls (Shellfish sometimes, Gluten free wrapper?) -> GF, DF, NF
(72, 1), (72, 2), (72, 3), (72, 9), (72, 10),
-- 73. Nachos (Dairy, Meat) -> GF, NF, SF
(73, 1), (73, 3), (73, 4), (73, 7), (73, 9), (73, 10),
-- 74. Bacon Burger (Gluten, Meat, Dairy) -> NF, SF
(74, 3), (74, 4), (74, 7),
-- 75. Mac Cheese (Gluten, Dairy) -> NF, SF, Veg
(75, 3), (75, 4), (75, 6), (75, 7), (75, 9), (75, 10),
-- 76. Smoked Salmon Pizza (Gluten, Dairy, Fish) -> NF, SF
(76, 3), (76, 4), (76, 7), (76, 9), (76, 10),
-- 77. Chicken Salad (Meat) -> GF, DF, NF, SF
(77, 1), (77, 2), (77, 3), (77, 4), (77, 7), (77, 9), (77, 10),
-- 78. Schnitzel (Gluten, Meat) -> DF, NF, SF
(78, 2), (78, 3), (78, 4), (78, 7), (78, 9), (78, 10),
-- 79. Jambalaya (Meat, Shellfish usually) -> GF, DF, NF
(79, 1), (79, 2), (79, 3), (79, 7), (79, 9), (79, 10),
-- 80. Gumbo (Shellfish, Gluten roux) -> DF, NF
(80, 2), (80, 3), (80, 7), (80, 9), (80, 10),
-- 81. Beignets (Gluten, Sugar) -> DF, NF, SF, Veg
(81, 2), (81, 3), (81, 4), (81, 6), (81, 9), (81, 10),
-- 82. Shrimp Tacos (Shellfish, Gluten) -> DF, NF
(82, 2), (82, 3), (82, 7), (82, 9), (82, 10),
-- 83. Queso (Dairy, Meat) -> GF, NF, SF
(83, 1), (83, 3), (83, 4), (83, 7), (83, 9), (83, 10),
-- 84. Cornbread (Gluten, Dairy, Egg) -> NF, SF, Veg
(84, 3), (84, 4), (84, 6), (84, 7), (84, 9), (84, 10),
-- 85. Lemon Spaghetti (Gluten, Dairy) -> NF, SF, Veg
(85, 3), (85, 4), (85, 6), (85, 7), (85, 9), (85, 10),
-- 86. Chicken Piccata (Meat, Dairy) -> GF(maybe), NF, SF
(86, 1), (86, 3), (86, 4), (86, 7), (86, 9), (86, 10),
-- 87. Tiramisu (Dairy, Gluten, Sugar) -> NF, SF, Veg
(87, 3), (87, 4), (87, 6), (87, 9), (87, 10),
-- 88. Sloppy Joes (Gluten, Meat) -> DF, NF, SF
(88, 2), (88, 3), (88, 4), (88, 7), (88, 9), (88, 10),
-- 89. Mac n Cheese (Gluten, Dairy) -> NF, SF, Veg
(89, 3), (89, 4), (89, 6), (89, 7), (89, 9), (89, 10),
-- 90. Brownies (Gluten, Dairy, Sugar) -> NF, SF, Veg
(90, 3), (90, 4), (90, 6), (90, 9), (90, 10),
-- 91. Roast Chicken (Meat) -> GF, DF, NF, SF
(91, 1), (91, 2), (91, 3), (91, 4), (91, 7), (91, 9), (91, 10),
-- 92. Coconut Cake (Gluten, Dairy, Sugar, Nuts?) -> SF
(92, 4), (92, 6), (92, 9), (92, 10),
-- 93. Lentil Soup -> GF, DF, NF, SF, Vegan, Veg
(93, 1), (93, 2), (93, 3), (93, 4), (93, 5), (93, 6), (93, 7), (93, 9), (93, 10),
-- 94. Steak (Meat) -> GF, DF, NF, SF
(94, 1), (94, 2), (94, 3), (94, 4), (94, 7), (94, 9), (94, 10),
-- 95. Mashed Potatoes (Dairy) -> GF, NF, SF, Veg
(95, 1), (95, 3), (95, 4), (95, 6), (95, 7), (95, 9), (95, 10),
-- 96. Apple Pie (Gluten, Sugar) -> DF, NF, SF, Vegan, Veg
(96, 2), (96, 3), (96, 4), (96, 5), (96, 6), (96, 9), (96, 10),
-- 97. Pot Roast (Meat) -> GF, DF, NF, SF
(97, 1), (97, 2), (97, 3), (97, 4), (97, 7), (97, 9), (97, 10),
-- 98. Soup (Meat) -> GF, DF, NF, SF
(98, 1), (98, 2), (98, 3), (98, 4), (98, 7), (98, 9), (98, 10),
-- 99. Lemon Pie (Gluten, Egg, Dairy, Sugar) -> NF, SF, Veg
(99, 3), (99, 4), (99, 6), (99, 9), (99, 10),
-- 100. Fried Chicken (Gluten, Meat) -> DF, NF, SF
(100, 2), (100, 3), (100, 4), (100, 7), (100, 9), (100, 10),
-- 101. Waffles (Gluten, Dairy, Egg, Sugar) -> NF, SF, Veg
(101, 3), (101, 4), (101, 6), (101, 9), (101, 10),
-- 102. Collard Greens -> GF, DF, NF, SF, Vegan, Veg
(102, 1), (102, 2), (102, 3), (102, 4), (102, 5), (102, 6), (102, 7), (102, 9), (102, 10),
-- 103. Scallop Crudo (Shellfish) -> GF, DF, NF
(103, 1), (103, 2), (103, 3), (103, 7), (103, 9), (103, 10),
-- 104. Duck Breast (Meat) -> GF, DF, NF, SF
(104, 1), (104, 2), (104, 3), (104, 4), (104, 7), (104, 9), (104, 10),
-- 105. Ganache (Dairy, Sugar) -> GF, NF, SF, Veg
(105, 1), (105, 3), (105, 4), (105, 6), (105, 9), (105, 10),
-- 106. Short Ribs (Meat) -> GF, DF, NF, SF
(106, 1), (106, 2), (106, 3), (106, 4), (106, 7), (106, 9), (106, 10),
-- 107. Mushrooms -> GF, DF, NF, SF, Vegan, Veg
(107, 1), (107, 2), (107, 3), (107, 4), (107, 5), (107, 6), (107, 7), (107, 9), (107, 10),
-- 108. Polenta (Dairy often) -> GF, NF, SF, Veg
(108, 1), (108, 3), (108, 4), (108, 6), (108, 7), (108, 9), (108, 10),
-- 109. Spanakopita (Gluten, Dairy) -> NF, SF, Veg
(109, 3), (109, 4), (109, 6), (109, 7), (109, 9), (109, 10),
-- 110. Souvlaki (Meat) -> GF, DF, NF, SF
(110, 1), (110, 2), (110, 3), (110, 4), (110, 7), (110, 9), (110, 10),
-- 111. Baklava (Gluten, Nuts, Sugar) -> DF, SF, Veg
(111, 2), (111, 4), (111, 6), (111, 9), (111, 10),
-- 112. Tuna Tartare (Fish) -> GF, DF, NF, SF
(112, 1), (112, 2), (112, 3), (112, 4), (112, 7), (112, 9), (112, 10),
-- 113. Black Cod (Fish, Soy) -> GF(maybe), DF, NF, SF
(113, 1), (113, 2), (113, 3), (113, 4), (113, 7), (113, 9), (113, 10),
-- 114. Shrimp Tempura (Shellfish, Gluten) -> DF, NF
(114, 2), (114, 3), (114, 7), (114, 9), (114, 10),
-- 115. Yellowtail (Fish) -> GF, DF, NF, SF
(115, 1), (115, 2), (115, 3), (115, 4), (115, 7), (115, 9), (115, 10),
-- 116. Miso Soup -> GF, DF, NF, SF, Vegan, Veg
(116, 1), (116, 2), (116, 3), (116, 4), (116, 5), (116, 6), (116, 7), (116, 9), (116, 10),
-- 117. Mochi (Dairy, Sugar) -> GF, NF, SF, Veg
(117, 1), (117, 3), (117, 4), (117, 6), (117, 9), (117, 10),
-- 118. Sushi Set (Fish) -> GF, DF, NF, SF
(118, 1), (118, 2), (118, 3), (118, 4), (118, 7), (118, 9), (118, 10),
-- 119. Tamago (Egg) -> GF, DF, NF, SF, Veg
(119, 1), (119, 2), (119, 3), (119, 4), (119, 6), (119, 7), (119, 9), (119, 10),
-- 120. Miso Soup -> GF, DF, NF, SF, Vegan, Veg
(120, 1), (120, 2), (120, 3), (120, 4), (120, 5), (120, 6), (120, 7), (120, 9), (120, 10),
-- 121. Tasting A (Meat) -> GF, DF, NF, SF
(121, 1), (121, 2), (121, 3), (121, 4), (121, 7), (121, 9), (121, 10),
-- 122. Tasting B (Veg) -> GF, DF, NF, SF, Veg
(122, 1), (122, 2), (122, 3), (122, 4), (122, 6), (122, 7), (122, 9), (122, 10),
-- 123. Wine -> GF, DF, NF, SF, Vegan, Veg
(123, 1), (123, 2), (123, 3), (123, 4), (123, 5), (123, 6), (123, 7), (123, 9), (123, 10),
-- 124. Oysters (Shellfish) -> GF, DF, NF
(124, 1), (124, 2), (124, 3), (124, 7), (124, 9), (124, 10),
-- 125. Foie Gras (Meat) -> GF, DF, NF, SF
(125, 1), (125, 2), (125, 3), (125, 4), (125, 7), (125, 9), (125, 10),
-- 126. Truffle Pasta (Gluten, Dairy) -> NF, SF, Veg
(126, 3), (126, 4), (126, 6), (126, 7), (126, 9), (126, 10),
-- 127. Moss -> GF, DF, NF, SF, Vegan, Veg
(127, 1), (127, 2), (127, 3), (127, 4), (127, 5), (127, 6), (127, 7), (127, 9), (127, 10),
-- 128. Pickles -> GF, DF, NF, SF, Vegan, Veg
(128, 1), (128, 2), (128, 3), (128, 4), (128, 5), (128, 6), (128, 7), (128, 9), (128, 10),
-- 129. Smoked Fish -> GF, DF, NF, SF
(129, 1), (129, 2), (129, 3), (129, 4), (129, 7), (129, 9), (129, 10),
-- 130. Parmesan (Dairy) -> GF, NF, SF, Veg
(130, 1), (130, 3), (130, 4), (130, 6), (130, 7), (130, 9), (130, 10),
-- 131. Tortellini (Gluten, Dairy, Meat) -> NF, SF
(131, 3), (131, 4), (131, 7), (131, 9), (131, 10),
-- 132. Lemon Tart (Gluten, Dairy, Sugar) -> NF, SF, Veg
(132, 3), (132, 4), (132, 6), (132, 9), (132, 10),
-- 133. Snail Porridge (Shellfish/Mollusk, Gluten, Dairy) -> NF
(133, 3), (133, 7), (133, 9), (133, 10),
-- 134. Bacon Ice Cream (Dairy, Meat, Sugar) -> GF, NF, SF
(134, 1), (134, 3), (134, 4), (134, 9), (134, 10),
-- 135. Seafood (Shellfish) -> GF, DF, NF
(135, 1), (135, 2), (135, 3), (135, 7), (135, 9), (135, 10),
-- 136. Liquid Olives -> GF, DF, NF, SF, Vegan, Veg
(136, 1), (136, 2), (136, 3), (136, 4), (136, 5), (136, 6), (136, 7), (136, 9), (136, 10),
-- 137. Foam Espresso -> GF, DF, NF, SF, Vegan, Veg
(137, 1), (137, 2), (137, 3), (137, 4), (137, 5), (137, 6), (137, 7), (137, 9), (137, 10),
-- 138. Deconstructed Omelette (Egg) -> GF, DF, NF, SF, Veg
(138, 1), (138, 2), (138, 3), (138, 4), (138, 6), (138, 7), (138, 9), (138, 10),
-- 139. Balloon (Sugar) -> GF, DF, NF, SF, Vegan, Veg
(139, 1), (139, 2), (139, 3), (139, 4), (139, 5), (139, 6), (139, 9), (139, 10),
-- 140. Lamb (Meat) -> GF, DF, NF, SF
(140, 1), (140, 2), (140, 3), (140, 4), (140, 7), (140, 9), (140, 10),
-- 141. Ravioli (Gluten, Dairy) -> NF, SF, Veg
(141, 3), (141, 4), (141, 6), (141, 7), (141, 9), (141, 10),
-- 142. Duck (Meat) -> GF, DF, NF, SF
(142, 1), (142, 2), (142, 3), (142, 4), (142, 7), (142, 9), (142, 10),
-- 143. Celery Root -> GF, DF, NF, SF, Vegan, Veg
(143, 1), (143, 2), (143, 3), (143, 4), (143, 5), (143, 6), (143, 7), (143, 9), (143, 10),
-- 144. Milk Honey (Dairy, Sugar) -> GF, NF, SF, Veg
(144, 1), (144, 3), (144, 4), (144, 6), (144, 9), (144, 10),
-- 145. Tuna (Fish) -> GF, DF, NF, SF
(145, 1), (145, 2), (145, 3), (145, 4), (145, 7), (145, 9), (145, 10),
-- 146. Salmon (Fish) -> GF, DF, NF, SF
(146, 1), (146, 2), (146, 3), (146, 4), (146, 7), (146, 9), (146, 10),
-- 147. Bisque (Dairy, Shellfish) -> GF, NF
(147, 1), (147, 3), (147, 7), (147, 9), (147, 10),
-- 148. Cheesesteak (Gluten, Dairy, Meat) -> NF, SF
(148, 3), (148, 4), (148, 7), (148, 9), (148, 10),
-- 149. Foie Gras (Meat) -> GF, DF, NF, SF
(149, 1), (149, 2), (149, 3), (149, 4), (149, 7), (149, 9), (149, 10),
-- 150. Potatoes -> GF, DF, NF, SF, Vegan, Veg
(150, 1), (150, 2), (150, 3), (150, 4), (150, 5), (150, 6), (150, 7), (150, 9), (150, 10);


--
-- Table structure for table `pickup_slots`
--
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pickup_slots`
--
INSERT INTO `pickup_slots` (restaurant_id, slot_start, slot_end, max_orders) VALUES
(1, '2025-10-29 12:00:00', '2025-10-29 20:00:00', 20),
(2, '2025-10-29 11:30:00', '2025-10-29 21:30:00', 15),
(3, '2025-10-29 10:00:00', '2025-10-29 22:00:00', 30),
(4, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 25),
(5, '2025-10-29 11:00:00', '2025-10-29 23:00:00', 40),
(6, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 20),
(7, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 25),
(8, '2025-10-29 10:00:00', '2025-10-29 20:00:00', 30),
(9, '2025-10-29 09:00:00', '2025-10-29 18:00:00', 15),
(10, '2025-10-29 07:00:00', '2025-10-29 16:00:00', 50),
(11, '2025-10-29 12:00:00', '2025-10-29 21:00:00', 20),
(12, '2025-10-29 11:30:00', '2025-10-29 21:30:00', 25),
(13, '2025-10-29 10:00:00', '2025-10-29 22:00:00', 30),
(14, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 20),
(15, '2025-10-29 11:00:00', '2025-10-29 20:00:00', 25),
(16, '2025-10-29 11:00:00', '2025-10-29 22:00:00', 30),
(17, '2025-10-29 10:00:00', '2025-10-29 19:00:00', 15),
(18, '2025-10-29 11:00:00', '2025-10-29 23:00:00', 40),
(19, '2025-10-29 17:00:00', '2025-10-29 22:00:00', 10),
(20, '2025-10-29 12:00:00', '2025-10-29 21:00:00', 25),
(21, '2025-10-29 17:30:00', '2025-10-29 21:30:00', 15),
(22, '2025-10-29 11:00:00', '2025-10-29 22:00:00', 30),
(23, '2025-10-29 17:00:00', '2025-10-29 21:00:00', 10),
(24, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 25),
(25, '2025-10-29 11:00:00', '2025-10-29 22:00:00', 30),
(26, '2025-10-29 17:00:00', '2025-10-29 22:00:00', 20),
(27, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 25),
(28, '2025-10-29 11:00:00', '2025-10-29 22:00:00', 30),
(29, '2025-10-29 12:00:00', '2025-10-29 22:00:00', 25),
(30, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 30),
(31, '2025-10-29 17:00:00', '2025-10-29 21:00:00', 15),
(32, '2025-10-29 17:00:00', '2025-10-29 22:00:00', 20),
(33, '2025-10-29 17:00:00', '2025-10-29 21:00:00', 15),
(34, '2025-10-29 11:00:00', '2025-10-29 23:00:00', 40),
(35, '2025-10-29 17:00:00', '2025-10-29 22:00:00', 20),
(36, '2025-10-29 17:30:00', '2025-10-29 21:30:00', 20),
(37, '2025-10-29 11:00:00', '2025-10-29 21:00:00', 25),
(38, '2025-10-29 17:00:00', '2025-10-29 22:00:00', 20),
(39, '2025-10-29 17:30:00', '2025-10-29 22:30:00', 20),
(40, '2025-10-29 12:00:00', '2025-10-29 20:00:00', 10),
(41, '2025-10-29 18:00:00', '2025-10-29 21:00:00', 10),
(42, '2025-10-29 17:30:00', '2025-10-29 22:00:00', 15),
(43, '2025-10-29 18:00:00', '2025-10-29 22:00:00', 15),
(44, '2025-10-29 19:00:00', '2025-10-29 22:00:00', 10),
(45, '2025-10-29 18:30:00', '2025-10-29 21:30:00', 15),
(46, '2025-10-29 19:00:00', '2025-10-29 23:00:00', 15),
(47, '2025-10-29 17:00:00', '2025-10-29 22:00:00', 15),
(48, '2025-10-29 17:30:00', '2025-10-29 22:00:00', 20),
(49, '2025-10-29 12:00:00', '2025-10-29 22:00:00', 25),
(50, '2025-10-29 17:00:00', '2025-10-29 23:00:00', 20);

--
-- Table structure for table `orders`
--
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--
INSERT INTO `orders` (user_id, restaurant_id, pickup_slot_id, total_amount, status) VALUES
(1, 1, 1, 18.00, 'completed'),
(2, 2, 2, 17.00, 'confirmed'),
(1, 3, 3, 11.50, 'ready'),
(2, 5, 5, 16.00, 'pending');

--
-- Table structure for table `order_items`
--
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_items`
--
INSERT INTO `order_items` (order_id, food_id, quantity, price) VALUES
(1, 1, 1, 18.00), -- Carbonara for Order 1
(2, 4, 1, 5.00), -- Nigiri for Order 2
(2, 5, 1, 12.00), -- Tempura for Order 2
(3, 7, 1, 3.50), -- Taco for Order 3
(3, 8, 1, 8.00), -- Burrito for Order 3
(4, 13, 1, 12.00), -- Burger for Order 4
(4, 15, 1, 4.00); -- Fries for Order 4

--
-- Table structure for table `user_dietary_restrictions`
--
CREATE TABLE `user_dietary_restrictions` (
  `user_id` int NOT NULL,
  `restriction_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`restriction_id`),
  KEY `restriction_id` (`restriction_id`),
  CONSTRAINT `user_dietary_restrictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_dietary_restrictions_ibfk_2` FOREIGN KEY (`restriction_id`) REFERENCES `dietary_restrictions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_dietary_restrictions`
--
INSERT INTO `user_dietary_restrictions` (user_id, restriction_id) VALUES
(1, 1), -- John: Gluten-Free
(2, 6); -- Jane: Vegetarian

SET FOREIGN_KEY_CHECKS = 1;