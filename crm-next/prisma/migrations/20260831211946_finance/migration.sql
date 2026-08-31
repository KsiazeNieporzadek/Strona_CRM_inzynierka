-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UnassignedTransfer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "transferDate" DATETIME NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Contract" (
    "contractId" TEXT NOT NULL PRIMARY KEY,
    "clientName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "financingAmount" REAL NOT NULL,
    "duration" TEXT NOT NULL,
    "monthlyInstallment" REAL NOT NULL,
    "contractValue" REAL NOT NULL,
    "roi" REAL NOT NULL,
    "remainingAmount" REAL NOT NULL
);
