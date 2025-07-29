-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 25 Jul 2025 pada 08.38
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_tpq`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `achievement_badges`
--

CREATE TABLE `achievement_badges` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `nameArabic` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `icon` varchar(191) NOT NULL,
  `color` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `criteriaType` varchar(191) NOT NULL,
  `criteriaValue` int(11) NOT NULL,
  `criteriaCondition` varchar(191) NOT NULL,
  `timeframe` varchar(191) DEFAULT NULL,
  `rarity` varchar(191) NOT NULL,
  `points` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `unlockMessage` varchar(191) NOT NULL,
  `shareMessage` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `assessments`
--

CREATE TABLE `assessments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `santriId` varchar(36) NOT NULL,
  `halaqahId` varchar(36) NOT NULL,
  `assessorId` varchar(36) NOT NULL,
  `type` enum('QURAN','TAHSIN','AKHLAQ') NOT NULL,
  `category` varchar(100) NOT NULL,
  `surah` varchar(100) DEFAULT NULL,
  `ayahStart` int(11) DEFAULT NULL,
  `ayahEnd` int(11) DEFAULT NULL,
  `score` decimal(5,2) NOT NULL,
  `grade` enum('A','B','C','D','E') NOT NULL,
  `notes` text DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `improvements` text DEFAULT NULL,
  `assessedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance`
--

CREATE TABLE `attendance` (
  `id` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL,
  `checkInTime` datetime(3) DEFAULT NULL,
  `checkOutTime` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `photo` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `santriId` varchar(191) NOT NULL,
  `halaqahId` varchar(191) NOT NULL,
  `musyrifId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `oldData` varchar(191) DEFAULT NULL,
  `newData` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `behavior`
--

CREATE TABLE `behavior` (
  `id` varchar(191) NOT NULL,
  `santriId` varchar(191) NOT NULL,
  `halaqahId` varchar(191) DEFAULT NULL,
  `criteriaId` varchar(191) NOT NULL,
  `criteriaName` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `severity` varchar(191) NOT NULL DEFAULT 'LOW',
  `points` int(11) NOT NULL DEFAULT 0,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `time` varchar(191) DEFAULT NULL,
  `description` varchar(191) NOT NULL,
  `context` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
  `recordedBy` varchar(191) NOT NULL,
  `recordedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `followUpRequired` tinyint(1) NOT NULL DEFAULT 0,
  `parentNotified` tinyint(1) NOT NULL DEFAULT 0,
  `parentNotifiedAt` datetime(3) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `behavior_alerts`
--

CREATE TABLE `behavior_alerts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `santri_id` varchar(36) NOT NULL,
  `alert_type` enum('PATTERN','SEVERITY','FREQUENCY','GOAL_RISK','IMPROVEMENT') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
  `trigger_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`trigger_criteria`)),
  `is_read` tinyint(1) DEFAULT 0,
  `is_resolved` tinyint(1) DEFAULT 0,
  `action_required` tinyint(1) DEFAULT 0,
  `assigned_to` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`assigned_to`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `behavior_criteria`
--

