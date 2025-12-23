-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "companiesLabel" TEXT NOT NULL DEFAULT 'Companies',
ADD COLUMN     "contactsLabel" TEXT NOT NULL DEFAULT 'Contacts',
ADD COLUMN     "dealsLabel" TEXT NOT NULL DEFAULT 'Deals';
