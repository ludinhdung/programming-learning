-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEARNER', 'INSTRUCTOR', 'INSTRUCTOR_LEAD', 'ADMIN', 'SUPPORTER');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'CODING', 'FINAL_TEST');

-- CreateEnum
CREATE TYPE "SupportedLanguage" AS ENUM ('PYTHON', 'C', 'JAVA');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('REVENUE', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'LEARNER',
    "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "warningCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "userId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "socials" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "videoDuration" INTEGER,
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
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentCommentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoLesson" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
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
    "passingScore" INTEGER NOT NULL DEFAULT 70,

    CONSTRAINT "FinalTestLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "qrCodeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instructorUserId" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTopic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "CourseTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "instructorUserId" TEXT,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "meetUrl" TEXT,
    "thumbnail" TEXT,
    "autoGenerateMeet" BOOLEAN NOT NULL DEFAULT true,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "attendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderCode" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderCode")
);

-- CreateTable
CREATE TABLE "CompletedLesson" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankInfo" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VideoLesson_lessonId_key" ON "VideoLesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "CodingExercise_lessonId_key" ON "CodingExercise"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalTestLesson_lessonId_key" ON "FinalTestLesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_instructorId_key" ON "Wallet"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeedback_learnerId_courseId_key" ON "CourseFeedback"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_learnerId_courseId_key" ON "Bookmark"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrolledCourse_learnerId_courseId_key" ON "EnrolledCourse"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseTopic_courseId_topicId_key" ON "CourseTopic"("courseId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathCourse_learningPathId_courseId_key" ON "LearningPathCourse"("learningPathId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_workshopId_key" ON "Attendance"("userId", "workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmittedCodingExercise_learnerId_codingExerciseId_key" ON "SubmittedCodingExercise"("learnerId", "codingExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmittedFinalTest_learnerId_finalTestId_key" ON "SubmittedFinalTest"("learnerId", "finalTestId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_learnerId_courseId_key" ON "Certificate"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

-- CreateIndex
CREATE INDEX "CompletedLesson_courseId_idx" ON "CompletedLesson"("courseId");

-- CreateIndex
CREATE INDEX "CompletedLesson_learnerId_courseId_idx" ON "CompletedLesson"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedLesson_learnerId_lessonId_key" ON "CompletedLesson"("learnerId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "BankInfo_instructorId_key" ON "BankInfo"("instructorId");

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "Instructor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "Instructor"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedLesson" ADD CONSTRAINT "CompletedLesson_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedLesson" ADD CONSTRAINT "CompletedLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedLesson" ADD CONSTRAINT "CompletedLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankInfo" ADD CONSTRAINT "BankInfo_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
