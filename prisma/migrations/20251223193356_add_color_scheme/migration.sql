-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "colorScheme" TEXT NOT NULL DEFAULT 'professional-blue',
ADD COLUMN     "customColors" JSONB;
