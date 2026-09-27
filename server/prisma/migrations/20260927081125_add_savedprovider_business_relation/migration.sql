-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    CONSTRAINT "SavedProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedProvider_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SavedProvider" ("businessId", "id", "userId") SELECT "businessId", "id", "userId" FROM "SavedProvider";
DROP TABLE "SavedProvider";
ALTER TABLE "new_SavedProvider" RENAME TO "SavedProvider";
CREATE INDEX "SavedProvider_userId_idx" ON "SavedProvider"("userId");
CREATE INDEX "SavedProvider_businessId_idx" ON "SavedProvider"("businessId");
CREATE UNIQUE INDEX "SavedProvider_userId_businessId_key" ON "SavedProvider"("userId", "businessId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
