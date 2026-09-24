-- CreateEnum
CREATE TYPE "TicketImageKind" AS ENUM ('ATTACHED', 'REPAIR');

-- AlterTable
ALTER TABLE "TicketImage" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "kind" "TicketImageKind" NOT NULL DEFAULT 'ATTACHED';

-- CreateIndex
CREATE INDEX "TicketImage_eventId_idx" ON "TicketImage"("eventId");

-- AddForeignKey
ALTER TABLE "TicketImage" ADD CONSTRAINT "TicketImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TicketEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
