-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 05, 2025 at 03:47 AM
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
-- Table structure for table `diet`
--

CREATE TABLE `diet` (
  `diet_id` int(11) NOT NULL,
  `diet_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `diet_type` varchar(20) DEFAULT NULL,
  `preparation_min` int(11) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `directions` text DEFAULT NULL,
  `nutrition_id` int(11) DEFAULT NULL,
  `date_registered` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diet`
--

INSERT INTO `diet` (`diet_id`, `diet_name`, `description`, `diet_type`, `preparation_min`, `picture`, `directions`, `nutrition_id`, `date_registered`) VALUES
(12, 'vfdcrevfd', 'vfdcx', 'meat', 55, NULL, 'vds,vwds', NULL, NULL),
(13, 'vfd', 'tkughj,n', 'meat', 55, '', 'htgf,fyhcg', NULL, NULL),
(14, 'vfdas', 'sca', 'vegetarian', 22, '', 'as,rsf', NULL, NULL),
(15, 'vfdascds', 'ca', 'vegetarian', 22, '', 'as,tg', NULL, NULL),
(16, 'hihihhhh', 'rg', 'vegetarian', 22, '', 'er,df', NULL, NULL),
(17, 'hihihgf', 'thgn', 'vegetarian', 22, '', 'gn,h', NULL, NULL),
(18, 'hihihgffew', 'we', 'vegetarian', 22, '', 'ww', NULL, NULL),
(19, 'soup', 'as', 'vegetarian', 22, '', 'as', NULL, NULL),
(21, 'soupyfft', 'f', 'vegetarian', 22, NULL, 'f', NULL, NULL),
(22, 'vds', 'e', 'vegetarian', 22, NULL, 'e', NULL, NULL),
(23, 'fish', 's', 'vegetarian', 22, '', 's', NULL, NULL),
(24, 'fishsa', 'a', 'vegetarian', 22, '', 'a', NULL, NULL),
(25, 'fishsax', 'x', 'vegetarian', 22, '', 'x', NULL, NULL),
(26, 'fishsaxg', 'gg', 'vegetarian', 22, '', 'g', NULL, NULL),
(27, 'fishsaxgyy', 'y', 'vegetarian', 22, '', 'y', NULL, NULL),
(28, 'fishsaxgyygggggg', 'g', 'vegetarian', 22, '', 'g', NULL, NULL),
(29, 'fishgd', 'f', 'vegetarian', 22, '', 'f', NULL, NULL),
(30, 'soupi', 'g', 'vegetarian', 22, '', 'g', NULL, NULL),
(31, 'soupiyy', 'y', 'vegetarian', 22, '', 'y', NULL, NULL),
(32, 'sou', 'r', 'vegetarian', 22, '', 'r', NULL, NULL),
(33, 'soudddddd', 'd', 'vegetarian', 22, '', 'd', NULL, NULL),
(34, 'soud', '0', 'vegetarian', 22, '', '', NULL, NULL),
(35, 'soudeedfdffr', 'ee', 'vegetarian', 22, '', 'ee', NULL, NULL),
(36, 'tfgj', '6', 'meat', 6, '', '6', NULL, NULL),
(37, 'u', '0', 'meat', 8, '', '', NULL, NULL),
(38, 'ik', '8', 'meat', 8, '', '8', NULL, NULL),
(39, 'roasted duck', '4', 'meat', 4, NULL, '4', NULL, NULL),
(40, 'es', '2', 'meat', 2, NULL, '2', NULL, NULL),
(41, 'ducky', '3', 'vegetarian', 3, NULL, '3', NULL, NULL),
(42, 'ij', '8', 'meat', 8, NULL, '8', NULL, NULL),
(43, 'rhfd', '8', 'meat', 7, NULL, '8', NULL, NULL),
(44, 'iygjh', '6', 'vegan', 6, NULL, '6', NULL, NULL);

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

--
-- Dumping data for table `diet_nutrition`
--

INSERT INTO `diet_nutrition` (`diet_id`, `nutrition_id`) VALUES
(12, 18),
(12, 42),
(13, 18),
(13, 43),
(14, 44),
(15, 43),
(16, 43),
(17, 18),
(18, 18),
(19, 42),
(19, 43),
(19, 44),
(21, 42),
(22, 42),
(23, 18),
(24, 18),
(25, 18),
(26, 42),
(26, 43),
(27, 18),
(28, 18),
(29, 18),
(30, 42),
(31, 18),
(32, 42),
(33, 42),
(34, 18),
(35, 42),
(36, 42),
(37, 18),
(38, 18),
(39, 42),
(39, 43),
(40, 18),
(41, 18),
(42, 44),
(43, 18),
(43, 42),
(43, 43),
(44, 18),
(44, 42);

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
  `day_streak_starting_date` date DEFAULT NULL,
  `date_registered` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`member_id`, `member_pic`, `username`, `password`, `level`, `weight`, `age`, `fitness_goal`, `target_weight`, `gender`, `day_streak_starting_date`, `date_registered`) VALUES
