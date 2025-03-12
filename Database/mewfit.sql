-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2025 at 05:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mewfit`
--
CREATE DATABASE IF NOT EXISTS `mewfit` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `mewfit`;

-- --------------------------------------------------------

--
-- Table structure for table `administrator`
--

CREATE TABLE `administrator` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `email_address` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `date_registered` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrator`
--

INSERT INTO `administrator` (`admin_id`, `username`, `password`, `name`, `gender`, `email_address`, `phone_number`, `date_registered`) VALUES
(58, 'Jingite', 'khg', 'jgvnb', 'female', 'ew@gmail.com', '0165579587', NULL),
(59, 'Jingvde', 'khg', 'jgvnb', 'female', 'ewevdw@gmail.com', '0165579580', NULL),
(60, 'hihi', 'hftggcn', 'efd', 'female', 'tp073539@mail.apu.edu.my', '0165579517', NULL),
(61, 'hihireh', 'hftggcn', 'efd', 'female', 'tp0739@mail.apu.edu.my', '0165579571', NULL),
(62, 'herger', 'gwgrw', 'Joe Hatszgzn', 'male', 'artsietyapu@gmail.com', '0165579533', NULL),
(63, 'hihihi', 'fg', 'thgc', 'female', 'tp39@mail.apu.edu.my', '0165579566', NULL),
(64, 'songjoom', 'ukg', 'Sher', 'female', '539@mail.apu.edu.my', '0165579588', NULL),
(65, 'vcadscvds', 'edvasvds', 'Joe Hatszgzn', 'female', 'bryannyi@gmail.com', '0165579500', NULL),
(81, 'veddsvbfd', 'sc ds', 'Joe Hatszgzn', 'female', 'unyi@gmail.com', '0165579568', NULL),
(83, 'hehehehe', 'egsevdz', 'Sher', 'male', 'nwongjunyi@gmail.com', '0165579111', NULL),
(84, 'Jingitebdgcx', 'ngfxvb', 'Joe Hatszgzn', 'male', 'tyapu@gmail.com', '0165579222', NULL),
(85, 'jhntegdrbfngrtbf', 'fxn vb', 'Song Joe Han', 'female', 'ongjunyi@gmail.com', '0165579225', NULL),
(87, 'jojo', 'khuj,n', 'khujn,', 'male', 'hlj@gmail.com', '0165579999', NULL),
(88, 'asdfghjkl;', 'veriufb', 'veef', 'female', '39@mail.apu.edu.my', '0165579888', NULL),
(89, 'hfd', 'wfs', 'wf', 'female', 'vrhfdgvcbwb@gmail.com', '0165579511', '2025-03-05');

-- --------------------------------------------------------

--
-- Table structure for table `custom_diet`
--

CREATE TABLE `custom_diet` (
  `custom_diet_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `custom_diet_name` varchar(100) NOT NULL,
  `calories` int(11) NOT NULL,
  `member_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_diet`
--

INSERT INTO `custom_diet` (`custom_diet_id`, `date`, `custom_diet_name`, `calories`, `member_id`) VALUES
(1, '2025-03-11', 'brwvfs', 123, 42),
(2, '2025-03-11', 'r3efwds', 1234, 42),
(3, '2025-03-11', 'btrf', 1000, 42);

-- --------------------------------------------------------

--
-- Table structure for table `diet`
--

CREATE TABLE `diet` (
  `diet_id` int(11) NOT NULL,
  `diet_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `diet_type` varchar(20) DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT NULL,
  `preparation_min` int(11) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `directions` text DEFAULT NULL,
  `date_registered` date DEFAULT NULL,
  `nutrition_id` int(11) NOT NULL
) ;

--
-- Dumping data for table `diet`
--

