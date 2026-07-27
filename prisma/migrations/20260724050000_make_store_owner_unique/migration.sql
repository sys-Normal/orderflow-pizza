/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Store_ownerId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Store_ownerId_key" ON "Store"("ownerId");
