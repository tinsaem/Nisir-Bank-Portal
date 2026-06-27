-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EmailActionType" AS ENUM ('INFO', 'LINK', 'REPLY', 'CREDENTIAL', 'APPROVE', 'ATTACHMENT');

-- CreateEnum
CREATE TYPE "EmailActionStatus" AS ENUM ('NONE', 'REPLIED', 'DONE', 'APPROVED', 'DECLINED', 'DOWNLOADING', 'DOWNLOADED', 'VERIFYING', 'VERIFIED');

-- CreateTable
CREATE TABLE "EmployeeAccount" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL DEFAULT 'EMPLOYEE',
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT true,
    "sessionStartedAt" TIMESTAMP(3),
    "sessionCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrEmployee" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HrEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalEmail" (
    "id" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "actionType" "EmailActionType" NOT NULL DEFAULT 'INFO',
    "actionLabel" TEXT,
    "href" TEXT,
    "approveLabel" TEXT,
    "declineLabel" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" TEXT,
    "replyPrompt" TEXT,
    "isPhishing" BOOLEAN NOT NULL DEFAULT false,
    "phishingLevel" TEXT,
    "phishingNotes" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEmail" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "actionStatus" "EmailActionStatus" NOT NULL DEFAULT 'NONE',
    "actionText" TEXT,
    "actionAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "dv1ClickedAt" TIMESTAMP(3),
    "dv2SubmittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAccount_employeeId_key" ON "EmployeeAccount"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "HrEmployee_employeeId_key" ON "HrEmployee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalEmail_sequenceNumber_key" ON "InternalEmail"("sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeEmail_employeeId_emailId_key" ON "EmployeeEmail"("employeeId", "emailId");

-- AddForeignKey
ALTER TABLE "EmployeeEmail" ADD CONSTRAINT "EmployeeEmail_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeAccount"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEmail" ADD CONSTRAINT "EmployeeEmail_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "InternalEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
