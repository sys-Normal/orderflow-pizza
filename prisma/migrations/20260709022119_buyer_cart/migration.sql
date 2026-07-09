-- CreateTable
CREATE TABLE "Cart" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "itemsJson" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
