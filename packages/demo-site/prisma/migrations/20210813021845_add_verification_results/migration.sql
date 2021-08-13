-- CreateTable
CREATE TABLE "VerificationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "result" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "subjectAddress" TEXT NOT NULL
);
