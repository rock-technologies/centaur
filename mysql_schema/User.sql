DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
  `id` BINARY(16) NOT NULL,
  `lastName` VARCHAR(128) NOT NULL,
  `firstName` VARCHAR(128) NOT NULL,
  `emailAddress` VARCHAR(128) NOT NULL,
  `username` varchar(128) NOT NULL,
  `password` VARCHAR(512),
  `passwordResetToken` CHAR(36),
  `passwordResetDatetime` DATETIME,
  `createdByEmail` VARCHAR(128) NOT NULL,
  `createdTimestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTimestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userBlocked` boolean default false,
  `userBlockedTimestamp` TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
