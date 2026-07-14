-- AlterTable
ALTER TABLE "User" ADD COLUMN "defaultAddressLine" TEXT;
ALTER TABLE "User" ADD COLUMN "defaultAddressName" TEXT;
ALTER TABLE "User" ADD COLUMN "defaultAddressPhone" TEXT;
ALTER TABLE "User" ADD COLUMN "recentAddressLine" TEXT;
ALTER TABLE "User" ADD COLUMN "recentAddressName" TEXT;
ALTER TABLE "User" ADD COLUMN "recentAddressPhone" TEXT;

-- CreateTable
CREATE TABLE "DeliveryPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DeliveryPreset_userId_idx" ON "DeliveryPreset"("userId");