(2, 'profile2.jpg', 'jane_smith', 'securepass', 2, 65.20, 28, 'Gain Muscle', 68.00, 'Female', '2024-01-10', NULL),
(3, 'profile3.jpg', 'mike_tyson', 'boxingchamp', 3, 90.80, 35, 'Maintain', 90.80, 'Male', '2024-02-05', NULL),
(4, 'profile4.jpg', 'emily_clark', 'fitgirl2024', 1, 55.60, 22, 'Lose Weight', 50.00, 'Female', '2024-03-12', NULL),
(5, 'profile5.jpg', 'alex_jones', 'strongman99', 2, 80.00, 30, 'Gain Muscle', 85.00, 'Male', '2024-04-20', NULL),
(6, 'profile6.jpg', 'sarah_miller', 'gymqueen', 3, 62.40, 27, 'Maintain', 62.40, 'Female', '2024-05-08', NULL),
(7, 'profile7.jpg', 'chris_evans', 'cap_america', 2, 88.00, 32, 'Gain Muscle', 92.00, 'Male', '2024-06-15', NULL),
(8, 'profile8.jpg', 'anna_wilson', 'fitandfab', 1, 58.30, 26, 'Lose Weight', 55.00, 'Female', '2024-07-22', NULL),
(9, 'profile9.jpg', 'mark_rober', 'techguy2024', 3, 76.50, 29, 'Maintain', 76.50, 'Male', '2024-08-30', NULL),
(10, 'profile10.jpg', 'olivia_brown', 'yogalife', 2, 60.00, 31, 'Gain Flexibility', 60.00, 'Female', '2024-09-10', NULL);

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

--
-- Dumping data for table `nutrition`
--

INSERT INTO `nutrition` (`nutrition_id`, `nutrition_name`, `calories`, `fat`, `protein`, `carbohydrate`) VALUES
(18, 'gsdvdf', 12, 5.00, 123.00, 12.00),
(42, 'few', 11, 32.00, 432.00, 23.00),
(43, 'meat', 11, 32.00, 432.00, 23.00),
(44, 'egg', 11, 32.00, 432.00, 23.00),
(45, 'vews', 87, 67.00, 876.00, 68.00),
(46, 'gvr', 324, 23.00, 234.00, 32.00),
(47, 'vwedsvc', 76, 67.00, 67.00, 67.00),
(48, 'evfd', 32, 322.00, 23.00, 23.00),
(54, 'dsv', 12, 21.00, 2.00, 2.00),
(55, 'duck', 12, 1.00, 1.00, 1.00),
(56, 'vds', 21, 2.00, 2.00, 2.00),
(57, 'cds', 68, 6.00, 6.00, 6.00),
(58, 'bgfvc', 32, 32.00, 32.00, 23.00),
(59, 'cs', 324, 2.00, 2.00, 2.00),
(60, 'ggigigi', 65, 56.00, 5.00, 5.00),
(61, 'sa', 21, 1.00, 1.00, 1.00),
(62, 'hihi', 21, 1.00, 1.00, 1.00),
(63, 'vsd', 132, 1.00, 1.00, 1.00),
(64, 'rgvds', 2, 2.00, 2.00, 2.00),
(65, 'gvfd', 3, 3.00, 3.00, 3.00),
(66, 'hehe', 1, 1.00, 1.00, 1.00),
(67, 'hehehe', 1, 1.00, 1.00, 1.00),
(69, 'cascawsc', 1, 1.00, 1.00, 1.00),
(70, 'hehehehehehe', 2, 2.00, 2.00, 2.00),
(71, 'eeeer', 2, 2.00, 2.00, 2.00),
(72, 'vegeee', 2, 2.00, 2.00, 2.00),
(73, 'fvs', 1, 1.00, 1.00, 1.00),
(74, 'vegedsew', 1, 1.00, 1.00, 1.00),
(75, 'gfe', 3, 3.00, 3.00, 3.00),
(78, 'f', 1, 1.00, 1.00, 1.00),
(79, 'fefe', 3, 3.00, 3.00, 3.00),
(80, 'fish', 2, 2.00, 2.00, 2.00),
(81, 'wq', 1, 1.00, 1.00, 1.00),
(82, 'ewfevfssevfds', 2, 2.00, 2.00, 2.00),
(83, 'pork', 2, 2.00, 2.00, 2.00),
(84, 'duckge', 2, 2.00, 2.00, 2.00),
(85, 'h', 7, 6.00, 6.00, 7.00);

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
  `workout_step_checklist` text DEFAULT NULL,
  `date_registered` date NOT NULL
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
  ADD UNIQUE KEY `diet_name` (`diet_name`),
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
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `username` (`username`);

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
-- AUTO_INCREMENT for table `diet`
--
ALTER TABLE `diet`
  MODIFY `diet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `diet_history`
--
ALTER TABLE `diet_history`
  MODIFY `diet_history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `member_performance`
--
ALTER TABLE `member_performance`
  MODIFY `performance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nutrition`
--
ALTER TABLE `nutrition`
  MODIFY `nutrition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `workout`
--
ALTER TABLE `workout`
  MODIFY `workout_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `workout_history`
--
ALTER TABLE `workout_history`
  MODIFY `workout_history_id` int(11) NOT NULL AUTO_INCREMENT;

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
