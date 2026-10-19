-- AlterTable
ALTER TABLE "Business" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "coverUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "coverPosition" INTEGER NOT NULL DEFAULT 50;
