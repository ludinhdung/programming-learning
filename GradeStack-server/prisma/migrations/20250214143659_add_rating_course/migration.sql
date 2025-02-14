-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE');

-- CreateTable
CREATE TABLE "CourseRating" (
    "id" TEXT NOT NULL,
    "rating" "Rating" NOT NULL,
    "review" TEXT,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseRating" ADD CONSTRAINT "CourseRating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRating" ADD CONSTRAINT "CourseRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
