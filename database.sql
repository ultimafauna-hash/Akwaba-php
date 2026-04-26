-- Database for Akwaba Info
-- Compatible PHP 7.4+ and MySQL 5.7+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `displayname` VARCHAR(255),
  `role` VARCHAR(50) DEFAULT 'user',
  `token` TEXT,
  `is_blocked` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: profiles
CREATE TABLE IF NOT EXISTS `profiles` (
  `uid` INT PRIMARY KEY,
  `username` VARCHAR(255) UNIQUE,
  `displayname` VARCHAR(255),
  `email` VARCHAR(255),
  `photourl` TEXT,
  `bio` TEXT,
  `phone` VARCHAR(50),
  `city` VARCHAR(100),
  `country` VARCHAR(100),
  `ispremium` TINYINT(1) DEFAULT 0,
  `premiumsince` TIMESTAMP NULL,
  `premiumuntil` TIMESTAMP NULL,
  `paymentmethod` VARCHAR(50),
  `likedarticles` TEXT, -- JSON array of IDs
  `bookmarkedarticles` TEXT, -- JSON array of IDs
  `followedauthors` TEXT, -- JSON array of IDs
  `followedcategories` TEXT, -- JSON array of IDs
  `votedpolls` TEXT, -- JSON array of IDs
  `badges` TEXT, -- JSON array of strings
  `points` INT DEFAULT 0,
  `kyc_level` INT DEFAULT 0,
  `kyc_status` VARCHAR(50) DEFAULT 'none',
  `kyc_documents` TEXT, -- JSON object
  `two_factor_enabled` TINYINT(1) DEFAULT 0,
  `two_factor_method` VARCHAR(50),
  `pin_code` VARCHAR(10),
  `language` VARCHAR(10) DEFAULT 'fr',
  `currency` VARCHAR(10) DEFAULT 'XOF',
  `timezone` VARCHAR(50) DEFAULT 'Africa/Abidjan',
  `font_size` VARCHAR(20) DEFAULT 'medium',
  `notification_preferences` TEXT, -- JSON object
  `privacy_settings` TEXT, -- JSON object
  `blocked_users` TEXT, -- JSON array
  `muted_keywords` TEXT, -- JSON array
  `referral_code` VARCHAR(50) UNIQUE,
  `referred_by` VARCHAR(50),
  `streak_days` INT DEFAULT 0,
  `last_active_date` DATE,
  `history` TEXT, -- JSON array
  `interests` TEXT, -- JSON array
  `status` VARCHAR(50) DEFAULT 'online',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: articles
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `date` VARCHAR(100),
  `category` VARCHAR(100),
  `image` TEXT,
  `video` TEXT,
  `audiourl` TEXT,
  `gallery` TEXT, -- JSON array
  `author` VARCHAR(255),
  `authorrole` VARCHAR(255),
  `excerpt` TEXT,
  `readingtime` VARCHAR(50),
  `imagecredit` VARCHAR(255),
  `source` VARCHAR(255),
  `views` INT DEFAULT 0,
  `likes` INT DEFAULT 0,
  `reactions` TEXT, -- JSON object
  `commentscount` INT DEFAULT 0,
  `tags` TEXT, -- JSON array
  `status` VARCHAR(50) DEFAULT 'published',
  `ispremium` TINYINT(1) DEFAULT 0,
  `scheduledat` TIMESTAMP NULL,
  `seotitle` VARCHAR(255),
  `seodescription` TEXT,
  `socialimage` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: events
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `date` VARCHAR(100),
  `time` VARCHAR(50),
  `location` VARCHAR(255),
  `category` VARCHAR(100),
  `image` TEXT,
  `video` TEXT,
  `isurgent` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'upcoming',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: comments
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `articleid` INT,
  `userid` INT,
  `author_name` VARCHAR(255),
  `author_image` TEXT,
  `content` TEXT NOT NULL,
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `likes` INT DEFAULT 0,
  `isadmin` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'approved',
  `reports` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: polls
CREATE TABLE IF NOT EXISTS `polls` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` TEXT NOT NULL,
  `options` TEXT NOT NULL, -- JSON array of objects {id, label, votes}
  `totalvotes` INT DEFAULT 0,
  `enddate` TIMESTAMP NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: culture_posts
CREATE TABLE IF NOT EXISTS `culture_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `image` TEXT,
  `video` TEXT,
  `category` VARCHAR(100),
  `author` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: live_blogs
CREATE TABLE IF NOT EXISTS `live_blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` TEXT,
  `status` VARCHAR(50) DEFAULT 'active',
  `updates` TEXT, -- JSON array of updates
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: web_tv
CREATE TABLE IF NOT EXISTS `web_tv` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `videourl` TEXT NOT NULL,
  `thumbnail` TEXT,
  `category` VARCHAR(100),
  `duration` VARCHAR(50),
  `views` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: classifieds
CREATE TABLE IF NOT EXISTS `classifieds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(15, 2),
  `contact` VARCHAR(200),
  `category` VARCHAR(100),
  `images` TEXT, -- JSON array
  `status` VARCHAR(50) DEFAULT 'active',
  `userid` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: authors
CREATE TABLE IF NOT EXISTS `authors` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255),
  `bio` TEXT,
  `image` TEXT,
  `socials` TEXT, -- JSON object
  `specialties` TEXT, -- JSON array
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: history
CREATE TABLE IF NOT EXISTS `history_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `date` VARCHAR(100),
  `image` TEXT,
  `year` INT,
  `category` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: map_points
CREATE TABLE IF NOT EXISTS `map_points` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `coordinates` VARCHAR(100), -- "lat,lng"
  `type` VARCHAR(50),
  `image` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: quizzes
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` TEXT,
  `questions` TEXT NOT NULL, -- JSON array
  `difficulty` VARCHAR(50),
  `category` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: stories
CREATE TABLE IF NOT EXISTS `stories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) DEFAULT 'image', -- 'image' or 'video'
  `url` TEXT NOT NULL,
  `duration` INT DEFAULT 5,
  `author` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: chats
CREATE TABLE IF NOT EXISTS `chats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `articleid` INT,
  `userid` INT,
  `username` VARCHAR(255),
  `content` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: support_messages
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userid` INT,
  `username` VARCHAR(255),
  `email` VARCHAR(255),
  `message` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'unread',
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userid` INT,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `read` TINYINT(1) DEFAULT 0,
  `type` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: subscribers
CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `sitename` VARCHAR(255) DEFAULT 'Akwaba Info',
  `description` TEXT,
  `urgentbannertext` TEXT,
  `adminemail` VARCHAR(255),
  `contactemail` VARCHAR(255),
  `whatsappnumber` VARCHAR(50),
  `sociallinks` TEXT, -- JSON object
  `paymentlinks` TEXT, -- JSON object
  `maintenance_mode` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userid` INT,
  `amount` DECIMAL(15, 2),
  `currency` VARCHAR(10) DEFAULT 'XOF',
  `method` VARCHAR(50),
  `status` VARCHAR(50) DEFAULT 'pending',
  `type` VARCHAR(50), -- 'subscription', 'donation'
  `transaction_id` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: blocked_users
CREATE TABLE IF NOT EXISTS `blocked_users_list` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userid` INT,
  `blocked_userid` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`blocked_userid`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: media
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `url` TEXT NOT NULL,
  `type` VARCHAR(50), -- 'image', 'video'
  `filename` VARCHAR(255),
  `size` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: admin_activity_log
CREATE TABLE IF NOT EXISTS `admin_activity_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT,
  `action` TEXT NOT NULL,
  `details` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
