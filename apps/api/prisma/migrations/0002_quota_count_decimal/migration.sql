-- AlterTable
ALTER TABLE "donations"
  ALTER COLUMN "quota_count" TYPE DECIMAL(10,1)
  USING "quota_count"::DECIMAL(10,1);
