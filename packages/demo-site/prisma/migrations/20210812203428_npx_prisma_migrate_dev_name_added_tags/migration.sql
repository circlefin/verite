-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'testing',
    "role" TEXT NOT NULL DEFAULT 'member',
    "jumioScore" INTEGER,
    "ofacScore" INTEGER,
    "creditScore" INTEGER,
    "mnemonic" TEXT NOT NULL,
    "balance" TEXT NOT NULL DEFAULT '0'
);
INSERT INTO "new_User" ("creditScore", "email", "id", "jumioScore", "mnemonic", "ofacScore", "password", "role") SELECT "creditScore", "email", "id", "jumioScore", "mnemonic", "ofacScore", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
