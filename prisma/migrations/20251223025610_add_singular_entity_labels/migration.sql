-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "companiesSingularLabel" TEXT NOT NULL DEFAULT 'Company',
ADD COLUMN     "contactsSingularLabel" TEXT NOT NULL DEFAULT 'Contact',
ADD COLUMN     "dealsSingularLabel" TEXT NOT NULL DEFAULT 'Deal';
