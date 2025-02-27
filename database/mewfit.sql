-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 27, 2025 at 12:34 PM
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
  `phone_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrator`
--

INSERT INTO `administrator` (`admin_id`, `username`, `password`, `name`, `gender`, `email_address`, `phone_number`) VALUES
(16, 'adminbjehsv', 'sac', 'csa', 'female', 'iamshershams@gmail.com', '0165579505'),
(26, 'vedwvfbjedbjfd', 'sac', 'Joe Hatszgzn', 'female', 'b@gmail.com', '0165579534'),
(27, 'admvguvefhvfe', 'vedws', 'vwd', 'female', 'vrb@gmail.com', '0165579546'),
(42, 'adm', 'gre', 'rws', 'male', 'iamshershams@gmail.com', '0165579513'),
(43, 'adm', 'gre', 'rws', 'male', 'iamsherams@gmail.com', '0165579513'),
(46, 'ad', 'gre', 'rws', 'male', 'iamshera@gmail.com', '0165579518'),
(53, 'advdswyyyyy', 'gre', 'rws', 'male', 'iara@gmail.com', '0165579509'),
(54, 'adv', 'gre', 'rws', 'male', 'ia@gmail.com', '0165579508'),
(55, 'hahahahhahaha', 'gre', 'rws', 'male', 'i@gmail.com', '0165579507'),
(56, 'adv', 'gre', 'rws', 'male', 'itygv@gmail.com', '0165579503'),
(58, 'Jingite', 'khg', 'jgvnb', 'female', 'ew@gmail.com', '0165579587'),
(59, 'Jingvde', 'khg', 'jgvnb', 'female', 'ewevdw@gmail.com', '0165579580'),
(60, 'hihi', 'hftggcn', 'efd', 'female', 'tp073539@mail.apu.edu.my', '0165579517'),
(61, 'hihireh', 'hftggcn', 'efd', 'female', 'tp0739@mail.apu.edu.my', '0165579571'),
(62, 'herger', 'gwgrw', 'Joe Hatszgzn', 'male', 'artsietyapu@gmail.com', '0165579533'),
(63, 'hihihi', 'fg', 'thgc', 'female', 'tp39@mail.apu.edu.my', '0165579566'),
(64, 'songjoom', 'ukg', 'Sher', 'female', '539@mail.apu.edu.my', '0165579588'),
(65, 'vcadscvds', 'edvasvds', 'Joe Hatszgzn', 'female', 'bryannyi@gmail.com', '0165579500'),
(81, 'veddsvbfd', 'sc ds', 'Joe Hatszgzn', 'female', 'unyi@gmail.com', '0165579568'),
(83, 'hehehehe', 'egsevdz', 'Sher', 'male', 'nwongjunyi@gmail.com', '0165579111'),
(84, 'Jingitebdgcx', 'ngfxvb', 'Joe Hatszgzn', 'male', 'tyapu@gmail.com', '0165579222'),
(85, 'tp073539', 'fxn vb', 'Song Joe Han', 'female', 'ongjunyi@gmail.com', '0165579225'),
(86, 'user bruh', 'bfgx', 'Sher', 'male', 'shams@gmail.com', '0165579333'),
(87, 'jojo', 'khuj,n', 'khujn,', 'male', 'hlj@gmail.com', '0165579999'),
(88, 'asdfghjkl;', 'veriufb', 'veef', 'female', '39@mail.apu.edu.my', '0165579888');

-- --------------------------------------------------------

--
-- Table structure for table `diet`
--

CREATE TABLE `diet` (
  `diet_id` int(11) NOT NULL,
  `diet_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `diet_type` varchar(20) DEFAULT NULL,
  `preparation_min` int(11) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `directions` text DEFAULT NULL,
  `nutrition_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diet_history`
--

CREATE TABLE `diet_history` (
  `diet_history_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `meal_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diet_nutrition`
--

CREATE TABLE `diet_nutrition` (
  `diet_id` int(11) NOT NULL,
  `nutrition_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `member_id` int(11) NOT NULL,
  `member_pic` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `fitness_goal` varchar(20) NOT NULL,
  `target_weight` decimal(5,2) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `day_streak_starting_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_performance`
--

CREATE TABLE `member_performance` (
  `performance_id` int(11) NOT NULL,
  `weeks_date_mon` date DEFAULT NULL,
  `workout_history_id` int(11) DEFAULT NULL,
  `diet_history_id` int(11) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `carbohydrate` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workout`
--

CREATE TABLE `workout` (
  `workout_id` int(11) NOT NULL,
  `workout_name` varchar(100) DEFAULT NULL,
  `workout_type` varchar(100) DEFAULT NULL,
  `calories` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `muscle_diagram` varchar(255) DEFAULT NULL,
  `workout_step_checklist` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indexes for dumped tables
--

--
-- Indexes for table `administrator`
--
ALTER TABLE `administrator`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`,`email_address`,`phone_number`);

--
-- Indexes for table `diet`
--
ALTER TABLE `diet`
  ADD PRIMARY KEY (`diet_id`),
  ADD KEY `nutrition_id` (`nutrition_id`);

--
-- Indexes for table `diet_history`
--
ALTER TABLE `diet_history`
  ADD PRIMARY KEY (`diet_history_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `meal_id` (`meal_id`);

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
  ADD PRIMARY KEY (`member_id`);

--
-- Indexes for table `member_performance`
--
ALTER TABLE `member_performance`
  ADD PRIMARY KEY (`performance_id`),
  ADD KEY `workout_history_id` (`workout_history_id`),
  ADD KEY `diet_history_id` (`diet_history_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `nutrition`
--
ALTER TABLE `nutrition`
  ADD PRIMARY KEY (`nutrition_id`);

--
-- Indexes for table `workout`
--
ALTER TABLE `workout`
  ADD PRIMARY KEY (`workout_id`);

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
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `diet_history_ibfk_2` FOREIGN KEY (`meal_id`) REFERENCES `diet` (`diet_id`);

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
  ADD CONSTRAINT `member_performance_ibfk_1` FOREIGN KEY (`workout_history_id`) REFERENCES `workout_history` (`workout_history_id`),
  ADD CONSTRAINT `member_performance_ibfk_2` FOREIGN KEY (`diet_history_id`) REFERENCES `diet_history` (`diet_history_id`),
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
