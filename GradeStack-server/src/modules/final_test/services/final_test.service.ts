import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";

const prisma = new PrismaClient();

export class FinalTestService {
  async checkFinalTestSubmission(learnerId: string, lessonId: string) {
    try {
      const finalTest = await prisma.finalTestLesson.findUnique({
        where: { lessonId },
      });

      if (!finalTest) {
        throw new AppError("Final test not found for this lesson", 404);
      }

      const submission = await prisma.submittedFinalTest.findUnique({
        where: {
          learnerId_finalTestId: {
            learnerId,
            finalTestId: finalTest.id,
          },
        },
      });

      return {
        submitted: !!submission,
        score: submission?.score || null,
        submittedAt: submission?.submittedAt || null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Failed to check final test submission: ${error}`,
        500
      );
    }
  }

  async submitFinalTest(learnerId: string, lessonId: string, score: number) {
    try {
      const finalTest = await prisma.finalTestLesson.findUnique({
        where: { lessonId },
      });

      if (!finalTest) {
        throw new AppError("Final test not found for this lesson", 404);
      }
      const existingSubmission = await prisma.submittedFinalTest.findUnique({
        where: {
          learnerId_finalTestId: {
            learnerId,
            finalTestId: finalTest.id,
          },
        },
      });
      if (existingSubmission) {
        throw new AppError("You already submited this finaltest", 400);
      }

      const submission = await prisma.submittedFinalTest.create({
        data: {
          learnerId,
          finalTestId: finalTest.id,
          score,
        },
      });
      return submission;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to submit final test: ${error}`, 500);
    }
  }

  async getFinalTestsByLearnerId(learnerId: string) {
    try {
      const submissions = await prisma.submittedFinalTest.findMany({
        where: {
          learnerId,
        },
        include: {
          finalTest: {
            include: {
              lesson: {
                select: {
                  title: true,
                  module: {
                    select: {
                      title: true,
                      course: {
                        select: {
                          title: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      });

      if (!submissions.length) {
        return [];
      }

      return submissions;
    } catch (error) {
      throw new AppError(`Failed to get final test submissions: ${error}`, 500);
    }
  }
}
