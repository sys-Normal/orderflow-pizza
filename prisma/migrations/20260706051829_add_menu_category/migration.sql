-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'pizza',
    "priceS" INTEGER NOT NULL,
    "priceM" INTEGER NOT NULL,
    "priceL" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MenuItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("description", "id", "isAvailable", "name", "priceL", "priceM", "priceS", "storeId") SELECT "description", "id", "isAvailable", "name", "priceL", "priceM", "priceS", "storeId" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE INDEX "MenuItem_storeId_idx" ON "MenuItem"("storeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
