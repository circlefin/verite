/*
  Warnings:

  - You are about to drop the column `jumioScore` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ofacScore` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'testing',
    "role" TEXT NOT NULL DEFAULT 'member',
    "creditScore" INTEGER
);
INSERT INTO "new_User" ("creditScore", "email", "id", "password", "role") SELECT "creditScore", "email", "id", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
