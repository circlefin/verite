-- CreateTable
CREATE TABLE "PendingTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "result" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "subjectAddress" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'testing',
    "role" TEXT NOT NULL DEFAULT 'member',
    "creditScore" INTEGER,
    "mnemonic" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("creditScore", "email", "id", "password", "role") SELECT "creditScore", "email", "id", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

UPDATE User
SET
mnemonic = "doctor card season nasty dose refuse arrest enroll lock rely nerve reject",
address = "0xFAEd4F38A7a2628d65699C71be0650FBff4617e6"
WHERE email = "alice@test.com";

UPDATE User
SET
mnemonic = "feed flame cable lock kind jar diet security auction kitten question stand"
address = "0xF5C117C1cc6Feb7f3930a7Fb882002cd8BDA9Da1"
WHERE email = "bob@test.com";

UPDATE User
SET
mnemonic = "alcohol talk chronic mistake invest tumble horse pattern monster inner ivory awesome"
address = "0xe28E19C9BfB96DE27a2B558e9A67e5dcbd0379B8"
WHERE email = "kim@test.com";

UPDATE User
SET
mnemonic = "chase scrub final fossil onion enter imitate enable amused salad predict trigger"
address = "0x24A60C20553bacBB5cF07303c90F39B3B9d02f1E"
WHERE email = "brice@test.com";

UPDATE User
SET
mnemonic = "hard laptop lucky green conduct maze gravity state welcome stomach camera grunt"
address = "0x073067B050527abA2026C5102c79d5fcc9469f31"
WHERE email = "matt@test.com";

UPDATE User
SET
mnemonic = "milk power apple shallow spatial speak infant bind split spice brief wave"
address = "0xaa83D8d17CEf98A3604F9c176520dA35bA89f0D0"
WHERE email = "alice@test.com";

