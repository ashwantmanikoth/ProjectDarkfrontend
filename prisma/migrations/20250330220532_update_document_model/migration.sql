/*
  Warnings:

  - You are about to drop the column `processedAt` on the `Document` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Document_uploadedAt_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "processedAt",
ALTER COLUMN "filePath" DROP NOT NULL,
ALTER COLUMN "pageCount" DROP NOT NULL;
