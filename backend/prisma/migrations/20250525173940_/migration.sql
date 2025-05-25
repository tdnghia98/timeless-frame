/*
  Warnings:

  - You are about to drop the column `userId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT,
    "date" DATETIME NOT NULL,
    "userEmail" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "qrCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorRefreshToken" TEXT,
    "storageProvider" TEXT,
    CONSTRAINT "Event_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("authorRefreshToken", "createdAt", "date", "description", "folderId", "id", "qrCode", "shareUrl", "storageProvider", "theme", "title", "updatedAt") SELECT "authorRefreshToken", "createdAt", "date", "description", "folderId", "id", "qrCode", "shareUrl", "storageProvider", "theme", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
