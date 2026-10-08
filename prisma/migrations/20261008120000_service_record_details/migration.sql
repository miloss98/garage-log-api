-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'GBP', 'CHF', 'RSD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SRType" ADD VALUE 'brakes';
ALTER TYPE "SRType" ADD VALUE 'battery';
ALTER TYPE "SRType" ADD VALUE 'repair';
ALTER TYPE "SRType" ADD VALUE 'inspection';
ALTER TYPE "SRType" ADD VALUE 'insurance';
ALTER TYPE "SRType" ADD VALUE 'other';

-- AlterTable
ALTER TABLE "service_records" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "next_service_mileage" INTEGER,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "workshop" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'EUR';

-- CreateIndex
CREATE INDEX "cars_user_id_idx" ON "cars"("user_id");

-- CreateIndex
CREATE INDEX "service_records_car_id_idx" ON "service_records"("car_id");

