/*
  Warnings:

  - You are about to drop the column `mnemonic` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'testing',
    "fullName" TEXT NOT NULL DEFAULT 'Test User',
    "creditScore" INTEGER NOT NULL DEFAULT 700,
    "address" TEXT NOT NULL DEFAULT '',
    "privateKey" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("address", "creditScore", "email", "id", "password") SELECT "address", coalesce("creditScore", 700) AS "creditScore", "email", "id", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
