-- Videos now belong to a Clerk user.
-- Existing rows (if any) get an empty owner and are therefore hidden from everyone.
ALTER TABLE "Video" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Video" ALTER COLUMN "userId" DROP DEFAULT;

CREATE INDEX "Video_userId_createdAt_idx" ON "Video"("userId", "createdAt");
