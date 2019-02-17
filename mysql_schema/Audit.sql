DROP TABLE IF EXISTS `Audit`;

CREATE TABLE `Audit` (
  `id` BINARY(16) NOT NULL,
  `sessionId` BINARY(16),
  `username` VARCHAR(128),
  `emailAddress` VARCHAR(128),
  `entryData` JSON,
  `remoteIp` VARCHAR(128),
  `userAgent` VARCHAR(128),
  `createdTimestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
