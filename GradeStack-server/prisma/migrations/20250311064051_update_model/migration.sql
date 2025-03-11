/*
  Warnings:

  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BookMark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseCertificate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstructorNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningPath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningPathCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Output` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workshop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CourseToTopic` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `instructorId` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organization` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Made the column `bio` on table `Instructor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thumbnail` on table `Instructor` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `Role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BookMark" DROP CONSTRAINT "BookMark_contentId_fkey";

-- DropForeignKey
ALTER TABLE "BookMark" DROP CONSTRAINT "BookMark_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_learnerId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_codeId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "CourseCertificate" DROP CONSTRAINT "CourseCertificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourseRating" DROP CONSTRAINT "CourseRating_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseRating" DROP CONSTRAINT "CourseRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Instructor" DROP CONSTRAINT "Instructor_userId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorAnswer" DROP CONSTRAINT "InstructorAnswer_commentId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorAnswer" DROP CONSTRAINT "InstructorAnswer_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorNote" DROP CONSTRAINT "InstructorNote_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "InstructorNote" DROP CONSTRAINT "InstructorNote_videoId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPath" DROP CONSTRAINT "LearningPath_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPathCourse" DROP CONSTRAINT "LearningPathCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPathCourse" DROP CONSTRAINT "LearningPathCourse_learningPathId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Output" DROP CONSTRAINT "Output_codeId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentHistory" DROP CONSTRAINT "PaymentHistory_courseId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentHistory" DROP CONSTRAINT "PaymentHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_codeId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_workshopId_fkey";

-- DropForeignKey
ALTER TABLE "UserNote" DROP CONSTRAINT "UserNote_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserNote" DROP CONSTRAINT "UserNote_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Workshop" DROP CONSTRAINT "Workshop_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToTopic" DROP CONSTRAINT "_CourseToTopic_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToTopic" DROP CONSTRAINT "_CourseToTopic_B_fkey";

-- DropIndex
DROP INDEX "Instructor_userId_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "duration",
ADD COLUMN     "resources" TEXT[],
ALTER COLUMN "isPublished" DROP DEFAULT,
ALTER COLUMN "instructorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Instructor" DROP COLUMN "certifications",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "organization" TEXT NOT NULL,
ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "thumbnail" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "Role" "Role" NOT NULL,
ADD COLUMN     "instructorId" TEXT,
ALTER COLUMN "isBlocked" DROP DEFAULT,
ALTER COLUMN "isVerified" DROP DEFAULT;

-- DropTable
DROP TABLE "BookMark";

-- DropTable
DROP TABLE "Code";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Content";

-- DropTable
DROP TABLE "CourseCertificate";

-- DropTable
DROP TABLE "CourseProgress";

-- DropTable
DROP TABLE "CourseRating";

-- DropTable
DROP TABLE "Enrollment";

-- DropTable
DROP TABLE "InstructorAnswer";

-- DropTable
DROP TABLE "InstructorNote";

-- DropTable
DROP TABLE "LearningPath";

-- DropTable
DROP TABLE "LearningPathCourse";

-- DropTable
DROP TABLE "Module";

-- DropTable
DROP TABLE "Output";

-- DropTable
DROP TABLE "PaymentHistory";

-- DropTable
DROP TABLE "Resource";

-- DropTable
DROP TABLE "Submission";

-- DropTable
DROP TABLE "Topic";

-- DropTable
DROP TABLE "UserNote";

-- DropTable
DROP TABLE "Video";

-- DropTable
DROP TABLE "Workshop";

-- DropTable
DROP TABLE "_CourseToTopic";

-- DropEnum
DROP TYPE "ContentType";

-- DropEnum
DROP TYPE "Language";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "Rating";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
