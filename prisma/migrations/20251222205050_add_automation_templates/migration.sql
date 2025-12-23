-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "automationTemplateId" TEXT;

-- CreateTable
CREATE TABLE "AutomationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "sendTo" TEXT NOT NULL,
    "customEmail" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationTemplate_tenantId_idx" ON "AutomationTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "Activity_automationTemplateId_idx" ON "Activity"("automationTemplateId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_automationTemplateId_fkey" FOREIGN KEY ("automationTemplateId") REFERENCES "AutomationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationTemplate" ADD CONSTRAINT "AutomationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
