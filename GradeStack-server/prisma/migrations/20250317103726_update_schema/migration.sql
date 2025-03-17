-- AlterTable
ALTER TABLE "LearningPath" ADD COLUMN     "instructorUserId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "instructorUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "Instructor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "Instructor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
