-- Backfill script to set default labels for all tenants
-- This ensures all tenants have proper labels even if they were created before label columns existed
-- Run this on your production database if you're experiencing issues with missing labels

UPDATE "Tenant"
SET
  "dealsLabel" = COALESCE("dealsLabel", 'Deals'),
  "dealsSingularLabel" = COALESCE("dealsSingularLabel", 'Deal'),
  "contactsLabel" = COALESCE("contactsLabel", 'Contacts'),
  "contactsSingularLabel" = COALESCE("contactsSingularLabel", 'Contact'),
  "companiesLabel" = COALESCE("companiesLabel", 'Companies'),
  "companiesSingularLabel" = COALESCE("companiesSingularLabel", 'Company')
WHERE
  "dealsLabel" IS NULL
  OR "dealsSingularLabel" IS NULL
  OR "contactsLabel" IS NULL
  OR "contactsSingularLabel" IS NULL
  OR "companiesLabel" IS NULL
  OR "companiesSingularLabel" IS NULL;

-- Verify the update
SELECT
  id,
  name,
  "dealsLabel",
  "dealsSingularLabel",
  "contactsLabel",
  "contactsSingularLabel",
  "companiesLabel",
  "companiesSingularLabel"
FROM "Tenant";
