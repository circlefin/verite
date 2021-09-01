/*
  Warnings:

  - You are about to drop the `PendingTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PendingTransaction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PendingSend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PendingReceive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL
);
