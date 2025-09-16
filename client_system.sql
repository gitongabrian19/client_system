/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: client_system
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,'admin','$2y$10$TX5Fqc6u2MPZK0VD0A04F.tfLuIG.vKgKtEZs4YI8DGLbRTQGcXou',NULL,'2025-06-02 11:47:36','2025-06-02 11:47:36');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `ip_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `device_id` (`device_id`),
  KEY `ip_id` (`ip_id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `clients_ibfk_2` FOREIGN KEY (`ip_id`) REFERENCES `ip_addresses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES
(1,'saif',1,81,'','0729456159','2025-06-03 06:10:04','2025-06-03 06:10:04'),
(2,'Kariuki',1,86,'','0726070752','2025-06-10 10:32:39','2025-06-10 10:32:39'),
(3,'Lawrence',1,167,'keria-road','0700123457','2025-08-26 08:16:00','2025-08-26 08:16:00');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_relationships`
--

DROP TABLE IF EXISTS `device_relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_relationships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_device_id` int(11) NOT NULL,
  `child_device_id` int(11) NOT NULL,
  `relationship_type` enum('router_to_switch','switch_to_router','router_to_ap') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`parent_device_id`,`child_device_id`),
  KEY `child_device_id` (`child_device_id`),
  CONSTRAINT `device_relationships_ibfk_1` FOREIGN KEY (`parent_device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `device_relationships_ibfk_2` FOREIGN KEY (`child_device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_relationships`
--

LOCK TABLES `device_relationships` WRITE;
/*!40000 ALTER TABLE `device_relationships` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_name` varchar(255) NOT NULL,
  `device_type` enum('switch','router','ap','gateway','firewall','other') DEFAULT 'other',
  `mac_address` varchar(17),
  `management_ip` varchar(15) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `isp_name` varchar(50) DEFAULT NULL,
  `subnet_range` varchar(18) DEFAULT NULL,
  `is_main_router` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mac_address` (`mac_address`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES
(1,'Netonix','switch','A0:1A:2B:3C:DD:5E','192.168.10.2',2,'',NULL,NULL,0,'2025-06-03 05:53:26','2025-06-03 05:53:26'),
(2,'MIKROTIK L009UIGS-RM Router','router','A0:1A:2B:3C:4D:5E','192.168.10.1',2,'',NULL,NULL,0,'2025-06-03 05:57:08','2025-06-03 05:57:08'),
(3,'cisco','switch','A0:1A:2B:3C:4D:9E','192.168.12.1',1,'Keria',NULL,NULL,0,'2025-08-26 08:10:43','2025-08-26 08:10:43');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ip_addresses`
--

DROP TABLE IF EXISTS `ip_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ip_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(15) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `subnet_id` varchar(18) DEFAULT NULL,
  `is_gateway` tinyint(1) DEFAULT 0,
  `is_reserved` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_address` (`ip_address`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `ip_addresses_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=236 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ip_addresses`
--

LOCK TABLES `ip_addresses` WRITE;
/*!40000 ALTER TABLE `ip_addresses` DISABLE KEYS */;
INSERT INTO `ip_addresses` VALUES
(1,'192.168.10.1',1,NULL,0,0,'Gateway IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(2,'192.168.10.21',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(3,'192.168.10.22',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(4,'192.168.10.23',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(5,'192.168.10.24',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(6,'192.168.10.25',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(7,'192.168.10.26',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(8,'192.168.10.27',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(9,'192.168.10.28',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(10,'192.168.10.29',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(11,'192.168.10.30',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(12,'192.168.10.31',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(13,'192.168.10.32',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(14,'192.168.10.33',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(15,'192.168.10.34',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(16,'192.168.10.35',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(17,'192.168.10.36',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(18,'192.168.10.37',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(19,'192.168.10.38',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(20,'192.168.10.39',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(21,'192.168.10.40',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(22,'192.168.10.41',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(23,'192.168.10.42',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(24,'192.168.10.43',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(25,'192.168.10.44',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(26,'192.168.10.45',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(27,'192.168.10.46',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(28,'192.168.10.47',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(29,'192.168.10.48',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(30,'192.168.10.49',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(31,'192.168.10.50',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(32,'192.168.10.51',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(33,'192.168.10.52',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(34,'192.168.10.53',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(35,'192.168.10.54',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(36,'192.168.10.55',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(37,'192.168.10.56',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(38,'192.168.10.57',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(39,'192.168.10.58',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(40,'192.168.10.59',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(41,'192.168.10.60',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(42,'192.168.10.61',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(43,'192.168.10.62',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(44,'192.168.10.63',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(45,'192.168.10.64',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(46,'192.168.10.65',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(47,'192.168.10.66',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(48,'192.168.10.67',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(49,'192.168.10.68',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(50,'192.168.10.69',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(51,'192.168.10.70',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(52,'192.168.10.71',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(53,'192.168.10.72',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(54,'192.168.10.73',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(55,'192.168.10.74',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(56,'192.168.10.75',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(57,'192.168.10.76',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(58,'192.168.10.77',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(59,'192.168.10.78',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(60,'192.168.10.79',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(61,'192.168.10.80',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(62,'192.168.10.81',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(63,'192.168.10.82',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(64,'192.168.10.83',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(65,'192.168.10.84',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(66,'192.168.10.85',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(67,'192.168.10.86',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(68,'192.168.10.87',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(69,'192.168.10.88',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(70,'192.168.10.89',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(71,'192.168.10.90',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(72,'192.168.10.91',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(73,'192.168.10.92',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(74,'192.168.10.93',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(75,'192.168.10.94',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(76,'192.168.10.95',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(77,'192.168.10.96',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(78,'192.168.10.97',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(79,'192.168.10.98',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(80,'192.168.10.99',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(81,'192.168.10.100',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(82,'192.168.10.101',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(83,'192.168.10.102',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(84,'192.168.10.103',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(85,'192.168.10.104',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(86,'192.168.10.105',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(87,'192.168.10.106',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(88,'192.168.10.107',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(89,'192.168.10.108',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(90,'192.168.10.109',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(91,'192.168.10.110',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(92,'192.168.10.111',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(93,'192.168.10.112',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(94,'192.168.10.113',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(95,'192.168.10.114',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(96,'192.168.10.115',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(97,'192.168.10.116',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(98,'192.168.10.117',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(99,'192.168.10.118',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(100,'192.168.10.119',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(101,'192.168.10.120',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(102,'192.168.10.121',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(103,'192.168.10.122',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(104,'192.168.10.123',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(105,'192.168.10.124',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(106,'192.168.10.125',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(107,'192.168.10.126',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(108,'192.168.10.127',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(109,'192.168.10.128',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(110,'192.168.10.129',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(111,'192.168.10.130',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(112,'192.168.10.131',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(113,'192.168.10.132',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(114,'192.168.10.133',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(115,'192.168.10.134',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(116,'192.168.10.135',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(117,'192.168.10.136',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(118,'192.168.10.137',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(119,'192.168.10.138',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(120,'192.168.10.139',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(121,'192.168.10.140',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(122,'192.168.10.141',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(123,'192.168.10.142',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(124,'192.168.10.143',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(125,'192.168.10.144',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(126,'192.168.10.145',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(127,'192.168.10.146',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(128,'192.168.10.147',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(129,'192.168.10.148',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(130,'192.168.10.149',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(131,'192.168.10.150',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(132,'192.168.10.151',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(133,'192.168.10.152',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(134,'192.168.10.153',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(135,'192.168.10.154',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(136,'192.168.10.155',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(137,'192.168.10.156',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(138,'192.168.10.157',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(139,'192.168.10.158',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(140,'192.168.10.159',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(141,'192.168.10.160',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(142,'192.168.10.161',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(143,'192.168.10.162',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(144,'192.168.10.163',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(145,'192.168.10.164',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(146,'192.168.10.165',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(147,'192.168.10.166',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(148,'192.168.10.167',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(149,'192.168.10.168',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(150,'192.168.10.169',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(151,'192.168.10.170',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(152,'192.168.10.171',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(153,'192.168.10.172',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(154,'192.168.10.173',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(155,'192.168.10.174',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(156,'192.168.10.175',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(157,'192.168.10.176',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(158,'192.168.10.177',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(159,'192.168.10.178',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(160,'192.168.10.179',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(161,'192.168.10.180',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(162,'192.168.10.181',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(163,'192.168.10.182',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(164,'192.168.10.183',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(165,'192.168.10.184',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(166,'192.168.10.185',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(167,'192.168.10.186',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(168,'192.168.10.187',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(169,'192.168.10.188',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(170,'192.168.10.189',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(171,'192.168.10.190',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(172,'192.168.10.191',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(173,'192.168.10.192',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(174,'192.168.10.193',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(175,'192.168.10.194',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(176,'192.168.10.195',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(177,'192.168.10.196',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(178,'192.168.10.197',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(179,'192.168.10.198',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(180,'192.168.10.199',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(181,'192.168.10.200',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(182,'192.168.10.201',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(183,'192.168.10.202',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(184,'192.168.10.203',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(185,'192.168.10.204',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(186,'192.168.10.205',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(187,'192.168.10.206',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(188,'192.168.10.207',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(189,'192.168.10.208',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(190,'192.168.10.209',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(191,'192.168.10.210',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(192,'192.168.10.211',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(193,'192.168.10.212',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(194,'192.168.10.213',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(195,'192.168.10.214',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(196,'192.168.10.215',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(197,'192.168.10.216',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(198,'192.168.10.217',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(199,'192.168.10.218',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(200,'192.168.10.219',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(201,'192.168.10.220',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(202,'192.168.10.221',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(203,'192.168.10.222',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(204,'192.168.10.223',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(205,'192.168.10.224',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(206,'192.168.10.225',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(207,'192.168.10.226',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(208,'192.168.10.227',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(209,'192.168.10.228',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(210,'192.168.10.229',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(211,'192.168.10.230',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(212,'192.168.10.231',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(213,'192.168.10.232',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(214,'192.168.10.233',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(215,'192.168.10.234',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(216,'192.168.10.235',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(217,'192.168.10.236',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(218,'192.168.10.237',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(219,'192.168.10.238',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(220,'192.168.10.239',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(221,'192.168.10.240',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(222,'192.168.10.241',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(223,'192.168.10.242',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(224,'192.168.10.243',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(225,'192.168.10.244',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(226,'192.168.10.245',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(227,'192.168.10.246',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(228,'192.168.10.247',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(229,'192.168.10.248',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(230,'192.168.10.249',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(231,'192.168.10.250',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(232,'192.168.10.251',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(233,'192.168.10.252',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(234,'192.168.10.253',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37'),
(235,'192.168.10.254',1,NULL,0,0,'Auto-generated IP for Netonix',1,'2025-06-03 06:03:37','2025-06-03 06:03:37');
/*!40000 ALTER TABLE `ip_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES
(1,'Chuka','','2025-06-03 05:42:45','2025-06-03 05:42:45'),
(2,'Chogoria','','2025-06-03 05:45:46','2025-06-03 05:45:46'),
(3,'Keria','','2025-06-03 05:46:29','2025-06-03 05:46:29');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_logs`
--

DROP TABLE IF EXISTS `sms_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `sent_at` datetime NOT NULL,
  `status` varchar(20) DEFAULT 'sent',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_logs`
--

LOCK TABLES `sms_logs` WRITE;
/*!40000 ALTER TABLE `sms_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-04 11:22:43
