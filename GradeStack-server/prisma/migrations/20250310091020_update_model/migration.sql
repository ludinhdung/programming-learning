-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPPORTER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
