#!/bin/bash

# Add Missing Database Columns
# Run this to add columns that are in the schema but missing from the old migration

set -e

DB_NAME="nisir_bank_portal"

echo "==================================="
echo "Adding Missing Database Columns"
echo "==================================="

echo "Adding missing columns to HrEmployee table..."
sudo -u postgres psql -d $DB_NAME << 'EOF'

-- Add department column to HrEmployee
ALTER TABLE "HrEmployee" ADD COLUMN IF NOT EXISTS "department" TEXT NOT NULL DEFAULT 'Retail Banking';

EOF

echo "Creating missing tables..."
sudo -u postgres psql -d $DB_NAME << 'EOF'

-- Create PolicyQuestion table
CREATE TABLE IF NOT EXISTS "PolicyQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PolicyQuestion_pkey" PRIMARY KEY ("id")
);

-- Create PolicyChoice table
CREATE TABLE IF NOT EXISTS "PolicyChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PolicyChoice_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PolicyChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PolicyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create PolicyAttempt table
CREATE TABLE IF NOT EXISTS "PolicyAttempt" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PolicyAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PolicyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Document table
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Document_storedName_key" UNIQUE ("storedName")
);

-- Create Discussion table
CREATE TABLE IF NOT EXISTS "Discussion" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- Create DiscussionReply table
CREATE TABLE IF NOT EXISTS "DiscussionReply" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create DiscussionReaction table
CREATE TABLE IF NOT EXISTS "DiscussionReaction" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionReaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DiscussionReaction_targetId_employeeId_key" UNIQUE ("targetId", "employeeId")
);

EOF

echo ""
echo "==================================="
echo "Missing Columns & Tables Added!"
echo "==================================="
echo ""
echo "Now verify with:"
echo "  sudo -u postgres psql -d $DB_NAME -c '\\d \"HrEmployee\"'"
echo ""