INSERT INTO `diet` (`diet_id`, `diet_name`, `description`, `diet_type`, `difficulty`, `preparation_min`, `picture`, `directions`, `date_registered`, `nutrition_id`) VALUES
(1, 'Greek Salad', 'Traditional Greek salad with feta cheese and olives', 'vegetarian', 'intermediate', 15, 'greek_salad.jpg', 'Combine chopped cucumbers, tomatoes, red onion, olives, and feta cheese. Drizzle with olive oil and sprinkle with oregano.', '2024-01-10', 4),
(2, 'Grilled Chicken with Vegetables', 'Simple high protein meal with seasonal vegetables', 'vegetarian', 'beginner', 25, 'grilled_chicken.jpg', 'Season chicken breast and grill. Steam mixed vegetables and serve together.', '2024-01-15', 2),
(3, 'Avocado Toast', 'Healthy breakfast with whole grain bread', 'vegetarian', 'intermediate', 10, 'avocado_toast.jpg', 'Toast bread, spread mashed avocado, add salt, pepper, and red pepper flakes.', '2024-02-05', 7),
(4, 'Salmon with Asparagus', 'Baked salmon fillet with roasted asparagus', 'meat', 'intermediate', 30, 'salmon_asparagus.jpg', 'Season salmon, bake at 400°F for 15 minutes. Roast asparagus with olive oil.', '2024-02-12', 13),
(5, 'Beef and Broccoli Stir Fry', 'Quick weeknight dinner with lean beef', 'meat', 'intermediate', 20, 'beef_broccoli.jpg', 'Stir fry sliced beef with broccoli, garlic, and soy sauce. Serve immediately.', '2024-02-25', 6),
(6, 'Quinoa Bowl', 'Nutrient-rich bowl with mixed vegetables', 'vegan', 'intermediate', 20, 'quinoa_bowl.jpg', 'Cook quinoa, top with roasted vegetables, chickpeas, and tahini dressing.', '2024-03-05', 5),
(7, 'Keto Breakfast Plate', 'Low carb breakfast with eggs and avocado', 'vegan', 'beginner', 15, 'keto_breakfast.jpg', 'Cook eggs as desired, serve with avocado slices and bacon.', '2024-03-18', 3),
(8, 'Mediterranean Mezze Platter', 'Assortment of small dishes and dips', 'vegan', 'intermediate', 25, 'mezze_platter.jpg', 'Arrange hummus, tzatziki, olives, feta, and vegetables on a platter. Serve with pita bread.', '2024-03-30', 4),
(9, 'Protein Smoothie Bowl', 'Thick smoothie topped with fruits and nuts', 'all', 'intermediate', 10, 'smoothie_bowl.jpg', 'Blend protein powder with frozen fruits and milk. Top with fresh berries, nuts, and seeds.', '2024-04-08', 17),
(10, 'Lentil Soup', 'Hearty vegetarian soup with vegetables', 'vegetarian', 'beginner', 40, 'lentil_soup.jpg', 'Simmer lentils with onions, carrots, celery, and spices until tender.', '2024-04-22', 7),
(11, 'Baked Cod with Sweet Potato', 'Simple fish dinner with roasted vegetables', 'meat', 'advanced', 35, 'cod_sweet_potato.jpg', 'Season cod fillets, bake alongside sweet potato wedges.', '2024-05-03', 19),
(12, 'Chicken and Vegetable Skewers', 'Grilled protein with colorful vegetables', 'vegetarian', 'advanced', 30, 'chicken_skewers.jpg', 'Thread chicken pieces and vegetables onto skewers, grill until chicken is cooked through.', '2024-05-17', 11),
(13, 'Berry Oatmeal', 'Wholesome breakfast with mixed berries', 'vegetarian', 'beginner', 15, 'berry_oatmeal.jpg', 'Cook oatmeal with milk, top with mixed berries and a drizzle of honey.', '2024-06-02', 19),
(14, 'Turkey and Spinach Stuffed Peppers', 'Bell peppers filled with lean turkey mixture', 'vegetarian', 'intermediate', 45, 'stuffed_peppers.jpg', 'Brown turkey with onions and garlic, mix with spinach and spices, stuff into bell peppers and bake.', '2024-06-15', 1),
(15, 'Asian Tofu Stir Fry', 'Quick vegetarian dish with mixed vegetables', 'vegan', 'beginner', 20, 'tofu_stir_fry.jpg', 'Stir fry firm tofu with broccoli, bell peppers, and soy sauce. Serve over rice.', '2024-07-01', 5),
(16, 'Protein Pancakes', 'High protein breakfast option', 'all', 'intermediate', 20, 'protein_pancakes.jpg', 'Mix protein powder with eggs and banana, cook pancakes, top with berries.', '2024-07-18', 2),
(17, 'Spaghetti Squash with Marinara', 'Low carb alternative to pasta', 'all', 'intermediate', 50, 'spaghetti_squash.jpg', 'Roast spaghetti squash, scrape strands, top with marinara sauce and parmesan.', '2024-08-05', 1),
(18, 'Tuna Nicoise Salad', 'French-inspired salad with tuna and eggs', 'meat', 'intermediate', 25, 'tuna_nicoise.jpg', 'Arrange tuna, boiled eggs, green beans, potatoes, olives on a bed of lettuce. Drizzle with vinaigrette.', '2024-08-22', 13),
(19, 'Cauliflower Rice Bowl', 'Low carb alternative with mixed toppings', 'vegan', 'advanced', 30, 'cauliflower_rice.jpg', 'Pulse cauliflower into rice-like texture, sauté and top with protein and vegetables of choice.', '2024-09-10', 3),
(20, 'Overnight Oats', 'No-cook breakfast prepared in advance', 'all', 'beginner', 10, 'overnight_oats.jpg', 'Combine oats with milk, chia seeds, and honey. Refrigerate overnight, top with fruit before serving.', '2024-09-25', 20),
(47, 'test', '2', 'meat', 'intermediate', 2, 'meal_67cb23884a59c8.76615319.jpg', '2', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `diet_history`
--

CREATE TABLE `diet_history` (
  `diet_history_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `member_id` int(11) NOT NULL,
  `diet_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diet_history`
--

INSERT INTO `diet_history` (`diet_history_id`, `date`, `member_id`, `diet_id`) VALUES
(1, '2025-03-10', 42, 1),
(2, '2024-01-08', 2, 3),
(3, '2024-01-10', 3, 5),
(4, '2024-01-12', 4, 2),
(5, '2024-01-15', 5, 8),
(6, '2024-01-18', 6, 1),
(7, '2024-01-20', 7, 1),
(8, '2024-01-22', 8, 6),
(9, '2024-01-25', 9, 9),
(10, '2024-01-28', 10, 4),
(11, '2024-02-01', 11, 7),
(12, '2024-02-05', 12, 15),
(13, '2024-02-08', 13, 12),
(14, '2024-02-10', 14, 20),
(15, '2024-02-12', 15, 18),
(16, '2024-02-15', 1, 2),
(17, '2024-02-18', 2, 5),
(18, '2024-02-20', 3, 8),
(19, '2024-02-22', 4, 14),
(20, '2024-02-25', 5, 11),
(21, '2024-03-01', 6, 16),
(22, '2024-03-05', 7, 13),
(23, '2024-03-08', 8, 19),
(24, '2024-03-10', 9, 17),
(25, '2024-03-15', 10, 3),
(26, '2024-03-18', 11, 6),
(27, '2024-03-20', 12, 9),
(28, '2024-03-22', 13, 4),
(29, '2024-03-25', 14, 10),
(30, '2024-03-28', 15, 1),
(31, '2024-04-01', 1, 7),
(32, '2024-04-05', 2, 12),
(33, '2024-04-08', 3, 15),
(34, '2024-04-10', 4, 20),
(35, '2024-04-12', 5, 18),
(36, '2024-04-15', 6, 2),
(37, '2024-04-18', 7, 5),
(38, '2024-04-20', 8, 8),
(39, '2024-04-22', 9, 14),
(40, '2024-04-25', 10, 11),
(41, '2024-05-01', 11, 16),
(42, '2024-05-05', 12, 13),
(43, '2024-05-08', 13, 19),
(44, '2024-05-10', 14, 17),
(45, '2024-05-15', 15, 3),
(46, '2024-05-18', 1, 6),
(47, '2024-05-20', 2, 9),
(48, '2024-05-22', 3, 4),
(49, '2024-05-25', 4, 10),
(50, '2024-05-28', 5, 1),
(51, '2024-06-01', 6, 7),
(52, '2024-06-05', 7, 12),
(53, '2024-06-08', 8, 15),
(54, '2024-06-10', 9, 20),
(55, '2024-06-12', 10, 18),
(56, '2024-06-15', 11, 2),
(57, '2024-06-18', 12, 5),
(58, '2024-06-20', 13, 8),
(59, '2024-06-22', 14, 14),
(60, '2024-06-25', 15, 11),
(61, '2024-07-01', 1, 16),
(62, '2024-07-05', 2, 13),
(63, '2024-07-08', 3, 19),
(64, '2024-07-10', 4, 17),
(65, '2024-07-15', 5, 3),
(66, '2024-07-18', 6, 6),
(67, '2024-07-20', 7, 9),
(68, '2024-07-22', 8, 4),
(69, '2024-07-25', 9, 10),
(70, '2024-08-01', 10, 1),
(71, '2024-08-05', 11, 7),
(72, '2024-08-08', 12, 12),
(73, '2024-08-10', 13, 15),
(74, '2024-08-12', 14, 20),
(75, '2024-08-15', 15, 18),
(76, '2024-08-18', 1, 2),
(77, '2024-08-20', 2, 5),
(78, '2024-08-22', 3, 8),
(79, '2024-08-25', 4, 14),
(80, '2024-08-28', 5, 11),
(81, '2024-09-01', 6, 16),
(82, '2024-09-05', 7, 13),
(83, '2024-09-08', 8, 19),
(84, '2024-09-10', 9, 17),
(85, '2024-09-15', 10, 3),
(86, '2024-09-18', 11, 6),
(87, '2024-09-20', 12, 9),
(88, '2024-09-22', 13, 4),
(89, '2024-09-25', 14, 10),
(90, '2024-09-28', 15, 1),
(91, '2024-10-01', 1, 7),
(92, '2024-10-05', 2, 12),
(93, '2024-10-08', 3, 15),
(94, '2024-10-10', 4, 20),
(95, '2024-10-15', 5, 18),
(96, '2024-10-18', 6, 2),
(97, '2024-10-20', 7, 5),
(98, '2024-10-22', 8, 8),
(99, '2024-10-25', 9, 14),
(100, '2024-10-28', 10, 11);

-- --------------------------------------------------------

--
-- Table structure for table `diet_nutrition`
--

CREATE TABLE `diet_nutrition` (
  `diet_id` int(11) NOT NULL,
  `nutrition_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diet_nutrition`
--

INSERT INTO `diet_nutrition` (`diet_id`, `nutrition_id`) VALUES
(1, 12),
(3, 1),
(3, 3),
(3, 4),
(5, 3),
(6, 15),
(7, 1),
(7, 15),
(8, 17),
(9, 4),
(9, 5),
(9, 20),
(10, 9),
(12, 15),
(13, 3),
(14, 4),
(14, 6),
(14, 7),
(15, 8),
(17, 1),
(17, 9),
(18, 1),
(18, 3),
(18, 4),
(18, 18),
(19, 7),
(19, 11),
(20, 2),
(20, 17);

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `member_id` int(11) NOT NULL,
  `member_pic` varchar(255) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `email_address` varchar(180) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `height` decimal(4,1) NOT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `fitness_goal` varchar(20) NOT NULL,
  `target_weight` decimal(5,2) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `day_streak_starting_date` date DEFAULT NULL,
  `last_session_date` date DEFAULT NULL,
  `weight_registered_date` date DEFAULT NULL,
  `date_registered` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`member_id`, `member_pic`, `username`, `email_address`, `password`, `level`, `height`, `weight`, `age`, `fitness_goal`, `target_weight`, `gender`, `day_streak_starting_date`, `last_session_date`, `weight_registered_date`, `date_registered`) VALUES
(1, 'pic1.jpg', '1', 'user1@example.com', '0742e2ebf153794e75b88f3aacfa5e0023a0b54b18d3cb9236dcfb9b5909026b', 1, 170.0, 85.00, 25, 'Gain Muscle', 90.00, 'Male', '2025-03-01', '2025-03-09', '2024-04-10', '2024-01-05'),
(2, 'pic2.jpg', 'user2', 'user2@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 2, 165.0, 65.00, 30, 'Gain Muscle', 70.00, 'Female', '2023-06-12', '2024-05-28', '2024-06-07', '2024-07-02'),
(3, 'pic3.jpg', 'user3', 'user3@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 1, 175.0, 85.00, 28, 'Maintain', 80.00, 'Male', '2023-07-01', '2025-02-28', '2025-01-08', '2024-03-15'),
(4, 'pic4.jpg', 'user4', 'user4@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 3, 160.0, 45.00, 24, 'Lose Weight', 50.00, 'Female', '2023-04-05', '2023-10-20', '2024-03-20', '2024-04-20'),
(5, 'pic5.jpg', 'user5', 'user5@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 1, 190.0, 100.00, 35, 'Gain Muscle', 105.00, 'Male', '2023-03-18', '2024-02-02', '2024-04-20', '2024-05-18'),
(6, 'pic6.jpg', 'user6', 'user6@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 2, 168.0, 72.00, 27, 'Lose Weight', 68.00, 'Female', '2023-09-09', '2024-04-05', '2024-04-19', '2024-06-18'),
(7, 'pic7.jpg', 'user7', 'user7@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 1, 178.0, 70.00, 22, 'Maintain', 72.00, 'Male', '2023-10-10', '2024-08-04', '2024-07-27', '2024-07-25'),
(8, 'pic8.jpg', 'user8', 'user8@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 2, 182.0, 90.00, 29, 'Gain Muscle', 95.00, 'Female', '2023-11-20', '2024-11-10', '2024-10-24', '2024-08-30'),
(9, 'pic9.jpg', 'user9', 'user9@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 1, 160.0, 58.00, 31, 'Lose Weight', 55.00, 'Male', '2023-02-14', '2023-03-01', '2024-06-28', '2024-09-12'),
(10, 'pic10.jpg', 'user10', 'user10@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 3, 170.0, 77.00, 26, 'Maintain', 74.00, 'Female', '2023-01-28', '2024-11-10', '2024-10-18', '2024-10-05'),
(11, 'pic11.jpg', 'user11', 'user11@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 2, 200.0, 110.00, 34, 'Gain Muscle', 115.00, 'Male', '2023-08-15', '2023-11-21', '2024-06-18', '2024-11-20'),
(12, 'pic12.jpg', 'user12', 'user12@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 40, 158.0, 54.00, 23, 'Lose Weight', 52.00, 'Female', '2023-07-07', '2024-01-17', '2024-12-03', '2024-12-10'),
(13, 'pic13.jpg', 'user13', 'user13@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 2, 176.0, 88.00, 32, 'Maintain', 85.00, 'Male', '2023-06-18', '2023-08-05', '2023-10-29', '2025-01-08'),
(14, 'pic14.jpg', 'user14', 'user14@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 30, 162.0, 59.00, 28, 'Gain Muscle', 63.00, 'Female', '2023-05-12', '2024-02-22', '2025-01-03', '2025-02-15'),
(15, 'pic15.jpg', 'user15', 'user15@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 1, 172.0, 69.00, 30, 'Lose Weight', 65.00, 'Male', '2023-03-05', '2025-01-05', '2025-03-18', '2025-03-25'),
(16, 'pic16.jpg', 'user16', 'user16@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 29, 168.0, 74.00, 24, 'Maintain', 72.00, 'Female', '2024-01-10', '2024-05-14', '2025-01-06', '2025-01-15'),
(17, 'pic17.jpg', 'user17', 'user17@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 3, 189.0, 92.00, 30, 'Gain Muscle', 98.00, 'Male', '2024-02-01', '2024-11-18', '2024-11-21', '2025-01-20'),
(18, 'pic18.jpg', 'user18', 'user18@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 1, 152.0, 47.00, 26, 'Lose Weight', 45.00, 'Female', '2024-02-10', '2024-11-30', '2024-12-22', '2025-01-27'),
(19, 'pic19.jpg', 'user19', 'user19@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 17, 195.0, 104.00, 34, 'Gain Muscle', 110.00, 'Male', '2024-02-18', '2024-09-23', '2024-12-29', '2025-02-02'),
(20, 'pic20.jpg', 'user20', 'user20@example.com', 'ac7122c86f1e6a17c75ee7030fac7da7a72c33bdd436beff22f140b26c4d9e49', 30, 162.0, 58.00, 22, 'Lose Weight', 55.00, 'Female', '2024-02-25', '2024-10-04', '2024-12-13', '2025-02-08'),
(41, 'Unknown_acc-removebg.png', '123', '123@gmail.com', 'e4c27bfedb2424e827ca75679b201848ff224cdf7c47e887b759be9136c595e4', 1, 160.0, 90.00, 23, 'Lose weight', 80.00, 'male', '2025-02-19', '2025-03-10', '2025-02-24', '2025-02-19'),
(42, 'Unknown_acc-removebg.png', '12', '12@gmail.com', '$2y$10$Nc0tLrRZbvidIofxzX8zUu2JjRu0AncTC1WCTl1.Xo3tiwSAlBi3.', 50, 12.0, 12.00, 12, 'Lose Weight', 99.00, 'male', '2025-01-13', '2025-03-12', '2025-03-11', '2025-03-10');

-- --------------------------------------------------------

--
-- Table structure for table `member_performance`
--

CREATE TABLE `member_performance` (
  `performance_id` int(11) NOT NULL,
  `weeks_date_mon` date DEFAULT NULL,
  `current_weight` decimal(5,2) DEFAULT NULL,
  `workout_history_count` int(3) DEFAULT NULL,
  `diet_history_count` int(3) DEFAULT NULL,
  `member_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_performance`
--

INSERT INTO `member_performance` (`performance_id`, `weeks_date_mon`, `current_weight`, `workout_history_count`, `diet_history_count`, `member_id`) VALUES
(149, '2025-02-26', 87.00, 14, 9, 42),
(151, '2024-07-01', 46.36, 13, 8, 4),
(152, '2024-07-06', 101.92, 15, 10, 5),
(153, '2024-07-03', 69.31, 9, 6, 6),
(154, '2024-07-01', 71.26, 12, 7, 7),
(155, '2024-08-05', 92.06, 14, 9, 8),
(156, '2024-09-02', 55.15, 11, 8, 9),
(157, '2024-10-07', 74.88, 13, 7, 10),
(158, '2024-11-04', 110.58, 10, 6, 11),
(159, '2024-12-02', 53.17, 15, 9, 12),
(160, '2025-01-06', 85.09, 14, 10, 13),
(161, '2025-02-03', 60.36, 12, 7, 14),
(162, '2025-03-03', 65.75, 11, 6, 15),
(163, '2025-04-07', 73.01, 10, 5, 16),
(164, '2025-05-05', 97.47, 14, 9, 17),
(165, '2025-06-02', 46.53, 13, 8, 18),
(166, '2025-07-07', 106.13, 12, 6, 19),
(167, '2025-08-04', 57.52, 15, 10, 20),
(168, '2025-09-01', 86.42, 9, 5, 1),
(169, '2025-10-06', 68.27, 11, 7, 2),
(170, '2025-11-03', 82.94, 13, 8, 3),
(171, '2025-12-01', 46.70, 14, 9, 4),
(172, '2024-01-08', 101.41, 10, 6, 5),
(173, '2024-02-12', 69.55, 12, 8, 6),
(174, '2024-03-18', 70.53, 9, 7, 7),
(175, '2024-04-22', 93.69, 13, 9, 8),
(176, '2024-05-27', 57.66, 15, 10, 9),
(177, '2024-06-24', 76.40, 11, 8, 10),
(178, '2024-07-29', 110.93, 10, 6, 11),
(179, '2024-08-26', 52.71, 14, 9, 12),
(180, '2024-09-30', 85.26, 12, 7, 13),
(181, '2024-10-28', 60.77, 15, 10, 14),
(182, '2024-11-25', 67.46, 10, 5, 15),
(191, '2025-09-22', 49.40, 12, 8, 4),
(205, '2025-03-10', 80.00, NULL, NULL, 42);

-- --------------------------------------------------------

--
-- Table structure for table `nutrition`
--

CREATE TABLE `nutrition` (
  `nutrition_id` int(11) NOT NULL,
  `nutrition_name` varchar(100) DEFAULT NULL,
  `calories` int(11) DEFAULT NULL,
  `fat` decimal(5,2) DEFAULT NULL,
  `protein` decimal(5,2) DEFAULT NULL,
  `carbohydrate` decimal(5,2) DEFAULT NULL,
  `date_registered` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nutrition`
--

INSERT INTO `nutrition` (`nutrition_id`, `nutrition_name`, `calories`, `fat`, `protein`, `carbohydrate`, `date_registered`) VALUES
(1, 'Low Carb', 10000, 65.50, 120.30, 50.20, '2024-02-02'),
(2, 'High Protein', 150, 55.00, 180.50, 80.30, '2024-10-21'),
(3, 'Ketogenic', 150, 140.20, 95.50, 20.10, '2024-03-21'),
(4, 'Mediterranean', 150, 70.80, 90.20, 110.50, '2025-01-16'),
(5, 'Vegan', 150, 50.30, 70.50, 225.80, '2025-01-03'),
(6, 'Paleo', 150, 95.50, 150.20, 60.40, '2024-09-23'),
(7, 'Vegetarian', 150, 55.20, 75.80, 210.50, '2024-08-13'),
(8, 'Intermittent Fasting', 150, 60.80, 100.20, 90.50, '2024-11-25'),
(9, 'DASH', 150, 45.30, 85.70, 195.20, '2024-04-15'),
(10, 'Whole30', 150, 85.20, 130.40, 75.80, '2025-02-09'),
(11, 'Gluten Free', 150, 65.70, 95.20, 150.30, '2025-02-18'),
(12, 'Low FODMAP', 10000, 60.40, 90.60, 140.20, '2025-02-28'),
(13, 'Pescatarian', 150, 60.30, 110.50, 135.80, '2024-01-15'),
(14, 'Flexitarian', 150, 55.60, 95.30, 160.20, '2024-04-06'),
(15, 'Nordic', 150, 75.30, 105.60, 145.20, '2024-01-06'),
(16, 'Weight Gain', 150, 100.20, 180.50, 300.50, '2024-06-20'),
(17, 'Athletic Performance', 150, 90.50, 200.30, 250.20, '2025-02-12'),
(18, 'Diabetic', 150, 50.20, 100.50, 130.80, '2024-08-21'),
(19, 'Heart Healthy', 150, 40.50, 95.20, 180.30, '2025-01-08'),
(20, 'Anti-Inflammatory', 150, 60.80, 100.50, 155.20, '2024-10-29'),
(79, 'fefe', 20, 3.00, 3.00, 3.00, '2025-01-27'),
(80, 'fish', 20, 2.00, 2.00, 2.00, '2024-07-11'),
(81, 'wq', 20, 1.00, 1.00, 1.00, '2024-08-01'),
(82, 'ewfevfssevfds', 20, 2.00, 2.00, 2.00, '2024-03-02'),
(83, 'pork', 20, 2.00, 2.00, 2.00, '2024-04-06'),
(84, 'duckge', 20, 2.00, 2.00, 2.00, '2024-10-24'),
(85, 'h', 20, 6.00, 6.00, 7.00, '2024-12-01');

-- --------------------------------------------------------

--
-- Table structure for table `workout`
--

CREATE TABLE `workout` (
  `workout_id` int(11) NOT NULL,
  `workout_name` varchar(100) DEFAULT NULL,
  `workout_type` varchar(100) DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT NULL,
  `calories` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `muscle_diagram` varchar(255) DEFAULT NULL,
  `workout_step_checklist` text DEFAULT NULL,
  `date_registered` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout`
--

INSERT INTO `workout` (`workout_id`, `workout_name`, `workout_type`, `difficulty`, `calories`, `duration`, `thumbnail`, `video`, `description`, `muscle_diagram`, `workout_step_checklist`, `date_registered`) VALUES
(1, 'Morning Yoga', 'yoga', 'intermediate', 150, 30, 'yoga_thumbnail_1.jpg', 'yoga_video_1.mp4', 'A beginner-friendly yoga session.', 'muscle_diagram_1.jpg', 'Warmup, Pose A, Pose B', '2025-01-01'),
(2, 'Cardio Burn', 'cardio', 'beginner', 400, 60, 'cardio_thumbnail_1.jpg', 'cardio_video_1.mp4', 'High-energy cardio for fat burn.', 'muscle_diagram_2.jpg', 'Warmup, Jog, Cooldown', '2025-01-02'),
(3, 'Evening Yoga', 'yoga', 'advanced', 200, 45, 'yoga_thumbnail_2.jpg', 'yoga_video_2.mp4', 'Intermediate yoga to unwind.', 'muscle_diagram_1.jpg', 'Warmup, Stretch, Pose C', '2025-01-03'),
(4, 'HIIT Cardio Blast', 'cardio', 'beginner', 550, 50, 'cardio_thumbnail_2.jpg', 'cardio_video_2.mp4', 'Intense cardio session for endurance.', 'muscle_diagram_2.jpg', 'Sprint, Jumping Jacks, Rest', '2025-01-04'),
(5, 'Weighted Squats', 'weighted', 'beginner', 300, 40, 'weighted_thumbnail_1.jpg', 'weighted_video_1.mp4', 'Strengthen lower body with weights.', 'muscle_diagram_3.jpg', 'Warmup, Squats, Rest', '2025-01-05'),
(6, 'Weight-Free Core', 'weight-free', 'advanced', 250, 35, 'weightfree_thumbnail_1.jpg', 'weightfree_video_1.mp4', 'Core strengthening without equipment.', 'muscle_diagram_4.jpg', 'Warmup, Planks, Cooldown', '2025-01-06'),
(7, 'Cardio Marathon', 'cardio', 'beginner', 700, 90, 'cardio_thumbnail_3.jpg', 'cardio_video_3.mp4', 'Long cardio endurance session.', 'muscle_diagram_2.jpg', 'Jog, Sprint, Walk', '2025-01-07'),
(8, 'Weighted Deadlifts', 'weighted', 'beginner', 400, 50, 'weighted_thumbnail_2.jpg', 'weighted_video_2.mp4', 'Improve posterior strength.', 'muscle_diagram_3.jpg', 'Warmup, Deadlifts, Cooldown', '2025-01-08'),
(9, 'Sunrise Yoga', 'yoga', 'beginner', 180, 40, 'yoga_thumbnail_3.jpg', 'yoga_video_3.mp4', 'A refreshing morning yoga routine.', 'muscle_diagram_1.jpg', 'Breathing, Stretch, Pose D', '2025-01-09'),
(10, 'Bodyweight Push', 'weight-free', 'advanced', 220, 30, 'weightfree_thumbnail_2.jpg', 'weightfree_video_2.mp4', 'Upper body workout using bodyweight.', 'muscle_diagram_4.jpg', 'Pushups, Planks, Rest', '2025-01-10'),
(11, 'Cardio Circuit', 'cardio', 'advanced', 450, 60, 'cardio_thumbnail_4.jpg', 'cardio_video_4.mp4', 'Circuit-based cardio exercises.', 'muscle_diagram_2.jpg', 'Warmup, Circuit, Cooldown', '2025-01-11'),
(12, 'Weighted Bench Press', 'weighted', 'intermediate', 500, 50, 'weighted_thumbnail_3.jpg', 'weighted_video_3.mp4', 'Develop chest and triceps with weights.', 'muscle_diagram_3.jpg', 'Warmup, Bench Press, Rest', '2025-01-12'),
(13, 'Relaxing Yoga', 'yoga', 'intermediate', 120, 25, 'yoga_thumbnail_4.jpg', 'yoga_video_4.mp4', 'Relax your body and mind.', 'muscle_diagram_1.jpg', 'Stretch, Pose A, Pose B', '2025-01-13'),
(14, 'Weight-Free Legs', 'weight-free', 'beginner', 240, 35, 'weightfree_thumbnail_3.jpg', 'weightfree_video_3.mp4', 'Leg-focused exercises without equipment.', 'muscle_diagram_4.jpg', 'Lunges, Squats, Rest', '2025-01-14'),
(15, 'Fast Cardio', 'cardio', 'intermediate', 600, 45, 'cardio_thumbnail_5.jpg', 'cardio_video_5.mp4', 'Quick, high-intensity cardio.', 'muscle_diagram_2.jpg', 'Sprint, Jump Rope, Cooldown', '2025-01-15'),
(16, 'Weighted Lunges', 'weighted', 'beginner', 320, 45, 'weighted_thumbnail_4.jpg', 'weighted_video_4.mp4', 'Target glutes and thighs with weights.', 'muscle_diagram_3.jpg', 'Warmup, Lunges, Cooldown', '2025-01-16'),
(17, 'Evening Stretches', 'yoga', 'intermediate', 100, 20, 'yoga_thumbnail_5.jpg', 'yoga_video_5.mp4', 'End the day with relaxing poses.', 'muscle_diagram_1.jpg', 'Pose X, Pose Y, Rest', '2025-01-17'),
(18, 'Bodyweight Basics', 'weight-free', 'beginner', 180, 30, 'weightfree_thumbnail_4.jpg', 'weightfree_video_4.mp4', 'Simple movements for beginners.', 'muscle_diagram_4.jpg', 'Stretch, Pushups, Cooldown', '2025-01-18'),
(19, 'Cardio Dance', 'cardio', 'intermediate', 350, 40, 'cardio_thumbnail_6.jpg', 'cardio_video_6.mp4', 'Fun cardio session with dance.', 'muscle_diagram_2.jpg', 'Warmup, Dance, Stretch', '2025-01-19'),
(20, 'Weighted Rows', 'weighted', 'intermediate', 450, 50, 'weighted_thumbnail_5.jpg', 'weighted_video_5.mp4', 'Strengthen back with rows.', 'muscle_diagram_3.jpg', 'Warmup, Rows, Rest', '2025-01-20');

-- --------------------------------------------------------

--
-- Table structure for table `workout_history`
--

CREATE TABLE `workout_history` (
  `workout_history_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `workout_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout_history`
--

INSERT INTO `workout_history` (`workout_history_id`, `date`, `member_id`, `workout_id`) VALUES
(1, '2025-03-09', 42, 19),
(2, '2025-03-11', 42, 6),
(3, '2024-11-17', 6, 14),
(4, '2024-12-27', 20, 14),
(5, '2024-11-28', 14, 16),
(6, '2024-10-31', 6, 7),
(7, '2024-10-03', 6, 15),
(8, '2024-10-20', 15, 6),
(9, '2025-01-17', 11, 15),
(10, '2025-02-09', 11, 4),
(11, '2025-01-19', 17, 8),
(12, '2025-01-02', 14, 7),
(13, '2024-11-10', 5, 5),
(14, '2024-12-12', 13, 17),
(15, '2025-01-30', 11, 1),
(16, '2024-12-09', 9, 12),
(17, '2024-11-04', 14, 7),
(18, '2024-11-19', 1, 8),
(19, '2024-11-03', 8, 18),
(20, '2025-01-31', 8, 5),
(21, '2025-02-22', 14, 4),
(22, '2024-10-26', 5, 18),
(23, '2024-10-11', 9, 12),
(24, '2024-11-21', 6, 13),
(25, '2025-01-19', 10, 11),
(26, '2025-01-12', 18, 11),
(27, '2024-09-18', 4, 1),
(28, '2024-12-04', 12, 7),
(29, '2024-10-11', 4, 9),
(30, '2024-11-03', 3, 10),
(31, '2024-09-14', 10, 9),
(32, '2024-10-11', 16, 8),
(33, '2024-12-02', 11, 4),
(34, '2025-02-11', 5, 13),
(35, '2024-11-28', 18, 14),
(36, '2024-10-30', 12, 15),
(37, '2024-09-16', 12, 1),
(38, '2025-01-02', 15, 13),
(39, '2024-10-07', 8, 8),
(40, '2024-11-12', 3, 17),
(41, '2024-11-20', 12, 2),
(42, '2024-11-23', 15, 17),
(43, '2025-02-23', 17, 19),
(44, '2025-02-10', 19, 6),
(45, '2024-11-22', 2, 14),
(46, '2025-02-08', 15, 3),
(47, '2024-12-09', 2, 17),
(48, '2024-09-13', 8, 20),
(49, '2024-11-10', 8, 1),
(50, '2024-10-01', 7, 1),
(51, '2025-01-30', 18, 18),
(52, '2024-11-11', 13, 5),
(53, '2025-01-27', 9, 10),
(54, '2025-02-06', 7, 5),
(55, '2025-02-27', 12, 17),
(56, '2025-01-20', 18, 12),
(57, '2025-01-15', 15, 14),
(58, '2025-02-05', 18, 19),
(59, '2024-10-02', 13, 11),
(60, '2024-10-16', 8, 9),
(61, '2025-02-25', 20, 17),
(62, '2025-02-13', 4, 9),
(63, '2024-11-07', 2, 6),
(64, '2025-01-12', 13, 4),
(65, '2024-09-11', 9, 4),
(66, '2024-11-09', 15, 13),
(67, '2024-10-01', 12, 4),
(68, '2025-01-14', 18, 10),
(69, '2024-10-26', 6, 5),
(70, '2025-01-27', 10, 13),
(71, '2024-10-17', 1, 17),
(72, '2025-02-15', 1, 17),
(73, '2025-03-05', 13, 20),
(74, '2025-02-05', 17, 15),
(75, '2025-03-06', 19, 12),
(76, '2025-02-16', 17, 17),
(77, '2024-11-30', 7, 19),
(78, '2024-11-21', 5, 9),
(79, '2024-12-05', 5, 12),
(80, '2025-01-15', 13, 8),
(81, '2024-10-09', 3, 1),
(82, '2024-10-20', 17, 16),
(83, '2025-01-03', 10, 7),
(84, '2025-02-08', 17, 14),
(85, '2024-09-10', 18, 7),
(86, '2025-02-10', 14, 19),
(87, '2024-12-02', 19, 2),
(88, '2024-12-12', 5, 14),
(89, '2024-11-16', 3, 18),
(90, '2024-10-01', 16, 7),
(91, '2025-01-16', 9, 5),
(92, '2024-09-22', 19, 16),
(93, '2025-02-01', 12, 8),
(94, '2025-01-28', 18, 16),
(95, '2025-01-28', 15, 2),
(96, '2025-02-10', 10, 20),
(97, '2024-12-23', 4, 12),
(98, '2024-12-25', 6, 4),
(99, '2025-03-03', 13, 1),
(100, '2025-01-22', 4, 3),
(128, '2024-12-13', 13, 19),
(129, '2024-11-15', 14, 8),
(130, '2024-12-31', 20, 8),
(131, '2025-01-17', 6, 16),
(132, '2024-04-21', 5, 18),
(133, '2024-09-23', 4, 5),
(134, '2024-10-19', 9, 5),
(135, '2025-01-14', 13, 11),
(136, '2025-01-19', 15, 19),
(137, '2024-10-09', 3, 18),
(138, '2025-01-30', 19, 1),
(139, '2024-06-17', 7, 17),
(140, '2024-03-29', 18, 4),
(141, '2024-06-08', 16, 1),
(142, '2025-02-01', 9, 8),
(143, '2024-11-16', 7, 10),
(144, '2024-07-04', 6, 9),
(145, '2024-07-01', 6, 11),
(146, '2024-11-17', 20, 14),
(147, '2024-08-09', 4, 11),
(148, '2024-04-06', 18, 4),
(149, '2024-06-05', 14, 15),
(150, '2024-10-20', 18, 11),
(151, '2024-04-07', 16, 15),
(152, '2024-05-07', 15, 2),
(153, '2024-05-30', 19, 20),
(154, '2025-02-22', 20, 1),
(155, '2024-04-11', 10, 1),
(156, '2024-12-07', 14, 4),
(157, '2024-12-23', 10, 20),
(158, '2024-09-18', 14, 18),
(159, '2024-07-08', 1, 3),
(160, '2024-09-04', 3, 5),
(161, '2024-10-14', 9, 6),
(162, '2024-05-12', 1, 14),
(163, '2024-05-23', 2, 13),
(164, '2025-03-04', 2, 8),
(165, '2024-11-05', 5, 2),
(166, '2024-11-04', 3, 15),
(167, '2024-05-20', 17, 12),
(168, '2024-07-26', 4, 17),
(169, '2024-09-01', 20, 11),
(170, '2024-10-03', 7, 1),
(171, '2024-03-16', 2, 7),
(172, '2024-08-05', 2, 3),
(173, '2024-08-07', 15, 7),
(174, '2024-08-29', 9, 14),
(175, '2024-04-14', 11, 4),
(176, '2024-08-20', 15, 4),
(177, '2024-12-05', 5, 18),
(178, '2024-10-21', 12, 18),
(179, '2024-11-28', 1, 19),
(180, '2024-10-13', 5, 6),
(181, '2024-11-09', 12, 19),
(182, '2025-01-20', 12, 6),
(183, '2024-11-09', 11, 13),
(184, '2024-09-30', 19, 20),
(185, '2024-04-13', 12, 11),
(186, '2025-01-12', 15, 4),
(187, '2024-10-08', 10, 11),
(188, '2024-06-12', 15, 19),
(189, '2024-07-05', 19, 12),
(190, '2024-05-22', 6, 15),
(191, '2025-01-22', 4, 6),
(192, '2024-12-12', 2, 20),
(193, '2024-11-19', 13, 18),
(194, '2024-10-24', 11, 14),
(195, '2024-12-12', 18, 1),
(196, '2024-08-15', 4, 14),
(197, '2024-11-12', 10, 6),
(198, '2025-02-19', 20, 1),
(199, '2024-04-27', 14, 18),
(200, '2024-07-11', 3, 14),
(201, '2025-01-22', 9, 10),
(202, '2024-05-16', 10, 17),
(203, '2024-11-04', 18, 7),
(204, '2025-02-12', 16, 3),
(205, '2024-05-14', 13, 10),
(206, '2024-09-27', 8, 4),
(207, '2024-11-17', 1, 20),
(208, '2025-01-22', 9, 13),
(209, '2024-11-03', 11, 11),
(210, '2024-05-14', 7, 1),
(211, '2024-04-14', 10, 4),
(212, '2024-06-22', 1, 3),
(213, '2024-11-25', 4, 14),
(214, '2025-01-02', 3, 4),
(215, '2024-09-04', 19, 6),
(216, '2024-08-17', 10, 19),
(217, '2024-07-14', 19, 13),
(218, '2024-06-01', 8, 3),
(219, '2024-08-17', 19, 5),
(220, '2024-07-03', 20, 20),
(221, '2025-01-27', 12, 3),
(222, '2025-01-23', 2, 15),
(223, '2024-08-06', 18, 5),
(224, '2024-09-19', 19, 3),
(225, '2024-11-18', 4, 17),
(226, '2024-11-02', 16, 17),
(227, '2024-12-20', 11, 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `administrator`
--
ALTER TABLE `administrator`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`,`email_address`,`phone_number`);

--
-- Indexes for table `custom_diet`
--
ALTER TABLE `custom_diet`
  ADD PRIMARY KEY (`custom_diet_id`),
  ADD KEY `fk_member_id` (`member_id`);

--
-- Indexes for table `diet`
--
ALTER TABLE `diet`
  ADD PRIMARY KEY (`diet_id`),
  ADD UNIQUE KEY `diet_name` (`diet_name`),
  ADD KEY `nutrition_id` (`nutrition_id`);

--
-- Indexes for table `diet_history`
--
ALTER TABLE `diet_history`
  ADD PRIMARY KEY (`diet_history_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `meal_id` (`diet_id`);

--
-- Indexes for table `diet_nutrition`
--
ALTER TABLE `diet_nutrition`
  ADD PRIMARY KEY (`diet_id`,`nutrition_id`),
  ADD KEY `nutrition_id` (`nutrition_id`);

--
-- Indexes for table `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_address` (`email_address`);

--
-- Indexes for table `member_performance`
--
ALTER TABLE `member_performance`
  ADD PRIMARY KEY (`performance_id`),
  ADD KEY `member_id` (`member_id`) USING BTREE;

--
-- Indexes for table `nutrition`
--
ALTER TABLE `nutrition`
  ADD PRIMARY KEY (`nutrition_id`),
  ADD UNIQUE KEY `nutrition_name` (`nutrition_name`);

--
-- Indexes for table `workout`
--
ALTER TABLE `workout`
  ADD PRIMARY KEY (`workout_id`),
  ADD UNIQUE KEY `workout_name` (`workout_name`);

--
-- Indexes for table `workout_history`
--
ALTER TABLE `workout_history`
  ADD PRIMARY KEY (`workout_history_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `workout_id` (`workout_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `administrator`
--
ALTER TABLE `administrator`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `custom_diet`
--
ALTER TABLE `custom_diet`
  MODIFY `custom_diet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `diet`
--
ALTER TABLE `diet`
  MODIFY `diet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diet_history`
--
ALTER TABLE `diet_history`
  MODIFY `diet_history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `member_performance`
--
ALTER TABLE `member_performance`
  MODIFY `performance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT for table `nutrition`
--
ALTER TABLE `nutrition`
  MODIFY `nutrition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `workout`
--
ALTER TABLE `workout`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `workout_history`
--
ALTER TABLE `workout_history`
  MODIFY `workout_history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=228;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `custom_diet`
--
ALTER TABLE `custom_diet`
  ADD CONSTRAINT `fk_member_id` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`);

--
-- Constraints for table `diet`
--
ALTER TABLE `diet`
  ADD CONSTRAINT `diet_ibfk_1` FOREIGN KEY (`nutrition_id`) REFERENCES `nutrition` (`nutrition_id`);

--
-- Constraints for table `diet_history`
--
ALTER TABLE `diet_history`
  ADD CONSTRAINT `diet_history_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
  ADD CONSTRAINT `diet_history_ibfk_2` FOREIGN KEY (`diet_id`) REFERENCES `diet` (`diet_id`);

--
-- Constraints for table `diet_nutrition`
--
ALTER TABLE `diet_nutrition`
  ADD CONSTRAINT `diet_nutrition_ibfk_1` FOREIGN KEY (`diet_id`) REFERENCES `diet` (`diet_id`),
  ADD CONSTRAINT `diet_nutrition_ibfk_2` FOREIGN KEY (`nutrition_id`) REFERENCES `nutrition` (`nutrition_id`);

--
-- Constraints for table `member_performance`
--
ALTER TABLE `member_performance`
  ADD CONSTRAINT `member_performance_ibfk_1` FOREIGN KEY (`workout_history_count`) REFERENCES `workout_history` (`workout_history_id`),
  ADD CONSTRAINT `member_performance_ibfk_2` FOREIGN KEY (`diet_history_count`) REFERENCES `diet_history` (`diet_history_id`),
  ADD CONSTRAINT `member_performance_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`);

--
-- Constraints for table `workout_history`
--
ALTER TABLE `workout_history`
  ADD CONSTRAINT `workout_history_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
  ADD CONSTRAINT `workout_history_ibfk_2` FOREIGN KEY (`workout_id`) REFERENCES `workout` (`workout_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
