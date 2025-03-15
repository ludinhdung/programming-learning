/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `lectureId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isBookmarked` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `learningPathId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Course` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The primary key for the `Instructor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `isLead` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LearningPath` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisite` on the `LearningPath` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LearningPath` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `Role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `dailySchedule` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the column `endTimestamp` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the column `startTimestamp` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the `Code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lecture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestCase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WithdrawalRequest` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,workshopId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[learnerId,courseId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[instructorId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificateUrl` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learnerId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatar` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Topic` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `instructorId` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Workshop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledAt` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'CODING', 'FINAL_TEST');

-- CreateEnum
CREATE TYPE "SupportedLanguage" AS ENUM ('PYTHON', 'C', 'JAVA');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('REVENUE', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('LEARNER', 'INSTRUCTOR', 'INSTRUCTOR_LEAD', 'ADMIN', 'SUPPORTER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Code" DROP CONSTRAINT "Code_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_learningPathId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_codeId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_codeId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionHistory" DROP CONSTRAINT "TransactionHistory_courseId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionHistory" DROP CONSTRAINT "TransactionHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "WithdrawalRequest" DROP CONSTRAINT "WithdrawalRequest_adminId_fkey";

-- DropForeignKey
ALTER TABLE "WithdrawalRequest" DROP CONSTRAINT "WithdrawalRequest_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "WithdrawalRequest" DROP CONSTRAINT "WithdrawalRequest_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Workshop" DROP CONSTRAINT "Workshop_instructorId_fkey";

-- DropIndex
DROP INDEX "Instructor_userId_key";

-- DropIndex
DROP INDEX "Wallet_userId_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "attendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "createdAt",
DROP COLUMN "thumbnail",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "certificateUrl" TEXT NOT NULL,
ADD COLUMN     "learnerId" TEXT NOT NULL,
ALTER COLUMN "issuedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "lectureId",
DROP COLUMN "parentId",
DROP COLUMN "updatedAt",
ADD COLUMN     "lessonId" TEXT NOT NULL,
ADD COLUMN     "parentCommentId" TEXT;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "isBookmarked",
DROP COLUMN "isCompleted",
DROP COLUMN "learningPathId",
DROP COLUMN "resources",
DROP COLUMN "topicId",
ALTER COLUMN "price" SET DEFAULT 0.00,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "duration" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Instructor" DROP CONSTRAINT "Instructor_pkey",
DROP COLUMN "id",
DROP COLUMN "isLead",
DROP COLUMN "thumbnail",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "socials" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Instructor_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "LearningPath" DROP COLUMN "createdAt",
DROP COLUMN "prerequisite",
DROP COLUMN "updatedAt",
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "thumbnail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "updatedAt",
DROP COLUMN "videoId",
ADD COLUMN     "lessonId" TEXT NOT NULL,
ADD COLUMN     "timestamp" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answer",
DROP COLUMN "options",
DROP COLUMN "quizId",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "testId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "createdAt",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "thumbnail" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "currency",
DROP COLUMN "updatedAt",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'LEARNER';

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "currency",
DROP COLUMN "userId",
ADD COLUMN     "instructorId" TEXT NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "dailySchedule",
DROP COLUMN "endTimestamp",
DROP COLUMN "isPublished",
DROP COLUMN "startTimestamp",
DROP COLUMN "thumbnail",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Code";

-- DropTable
DROP TABLE "Enrollment";

-- DropTable
DROP TABLE "Lecture";

-- DropTable
DROP TABLE "Quiz";

-- DropTable
DROP TABLE "Rating";

-- DropTable
DROP TABLE "Section";

-- DropTable
DROP TABLE "Submission";

-- DropTable
DROP TABLE "TestCase";

-- DropTable
DROP TABLE "TransactionHistory";

-- DropTable
DROP TABLE "Video";

-- DropTable
DROP TABLE "WithdrawalRequest";

-- DropEnum
DROP TYPE "Language";

-- DropEnum
DROP TYPE "LectureType";

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lessonType" "LessonType" NOT NULL,
    "duration" INTEGER,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoLesson" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "VideoLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "language" "SupportedLanguage" NOT NULL,
    "problem" TEXT NOT NULL,
    "hint" TEXT,
    "solution" TEXT NOT NULL,
    "codeSnippet" TEXT,

    CONSTRAINT "CodingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalTestLesson" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "estimatedDuration" INTEGER,

    CONSTRAINT "FinalTestLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseHistory" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFeedback" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrolledCourse" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrolledCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTopic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "CourseTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathCourse" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LearningPathCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedCodingExercise" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "codingExerciseId" TEXT NOT NULL,
    "submittedCode" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmittedCodingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedFinalTest" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "finalTestId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmittedFinalTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoLesson_lessonId_key" ON "VideoLesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "CodingExercise_lessonId_key" ON "CodingExercise"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalTestLesson_lessonId_key" ON "FinalTestLesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeedback_learnerId_courseId_key" ON "CourseFeedback"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_learnerId_courseId_key" ON "Bookmark"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrolledCourse_learnerId_courseId_key" ON "EnrolledCourse"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseTopic_courseId_topicId_key" ON "CourseTopic"("courseId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathCourse_learningPathId_courseId_key" ON "LearningPathCourse"("learningPathId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmittedCodingExercise_learnerId_codingExerciseId_key" ON "SubmittedCodingExercise"("learnerId", "codingExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmittedFinalTest_learnerId_finalTestId_key" ON "SubmittedFinalTest"("learnerId", "finalTestId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_workshopId_key" ON "Attendance"("userId", "workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_learnerId_courseId_key" ON "Certificate"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_instructorId_key" ON "Wallet"("instructorId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLesson" ADD CONSTRAINT "VideoLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingExercise" ADD CONSTRAINT "CodingExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalTestLesson" ADD CONSTRAINT "FinalTestLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "FinalTestLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistory" ADD CONSTRAINT "PurchaseHistory_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistory" ADD CONSTRAINT "PurchaseHistory_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedback" ADD CONSTRAINT "CourseFeedback_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrolledCourse" ADD CONSTRAINT "EnrolledCourse_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrolledCourse" ADD CONSTRAINT "EnrolledCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedCodingExercise" ADD CONSTRAINT "SubmittedCodingExercise_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedCodingExercise" ADD CONSTRAINT "SubmittedCodingExercise_codingExerciseId_fkey" FOREIGN KEY ("codingExerciseId") REFERENCES "CodingExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedFinalTest" ADD CONSTRAINT "SubmittedFinalTest_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedFinalTest" ADD CONSTRAINT "SubmittedFinalTest_finalTestId_fkey" FOREIGN KEY ("finalTestId") REFERENCES "FinalTestLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
