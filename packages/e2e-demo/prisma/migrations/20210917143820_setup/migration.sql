-- NOTE: Locally we use a SQLite database, but in production we use a PostgreSQL
-- database. Be sure to keep this migration file capable of being run on both
-- PostgreSQL and SQLite.
--
-- For example, Prisma uses the DATETIME type instead of TIMESTAMP when
-- generating migrations for SQLite. However, PostgreSQL does not support
-- DATETIME, so we need to use TIMESTAMP, which is supported by both SQLite and
-- PostgreSQL.

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jwt" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RevocationList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encodedList" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'testing',
    "fullName" TEXT NOT NULL DEFAULT 'Test User',
    "creditScore" INTEGER NOT NULL DEFAULT 700,
    "address" TEXT NOT NULL DEFAULT '',
    "privateKey" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "DemoAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" TEXT
);

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

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
