/*
  Warnings:

  - Added the required column `host` to the `RevocationList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RevocationList" ADD COLUMN     "host" TEXT NOT NULL;
