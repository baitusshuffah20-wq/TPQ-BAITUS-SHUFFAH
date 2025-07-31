-- AlterTable
ALTER TABLE `notification_templates` ADD COLUMN `channels` VARCHAR(191) NULL,
    ADD COLUMN `message` TEXT NULL,
    ADD COLUMN `type` VARCHAR(191) NULL,
    ADD COLUMN `variables` TEXT NULL;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `channels` VARCHAR(191) NULL,
    ADD COLUMN `priority` VARCHAR(191) NULL DEFAULT 'NORMAL',
    ADD COLUMN `recipientId` VARCHAR(191) NULL,
    ADD COLUMN `recipientType` VARCHAR(191) NULL,
    ADD COLUMN `scheduledAt` DATETIME(3) NULL,
    ADD COLUMN `sentAt` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `error_logs` (
    `id` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `stack` TEXT NULL,
    `level` VARCHAR(191) NOT NULL DEFAULT 'ERROR',
    `source` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `notifications_status_idx` ON `notifications`(`status`);

-- CreateIndex
CREATE INDEX `notifications_scheduledAt_idx` ON `notifications`(`scheduledAt`);

-- AddForeignKey
ALTER TABLE `error_logs` ADD CONSTRAINT `error_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
