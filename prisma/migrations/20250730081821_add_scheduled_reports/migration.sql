/*
  Warnings:

  - You are about to drop the column `productId` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `notifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `donation_categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cartId` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemType` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart_items` DROP FOREIGN KEY `cart_items_productId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_createdBy_fkey`;

-- AlterTable
ALTER TABLE `cart_items` DROP COLUMN `productId`,
    ADD COLUMN `cartId` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `itemId` VARCHAR(191) NOT NULL,
    ADD COLUMN `itemType` VARCHAR(191) NOT NULL,
    ADD COLUMN `metadata` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `donation_categories` ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `donations` ADD COLUMN `campaignId` VARCHAR(191) NULL,
    ADD COLUMN `isAnonymous` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `halaqah` ADD COLUMN `room` VARCHAR(191) NULL,
    ADD COLUMN `schedule` VARCHAR(191) NULL,
    MODIFY `level` VARCHAR(191) NOT NULL DEFAULT 'BEGINNER';

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `content`,
    ADD COLUMN `message` TEXT NOT NULL,
    ADD COLUMN `metadata` TEXT NULL,
    ADD COLUMN `relatedId` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL,
    MODIFY `createdBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `bankAccountId` VARCHAR(191) NULL,
    ADD COLUMN `paymentGatewayId` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `halaqahId` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE `musyrif_attendance` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `checkInTime` DATETIME(3) NULL,
    `checkOutTime` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `sessionType` VARCHAR(191) NOT NULL DEFAULT 'REGULAR',
    `qrCodeUsed` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `musyrifId` VARCHAR(191) NOT NULL,
    `halaqahId` VARCHAR(191) NOT NULL,

    INDEX `musyrif_attendance_halaqahId_idx`(`halaqahId`),
    INDEX `musyrif_attendance_musyrifId_idx`(`musyrifId`),
    UNIQUE INDEX `musyrif_attendance_musyrifId_halaqahId_date_key`(`musyrifId`, `halaqahId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_code_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `halaqahId` VARCHAR(191) NOT NULL,
    `sessionDate` DATETIME(3) NOT NULL,
    `sessionType` VARCHAR(191) NOT NULL DEFAULT 'REGULAR',
    `qrCode` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `maxUsage` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qr_code_sessions_qrCode_key`(`qrCode`),
    INDEX `qr_code_sessions_halaqahId_idx`(`halaqahId`),
    INDEX `qr_code_sessions_qrCode_idx`(`qrCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_reports` (
    `id` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,
    `reportName` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `scheduleTime` VARCHAR(191) NOT NULL,
    `recipients` VARCHAR(191) NOT NULL,
    `filters` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastRunDate` DATETIME(3) NULL,
    `nextRunDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,

    INDEX `scheduled_reports_createdBy_fkey`(`createdBy`),
    INDEX `scheduled_reports_nextRunDate_idx`(`nextRunDate`),
    INDEX `scheduled_reports_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_cart_items` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `product_cart_items_productId_fkey`(`productId`),
    INDEX `product_cart_items_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation_campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `shortDesc` VARCHAR(191) NULL,
    `content` TEXT NULL,
    `target` DOUBLE NOT NULL DEFAULT 0,
    `collected` DOUBLE NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `priority` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `urgent` BOOLEAN NOT NULL DEFAULT false,
    `image` VARCHAR(191) NULL,
    `gallery` JSON NULL,
    `videoUrl` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `beneficiaries` INTEGER NULL,
    `tags` JSON NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDesc` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `donation_campaigns_slug_key`(`slug`),
    INDEX `donation_campaigns_categoryId_fkey`(`categoryId`),
    INDEX `donation_campaigns_createdById_fkey`(`createdById`),
    INDEX `donation_campaigns_status_idx`(`status`),
    INDEX `donation_campaigns_featured_idx`(`featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_updates` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    INDEX `campaign_updates_campaignId_fkey`(`campaignId`),
    INDEX `campaign_updates_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_setting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'STRING',
    `category` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `label` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `site_setting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `behavior` (
    `id` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,
    `halaqahId` VARCHAR(191) NULL,
    `criteriaId` VARCHAR(191) NOT NULL,
    `criteriaName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'LOW',
    `points` INTEGER NOT NULL DEFAULT 0,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `time` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `context` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `recordedBy` VARCHAR(191) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `followUpRequired` BOOLEAN NOT NULL DEFAULT false,
    `parentNotified` BOOLEAN NOT NULL DEFAULT false,
    `parentNotifiedAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `behavior_santriId_fkey`(`santriId`),
    INDEX `behavior_halaqahId_fkey`(`halaqahId`),
    INDEX `behavior_recordedBy_fkey`(`recordedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_gateways` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NOT NULL,
    `fees` JSON NOT NULL,
    `description` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_gateways_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `branch` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `musyrif_salary_rates` (
    `id` VARCHAR(191) NOT NULL,
    `musyrifId` VARCHAR(191) NOT NULL,
    `ratePerSession` DECIMAL(10, 2) NOT NULL,
    `ratePerHour` DECIMAL(10, 2) NOT NULL,
    `effectiveDate` DATE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `musyrif_wallets` (
    `id` VARCHAR(191) NOT NULL,
    `musyrifId` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `totalEarned` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `totalWithdrawn` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `musyrif_wallets_musyrifId_key`(`musyrifId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `musyrif_earnings` (
    `id` VARCHAR(191) NOT NULL,
    `musyrifId` VARCHAR(191) NOT NULL,
    `attendanceId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `calculationType` ENUM('PER_SESSION', 'PER_HOUR') NOT NULL,
    `sessionDuration` INTEGER NULL,
    `rate` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `musyrif_withdrawals` (
    `id` VARCHAR(191) NOT NULL,
    `musyrifId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `bankAccount` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `accountHolder` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cart_items_cartId_idx` ON `cart_items`(`cartId`);

-- CreateIndex
CREATE INDEX `cart_items_itemType_itemId_idx` ON `cart_items`(`itemType`, `itemId`);

-- CreateIndex
CREATE UNIQUE INDEX `donation_categories_slug_key` ON `donation_categories`(`slug`);

-- CreateIndex
CREATE INDEX `donations_campaignId_fkey` ON `donations`(`campaignId`);

-- CreateIndex
CREATE INDEX `donations_status_idx` ON `donations`(`status`);

-- CreateIndex
CREATE INDEX `notifications_userId_isRead_idx` ON `notifications`(`userId`, `isRead`);

-- CreateIndex
CREATE INDEX `transactions_paymentGatewayId_fkey` ON `transactions`(`paymentGatewayId`);

-- CreateIndex
CREATE INDEX `transactions_bankAccountId_fkey` ON `transactions`(`bankAccountId`);

-- AddForeignKey
ALTER TABLE `musyrif_attendance` ADD CONSTRAINT `musyrif_attendance_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_attendance` ADD CONSTRAINT `musyrif_attendance_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code_sessions` ADD CONSTRAINT `qr_code_sessions_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_paymentGatewayId_fkey` FOREIGN KEY (`paymentGatewayId`) REFERENCES `payment_gateways`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_reports` ADD CONSTRAINT `scheduled_reports_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_cart_items` ADD CONSTRAINT `product_cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_cart_items` ADD CONSTRAINT `product_cart_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_campaigns` ADD CONSTRAINT `donation_campaigns_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `donation_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation_campaigns` ADD CONSTRAINT `donation_campaigns_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_updates` ADD CONSTRAINT `campaign_updates_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `donation_campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_updates` ADD CONSTRAINT `campaign_updates_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donations` ADD CONSTRAINT `donations_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `donation_campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `behavior` ADD CONSTRAINT `behavior_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `behavior` ADD CONSTRAINT `behavior_halaqahId_fkey` FOREIGN KEY (`halaqahId`) REFERENCES `halaqah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `behavior` ADD CONSTRAINT `behavior_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_salary_rates` ADD CONSTRAINT `musyrif_salary_rates_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_wallets` ADD CONSTRAINT `musyrif_wallets_musyrifId_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_earnings` ADD CONSTRAINT `earnings_musyrif_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_earnings` ADD CONSTRAINT `earnings_attendance_fkey` FOREIGN KEY (`attendanceId`) REFERENCES `musyrif_attendance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_earnings` ADD CONSTRAINT `earnings_approver_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_earnings` ADD CONSTRAINT `earnings_wallet_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif_wallets`(`musyrifId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_withdrawals` ADD CONSTRAINT `withdrawals_musyrif_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_withdrawals` ADD CONSTRAINT `withdrawals_approver_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musyrif_withdrawals` ADD CONSTRAINT `withdrawals_wallet_fkey` FOREIGN KEY (`musyrifId`) REFERENCES `musyrif_wallets`(`musyrifId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `cart_items_userId_idx` ON `cart_items`(`userId`);
DROP INDEX `cart_items_userId_fkey` ON `cart_items`;
