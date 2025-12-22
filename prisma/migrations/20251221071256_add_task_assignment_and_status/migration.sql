-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "assignedUserId" TEXT,
ADD COLUMN     "status" TEXT;

-- CreateIndex
CREATE INDEX "Activity_tenantId_type_idx" ON "Activity"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Activity_tenantId_assignedUserId_idx" ON "Activity"("tenantId", "assignedUserId");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
