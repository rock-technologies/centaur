DROP TABLE IF EXISTS `Session`;

CREATE TABLE `Session` (
  `id` BINARY(16) NOT NULL,
  `userId` BINARY(16) NOT NULL,
  `emailAddress` VARCHAR(128) NOT NULL,
  `firstName` VARCHAR(128) NOT NULL,
  `lastName` VARCHAR(128) NOT NULL,
  `createdTimestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTimestamp` TIMESTAMP,
  `expirationTimestamp` TIMESTAMP,
  `isActive` BOOLEAN NOT NULL,
  `extensionData` JSON,
  `csrfToken` VARCHAR(64),
  PRIMARY KEY (`id`),
  INDEX `session_id` (`id` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
