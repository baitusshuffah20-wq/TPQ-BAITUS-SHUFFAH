-- CreateTable
CREATE TABLE `musyrif` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `gender` VARCHAR(191) NOT NULL,
  `birthDate` DATETIME(3) NOT NULL,
  `birthPlace` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `specialization` VARCHAR(191) NULL,
  `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  `photo` VARCHAR(191) NULL,
  `educationData` TEXT NULL,
  `experienceData` TEXT NULL,
  `certificatesData` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `halaqahId` VARCHAR(191) NULL,

  UNIQUE INDEX `musyrif_halaqahId_key`(`halaqahId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `musyrif` ADD CONSTRAINT `musyrif_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif` ADD CONSTRAINT `musyrif_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;