CREATE TABLE `behavior_criteria` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `name_arabic` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` enum('AKHLAQ','IBADAH','ACADEMIC','SOCIAL','DISCIPLINE','LEADERSHIP') NOT NULL,
  `type` enum('POSITIVE','NEGATIVE','NEUTRAL') NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
  `points` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `age_group` varchar(20) DEFAULT '5+',
  `examples` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`examples`)),
  `consequences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`consequences`)),
  `rewards` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rewards`)),
  `islamic_reference` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`islamic_reference`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `behavior_records`
--

CREATE TABLE `behavior_records` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `santri_id` varchar(36) NOT NULL,
  `halaqah_id` varchar(36) DEFAULT NULL,
  `criteria_id` varchar(36) DEFAULT NULL,
  `category` enum('AKHLAQ','IBADAH','ACADEMIC','SOCIAL','DISCIPLINE','LEADERSHIP') NOT NULL,
  `type` enum('POSITIVE','NEGATIVE','NEUTRAL') NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
  `points` int(11) NOT NULL DEFAULT 0,
  `date` date NOT NULL,
  `time` time DEFAULT NULL,
  `description` text DEFAULT NULL,
  `context` text DEFAULT NULL,
  `witnesses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`witnesses`)),
  `location` varchar(100) DEFAULT NULL,
  `status` enum('ACTIVE','RESOLVED','FOLLOW_UP','ESCALATED') DEFAULT 'ACTIVE',
  `recorded_by` varchar(36) NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `follow_up_notes` text DEFAULT NULL,
  `parent_notified` tinyint(1) DEFAULT 0,
  `parent_notified_at` timestamp NULL DEFAULT NULL,
  `resolution` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resolution`)),
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `behavior_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `behavior_summary` (
`santri_id` varchar(191)
,`santri_name` varchar(191)
,`nis` varchar(191)
,`halaqah_name` varchar(191)
,`total_records` bigint(21)
,`positive_count` decimal(22,0)
,`negative_count` decimal(22,0)
,`total_points` decimal(32,0)
,`average_points` decimal(14,4)
,`last_record_date` date
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `character_goals`
--

CREATE TABLE `character_goals` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `santri_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('AKHLAQ','IBADAH','ACADEMIC','SOCIAL','DISCIPLINE','LEADERSHIP') NOT NULL,
  `target_behaviors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_behaviors`)),
  `target_date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` enum('ACTIVE','COMPLETED','PAUSED','CANCELLED') DEFAULT 'ACTIVE',
  `progress` int(11) DEFAULT 0,
  `milestones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`milestones`)),
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `parent_involved` tinyint(1) DEFAULT 0,
  `musyrif_notes` text DEFAULT NULL,
  `parent_feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `donations`
--

CREATE TABLE `donations` (
  `id` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `donorName` varchar(191) NOT NULL,
  `donorEmail` varchar(191) DEFAULT NULL,
  `donorPhone` varchar(191) DEFAULT NULL,
  `purpose` varchar(191) NOT NULL,
  `message` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `paymentMethod` varchar(191) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `confirmedAt` datetime(3) DEFAULT NULL,
  `confirmedBy` varchar(191) DEFAULT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `isAnonymous` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `donation_categories`
--

CREATE TABLE `donation_categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `target` int(11) NOT NULL DEFAULT 0,
  `collected` int(11) NOT NULL DEFAULT 0,
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `bgColor` varchar(191) DEFAULT NULL,
  `urgent` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_logs`
--

CREATE TABLE `email_logs` (
  `id` varchar(191) NOT NULL,
  `recipient` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `messageId` varchar(191) NOT NULL,
  `template` varchar(191) NOT NULL DEFAULT '',
  `error` varchar(191) NOT NULL DEFAULT '',
  `sentAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_messages`
--

CREATE TABLE `email_messages` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `sentAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_templates`
--

CREATE TABLE `email_templates` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdById` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `employee_attendance_stats`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `employee_attendance_stats` (
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `financial_accounts`
--

CREATE TABLE `financial_accounts` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `accountType` varchar(191) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `financial_reports`
--

CREATE TABLE `financial_reports` (
  `id` varchar(191) NOT NULL,
  `reportType` varchar(191) NOT NULL,
  `period` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `data` varchar(191) NOT NULL,
  `summary` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `generatedBy` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `hafalan`
--

CREATE TABLE `hafalan` (
  `id` varchar(191) NOT NULL,
  `surahId` int(11) NOT NULL,
  `surahName` varchar(191) NOT NULL,
  `ayahStart` int(11) NOT NULL,
  `ayahEnd` int(11) NOT NULL,
  `type` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `grade` int(11) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `recordedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `santriId` varchar(191) NOT NULL,
  `musyrifId` varchar(191) NOT NULL,
  `audioUrl` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `hafalan_progress`
--

CREATE TABLE `hafalan_progress` (
  `id` varchar(191) NOT NULL,
  `santriId` varchar(191) NOT NULL,
  `surahId` int(11) NOT NULL,
  `surahName` varchar(191) NOT NULL,
  `totalAyah` int(11) NOT NULL,
  `memorized` int(11) NOT NULL DEFAULT 0,
  `inProgress` int(11) NOT NULL DEFAULT 0,
  `lastAyah` int(11) NOT NULL DEFAULT 0,
  `startDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `targetDate` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'IN_PROGRESS',
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `halaqah`
--

CREATE TABLE `halaqah` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `capacity` int(11) NOT NULL DEFAULT 20,
  `level` varchar(191) NOT NULL DEFAULT 'BEGINNER',
  `status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `musyrifId` varchar(191) DEFAULT NULL,
  `room` varchar(191) DEFAULT NULL,
  `schedule` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `halaqah_schedules`
--

CREATE TABLE `halaqah_schedules` (
  `id` varchar(191) NOT NULL,
  `dayOfWeek` int(11) NOT NULL,
  `startTime` varchar(191) NOT NULL,
  `endTime` varchar(191) NOT NULL,
  `room` varchar(191) NOT NULL DEFAULT '',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `halaqahId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `musyrif`
--

CREATE TABLE `musyrif` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `gender` varchar(191) NOT NULL,
  `birthDate` datetime(3) NOT NULL,
  `birthPlace` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `specialization` varchar(191) DEFAULT NULL,
  `joinDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
  `photo` varchar(191) DEFAULT NULL,
  `educationData` varchar(191) DEFAULT NULL,
  `experienceData` varchar(191) DEFAULT NULL,
  `certificatesData` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `halaqahId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `news`
--

CREATE TABLE `news` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `excerpt` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `author` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'DRAFT',
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notification_templates`
--

CREATE TABLE `notification_templates` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdById` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `orderNumber` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `totalAmount` double NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `shippingAddress` varchar(191) DEFAULT NULL,
  `paymentMethod` varchar(191) DEFAULT NULL,
  `paymentStatus` varchar(191) NOT NULL DEFAULT 'PENDING',
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `amount` int(11) NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `paidDate` datetime(3) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `method` varchar(191) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `midtransToken` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `santriId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `paymentMethod` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `reference` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `payroll_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `payroll_summary` (
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `price` double NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image` varchar(191) DEFAULT NULL,
  `category` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `programs`
--

CREATE TABLE `programs` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `features` varchar(191) NOT NULL,
  `duration` varchar(191) NOT NULL,
  `ageGroup` varchar(191) NOT NULL,
  `schedule` varchar(191) NOT NULL,
  `price` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `santri`
--

CREATE TABLE `santri` (
  `id` varchar(191) NOT NULL,
  `nis` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `birthDate` datetime(3) NOT NULL,
  `birthPlace` varchar(191) NOT NULL,
  `gender` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `photo` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'ACTIVE',
  `enrollmentDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `graduationDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `waliId` varchar(191) NOT NULL,
  `halaqahId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `santri_achievements`
--

CREATE TABLE `santri_achievements` (
  `id` varchar(191) NOT NULL,
  `santriId` varchar(191) NOT NULL,
  `badgeId` varchar(191) NOT NULL,
  `awardedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `site_settings`
--

CREATE TABLE `site_settings` (
  `id` varchar(191) NOT NULL,
  `siteName` varchar(191) NOT NULL DEFAULT 'Rumah Tahfidz Baitus Shuffah',
  `siteDescription` varchar(191) NOT NULL DEFAULT 'Sistem Informasi Rumah Tahfidz',
  `contactEmail` varchar(191) NOT NULL DEFAULT 'info@rumahtahfidz.com',
  `contactPhone` varchar(191) NOT NULL DEFAULT '+62123456789',
  `address` varchar(191) NOT NULL DEFAULT 'Jl. Contoh No. 123, Jakarta',
  `socialFacebook` varchar(191) DEFAULT NULL,
  `socialInstagram` varchar(191) DEFAULT NULL,
  `socialTwitter` varchar(191) DEFAULT NULL,
  `socialYoutube` varchar(191) DEFAULT NULL,
  `logoUrl` varchar(191) DEFAULT NULL,
  `faviconUrl` varchar(191) DEFAULT NULL,
  `maintenanceMode` tinyint(1) NOT NULL DEFAULT 0,
  `registrationOpen` tinyint(1) NOT NULL DEFAULT 1,
  `paymentGateway` varchar(191) NOT NULL DEFAULT 'MANUAL',
  `paymentApiKey` varchar(191) DEFAULT NULL,
  `whatsappApiKey` varchar(191) DEFAULT NULL,
  `whatsappInstance` varchar(191) DEFAULT NULL,
  `emailSmtpHost` varchar(191) DEFAULT NULL,
  `emailSmtpPort` int(11) DEFAULT NULL,
  `emailSmtpUser` varchar(191) DEFAULT NULL,
  `emailSmtpPass` varchar(191) DEFAULT NULL,
  `emailFromAddress` varchar(191) DEFAULT NULL,
  `emailFromName` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `spp_records`
--

CREATE TABLE `spp_records` (
  `id` varchar(191) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `amount` double NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `paidDate` datetime(3) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `paidAmount` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `fine` double NOT NULL DEFAULT 0,
  `notes` varchar(191) DEFAULT NULL,
  `paymentMethod` varchar(191) DEFAULT NULL,
  `receiptNumber` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `santriId` varchar(191) NOT NULL,
  `sppSettingId` varchar(191) NOT NULL,
  `transactionId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `spp_settings`
--

CREATE TABLE `spp_settings` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `level` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `testimonials`
--

CREATE TABLE `testimonials` (
  `id` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `isApproved` tinyint(1) NOT NULL DEFAULT 0,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `santriId` varchar(191) DEFAULT NULL,
  `waliId` varchar(191) DEFAULT NULL,
  `authorName` varchar(191) NOT NULL,
  `authorRole` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `themes`
--

CREATE TABLE `themes` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `colors` varchar(191) NOT NULL,
  `buttons` varchar(191) NOT NULL,
  `fonts` varchar(191) NOT NULL,
  `layout` varchar(191) NOT NULL,
  `logo` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `userId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(191) NOT NULL,
  `transactionType` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'COMPLETED',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` varchar(191) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `santriId` varchar(191) DEFAULT NULL,
  `paymentId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `role` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `halaqahId` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `whatsapp_incoming`
--

CREATE TABLE `whatsapp_incoming` (
  `id` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `senderPhone` varchar(191) NOT NULL,
  `messageType` varchar(191) NOT NULL,
  `messageContent` varchar(191) NOT NULL,
  `receivedAt` datetime(3) NOT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT 0,
  `processedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `whatsapp_logs`
--

CREATE TABLE `whatsapp_logs` (
  `id` varchar(191) NOT NULL,
  `recipientId` varchar(191) NOT NULL,
  `messageType` varchar(191) NOT NULL,
  `messageData` varchar(191) NOT NULL,
  `messageId` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `sentAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deliveredAt` datetime(3) DEFAULT NULL,
  `readAt` datetime(3) DEFAULT NULL,
  `failedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `whatsapp_messages`
--

CREATE TABLE `whatsapp_messages` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `messageType` varchar(191) NOT NULL,
  `content` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `sentAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `achievement_badges`
--
ALTER TABLE `achievement_badges`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_santri_id` (`santriId`),
  ADD KEY `idx_halaqah_id` (`halaqahId`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_assessed_at` (`assessedAt`);

--
-- Indeks untuk tabel `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendance_santriId_halaqahId_date_key` (`santriId`,`halaqahId`,`date`),
  ADD KEY `attendance_halaqahId_fkey` (`halaqahId`),
  ADD KEY `attendance_musyrifId_fkey` (`musyrifId`);

--
-- Indeks untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `behavior`
--
ALTER TABLE `behavior`
  ADD PRIMARY KEY (`id`),
  ADD KEY `behavior_santriId_fkey` (`santriId`),
  ADD KEY `behavior_halaqahId_fkey` (`halaqahId`),
  ADD KEY `behavior_recordedBy_fkey` (`recordedBy`);

--
-- Indeks untuk tabel `behavior_alerts`
--
ALTER TABLE `behavior_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_santri` (`santri_id`),
  ADD KEY `idx_type` (`alert_type`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_read` (`is_read`),
  ADD KEY `idx_resolved` (`is_resolved`);

--
-- Indeks untuk tabel `behavior_criteria`
--
ALTER TABLE `behavior_criteria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indeks untuk tabel `behavior_records`
--
ALTER TABLE `behavior_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_santri` (`santri_id`),
  ADD KEY `idx_halaqah` (`halaqah_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_recorded_by` (`recorded_by`);

--
-- Indeks untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_productId_fkey` (`productId`),
  ADD KEY `cart_items_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `character_goals`
--
ALTER TABLE `character_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_santri` (`santri_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_target_date` (`target_date`);

--
-- Indeks untuk tabel `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donations_categoryId_fkey` (`categoryId`),
  ADD KEY `donations_confirmedBy_fkey` (`confirmedBy`);

--
-- Indeks untuk tabel `donation_categories`
--
ALTER TABLE `donation_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `email_messages`
--
ALTER TABLE `email_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_messages_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_templates_createdById_fkey` (`createdById`);

--
-- Indeks untuk tabel `financial_accounts`
--
ALTER TABLE `financial_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `financial_reports`
--
ALTER TABLE `financial_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `financial_reports_generatedBy_fkey` (`generatedBy`);

--
-- Indeks untuk tabel `hafalan`
--
ALTER TABLE `hafalan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hafalan_musyrifId_fkey` (`musyrifId`),
  ADD KEY `hafalan_santriId_fkey` (`santriId`);

--
-- Indeks untuk tabel `hafalan_progress`
--
ALTER TABLE `hafalan_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hafalan_progress_santriId_surahId_key` (`santriId`,`surahId`),
  ADD KEY `hafalan_progress_santriId_fkey` (`santriId`);

--
-- Indeks untuk tabel `halaqah`
--
ALTER TABLE `halaqah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `halaqah_musyrifId_key` (`musyrifId`);

--
-- Indeks untuk tabel `halaqah_schedules`
--
ALTER TABLE `halaqah_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `halaqah_schedules_halaqahId_fkey` (`halaqahId`);

--
-- Indeks untuk tabel `musyrif`
--
ALTER TABLE `musyrif`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `musyrif_halaqahId_key` (`halaqahId`),
  ADD KEY `musyrif_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_createdBy_fkey` (`createdBy`),
  ADD KEY `notifications_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_templates_createdById_fkey` (`createdById`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  ADD KEY `orders_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_fkey` (`orderId`),
  ADD KEY `order_items_productId_fkey` (`productId`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_santriId_fkey` (`santriId`);

--
-- Indeks untuk tabel `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_transactions_orderId_fkey` (`orderId`),
  ADD KEY `payment_transactions_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `santri`
--
ALTER TABLE `santri`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `santri_nis_key` (`nis`),
  ADD KEY `santri_halaqahId_fkey` (`halaqahId`),
  ADD KEY `santri_waliId_fkey` (`waliId`);

--
-- Indeks untuk tabel `santri_achievements`
--
ALTER TABLE `santri_achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `santri_achievements_santriId_badgeId_key` (`santriId`,`badgeId`),
  ADD KEY `santri_achievements_badgeId_fkey` (`badgeId`);

--
-- Indeks untuk tabel `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `spp_records`
--
ALTER TABLE `spp_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `spp_records_santriId_month_year_key` (`santriId`,`month`,`year`),
  ADD UNIQUE KEY `spp_records_transactionId_key` (`transactionId`),
  ADD KEY `spp_records_sppSettingId_fkey` (`sppSettingId`);

--
-- Indeks untuk tabel `spp_settings`
--
ALTER TABLE `spp_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscriptions_email_key` (`email`),
  ADD KEY `subscriptions_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `testimonials_santriId_fkey` (`santriId`),
  ADD KEY `testimonials_waliId_fkey` (`waliId`);

--
-- Indeks untuk tabel `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `theme_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_accountId_fkey` (`accountId`),
  ADD KEY `transactions_createdById_fkey` (`createdById`),
  ADD KEY `transactions_paymentId_fkey` (`paymentId`),
  ADD KEY `transactions_santriId_fkey` (`santriId`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indeks untuk tabel `whatsapp_incoming`
--
ALTER TABLE `whatsapp_incoming`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whatsapp_incoming_senderId_fkey` (`senderId`);

--
-- Indeks untuk tabel `whatsapp_logs`
--
ALTER TABLE `whatsapp_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whatsapp_logs_recipientId_fkey` (`recipientId`);

--
-- Indeks untuk tabel `whatsapp_messages`
--
ALTER TABLE `whatsapp_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whatsapp_messages_userId_fkey` (`userId`);

--
-- Indeks untuk tabel `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

-- --------------------------------------------------------

--
-- Struktur untuk view `behavior_summary`
--
DROP TABLE IF EXISTS `behavior_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `behavior_summary`  AS SELECT `s`.`id` AS `santri_id`, `s`.`name` AS `santri_name`, `s`.`nis` AS `nis`, `h`.`name` AS `halaqah_name`, count(`br`.`id`) AS `total_records`, sum(case when `br`.`type` = 'POSITIVE' then 1 else 0 end) AS `positive_count`, sum(case when `br`.`type` = 'NEGATIVE' then 1 else 0 end) AS `negative_count`, sum(`br`.`points`) AS `total_points`, avg(`br`.`points`) AS `average_points`, max(`br`.`date`) AS `last_record_date` FROM ((`santri` `s` left join `halaqah` `h` on(`s`.`halaqahId` = `h`.`id`)) left join `behavior_records` `br` on(`s`.`id` = `br`.`santri_id`)) WHERE `s`.`status` = 'ACTIVE' GROUP BY `s`.`id`, `s`.`name`, `s`.`nis`, `h`.`name` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `employee_attendance_stats`
--
DROP TABLE IF EXISTS `employee_attendance_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `employee_attendance_stats`  AS SELECT `p`.`employee_id` AS `employee_id`, `p`.`employee_name` AS `employee_name`, `p`.`employee_position` AS `employee_position`, `p`.`period_year` AS `period_year`, sum(`p`.`total_sessions`) AS `total_sessions_year`, sum(`p`.`attended_sessions`) AS `attended_sessions_year`, sum(`p`.`absent_sessions`) AS `absent_sessions_year`, sum(`p`.`late_sessions`) AS `late_sessions_year`, avg(`p`.`attended_sessions` / nullif(`p`.`total_sessions`,0) * 100) AS `avg_attendance_percentage`, sum(`p`.`gross_salary`) AS `total_gross_salary_year`, sum(`p`.`net_salary`) AS `total_net_salary_year` FROM `payroll` AS `p` WHERE `p`.`status` <> 'CANCELLED' GROUP BY `p`.`employee_id`, `p`.`employee_name`, `p`.`employee_position`, `p`.`period_year` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `payroll_summary`
--
DROP TABLE IF EXISTS `payroll_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `payroll_summary`  AS SELECT `p`.`id` AS `id`, `p`.`employee_id` AS `employee_id`, `p`.`employee_name` AS `employee_name`, `p`.`employee_position` AS `employee_position`, `p`.`period_month` AS `period_month`, `p`.`period_year` AS `period_year`, `p`.`total_sessions` AS `total_sessions`, `p`.`attended_sessions` AS `attended_sessions`, `p`.`absent_sessions` AS `absent_sessions`, `p`.`late_sessions` AS `late_sessions`, `p`.`overtime_hours` AS `overtime_hours`, `p`.`base_salary` AS `base_salary`, `p`.`session_rate` AS `session_rate`, `p`.`attendance_bonus` AS `attendance_bonus`, `p`.`overtime_pay` AS `overtime_pay`, `p`.`allowances` AS `allowances`, `p`.`deductions` AS `deductions`, `p`.`gross_salary` AS `gross_salary`, `p`.`net_salary` AS `net_salary`, `p`.`status` AS `status`, `p`.`generated_at` AS `generated_at`, `p`.`approved_at` AS `approved_at`, `p`.`paid_at` AS `paid_at`, `p`.`approved_by` AS `approved_by`, `p`.`paid_by` AS `paid_by`, `p`.`notes` AS `notes`, `p`.`calculation_details` AS `calculation_details`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at`, `u`.`name` AS `employee_full_name`, `u`.`email` AS `employee_email`, `u`.`phone` AS `employee_phone`, `ss`.`salary_type` AS `salary_type`, `ss`.`base_amount` AS `setting_base_amount`, CASE WHEN `p`.`status` = 'PAID' THEN 'Sudah Dibayar' WHEN `p`.`status` = 'APPROVED' THEN 'Disetujui' WHEN `p`.`status` = 'DRAFT' THEN 'Draft' ELSE 'Dibatalkan' END AS `status_text`, concat(`p`.`period_month`,'/',`p`.`period_year`) AS `period_display`, `p`.`attended_sessions`/ nullif(`p`.`total_sessions`,0) * 100 AS `attendance_percentage` FROM ((`payroll` `p` left join `users` `u` on(`p`.`employee_id` = `u`.`id`)) left join `salary_settings` `ss` on(`p`.`employee_position` = `ss`.`position` and `ss`.`is_active` = 1)) ;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `behavior`
--
ALTER TABLE `behavior`
  ADD CONSTRAINT `behavior_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `behavior_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `behavior_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `donation_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `donations_confirmedBy_fkey` FOREIGN KEY (`confirmedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `email_messages`
--
ALTER TABLE `email_messages`
  ADD CONSTRAINT `email_messages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `email_templates`
--
ALTER TABLE `email_templates`
  ADD CONSTRAINT `email_templates_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `financial_reports`
--
ALTER TABLE `financial_reports`
  ADD CONSTRAINT `financial_reports_generatedBy_fkey` FOREIGN KEY (`generatedBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `hafalan`
--
ALTER TABLE `hafalan`
  ADD CONSTRAINT `hafalan_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `hafalan_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `hafalan_progress`
--
ALTER TABLE `hafalan_progress`
  ADD CONSTRAINT `hafalan_progress_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `halaqah`
--
ALTER TABLE `halaqah`
  ADD CONSTRAINT `halaqah_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `halaqah_schedules`
--
ALTER TABLE `halaqah_schedules`
  ADD CONSTRAINT `halaqah_schedules_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `musyrif`
--
ALTER TABLE `musyrif`
  ADD CONSTRAINT `musyrif_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD CONSTRAINT `notification_templates_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `santri`
--
ALTER TABLE `santri`
  ADD CONSTRAINT `santri_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `santri_waliId_fkey` FOREIGN KEY (`waliId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `santri_achievements`
--
ALTER TABLE `santri_achievements`
  ADD CONSTRAINT `santri_achievements_badgeId_fkey` FOREIGN KEY (`badgeId`) REFERENCES `achievement_badges` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `santri_achievements_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `spp_records`
--
ALTER TABLE `spp_records`
  ADD CONSTRAINT `spp_records_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `spp_records_sppSettingId_fkey` FOREIGN KEY (`sppSettingId`) REFERENCES `spp_settings` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `spp_records_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `testimonials_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `testimonials_waliId_fkey` FOREIGN KEY (`waliId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `themes`
--
ALTER TABLE `themes`
  ADD CONSTRAINT `themes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `financial_accounts` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `whatsapp_incoming`
--
ALTER TABLE `whatsapp_incoming`
  ADD CONSTRAINT `whatsapp_incoming_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `whatsapp_logs`
--
ALTER TABLE `whatsapp_logs`
  ADD CONSTRAINT `whatsapp_logs_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `whatsapp_messages`
--
ALTER TABLE `whatsapp_messages`
  ADD CONSTRAINT `whatsapp_messages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
