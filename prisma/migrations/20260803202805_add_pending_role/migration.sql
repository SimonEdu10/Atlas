-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "user_roles" ALTER COLUMN "role" SET DEFAULT 'PENDING';
