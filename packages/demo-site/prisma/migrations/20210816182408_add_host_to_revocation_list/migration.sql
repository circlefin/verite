/*
  Warnings:

  - Added the required column `host` to the `RevocationList` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
DELETE FROM "RevocationList";
CREATE TABLE "new_RevocationList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jwt" TEXT NOT NULL,
    "host" TEXT NOT NULL
);
DROP TABLE "RevocationList";
ALTER TABLE "new_RevocationList" RENAME TO "RevocationList";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
