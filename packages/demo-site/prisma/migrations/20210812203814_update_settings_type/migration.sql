/*
  Warnings:

  - You are about to alter the column `value` on the `Settings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL
);
INSERT INTO "new_Settings" ("id", "name", "value") SELECT "id", "name", "value" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings.name_unique" ON "Settings"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
