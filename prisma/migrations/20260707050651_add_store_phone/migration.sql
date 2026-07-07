-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL DEFAULT '02-0000-0000',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "latitude" REAL NOT NULL DEFAULT 37.5665,
    "longitude" REAL NOT NULL DEFAULT 126.9780,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("createdAt", "description", "id", "latitude", "longitude", "name", "ownerId", "status") SELECT "createdAt", "description", "id", "latitude", "longitude", "name", "ownerId", "status" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE INDEX "Store_ownerId_idx" ON "Store"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
