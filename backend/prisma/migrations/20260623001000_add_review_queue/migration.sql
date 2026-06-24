-- CreateTable
CREATE TABLE "review_queue" (
    "id" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "review_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_queue_status_priority_idx" ON "review_queue"("status", "priority");

-- CreateIndex
CREATE INDEX "review_queue_itemType_status_idx" ON "review_queue"("itemType", "status");

-- CreateIndex
CREATE INDEX "review_queue_userId_idx" ON "review_queue"("userId");

-- AddForeignKey
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
