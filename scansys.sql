-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 30, 2019 at 09:54 PM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `scansys`
--

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `contents` text NOT NULL,
  `checkin` varchar(255) NOT NULL,
  `modify` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `sku`, `location`, `contents`, `checkin`, `modify`, `name`) VALUES
(1, '096619756803', 'My backpack', 'This is an ordinary water bottle.\r\n\r\nThis is also the first thing I have inserted into my program,\r\n\r\neverything on this page is finally working so I am excited\r\n----------------------------------------------------\r\n', 'caleb', 'caleb', 'Cosco Water'),
(30, '052000328684', 'My Desk', 'This is an empty Gatorade bottle, it contained lemon-lime.\r\n\r\n\r\nI have bought a second bottle, it is not empty!', 'caleb', 'caleb', 'Gatorade Bottle'),
(31, '022000019172', 'Jakes Desk', 'This is a bottle that contains pieces of orbit gum\r\n\r\nflavor: white\r\n', 'caleb', 'caleb', 'Orbit Gum'),
(32, '0241012323', 'My Desk', 'This is an empty cheezit bag I had for breakfast!', 'caleb', 'caleb', 'Cheez it'),
(33, '786162004864', 'Jakes Desk', 'This bottle if full.', 'caleb', 'caleb', 'SmartWater');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `name` varchar(255) NOT NULL,
  `data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`name`, `data`) VALUES
('motd', 'I need you guys to focus on reorganizing section D4 of the warehouse today!');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Level` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `Username`, `Password`, `Level`) VALUES
(1, 'Caleb', '27ef552c98167b257c198981e0dff562', 2),
(2, 'test', '27ef552c98167b257c198981e0dff562', 2),
(3, 'nonadmin', '27ef552c98167b257c198981e0dff562', 1),
(6, 'jason', '098f6bcd4621d373cade4e832627b4f6', 1),
(7, 'noadmin', '098f6bcd4621d373cade4e832627b4f6', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
