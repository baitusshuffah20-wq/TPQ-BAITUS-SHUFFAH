-- Add categoryId column to Donation table
ALTER TABLE `Donation` ADD COLUMN `categoryId` VARCHAR(191) NULL;

-- Create index on categoryId for better performance
CREATE INDEX `Donation_categoryId_idx` ON `Donation`(`categoryId`);

-- Update existing records to set categoryId same as type if needed
UPDATE `Donation` SET `categoryId` = `type` WHERE `categoryId` IS NULL;