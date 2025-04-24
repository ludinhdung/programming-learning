import { Request, Response, NextFunction } from "express";
import { InstructorService } from "./../services/instructor.service";
import { LessonType } from "@prisma/client";
import { CourseCreateDTO } from "../dto/CourseCreateDTO";
import {
  r2StorageService,
  UploadedFile,
} from "../../../shared/services/r2-storage.service";
import { PrismaClient } from "@prisma/client";

export class InstructorController {
  private instructorService: InstructorService;

  constructor() {
    this.instructorService = new InstructorService();
  }

  /**
   *    Helper method to handle errors
   */
  private handleError(res: Response, error: any): void {
    console.error("Error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ message });
  }

  /**
   * Create a new instructor
   */
  public createInstructor = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userData, instructorData } = req.body;
      // Validate required fields
      if (
        !userData?.email ||
        !userData?.password ||
        !userData?.firstName ||
        !userData?.lastName
      ) {
        res.status(400).json({ message: "Missing required user fields" });
        return;
      }
      const instructor = await this.instructorService.createInstructor(
        userData,
        instructorData
      );
      res.status(201).json(instructor);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get instructor by ID
   */
  public getInstructor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const instructor = await this.instructorService.findByUserId(id);
      res.status(200).json(instructor);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update instructor profile
   */
  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const instructor = await this.instructorService.updateProfile(id, data);
      res.status(200).json(instructor);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update instructor avatar
   */
  public updateAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        res.status(400).json({ message: "Avatar URL is required" });
        return;
      }

      const instructor = await this.instructorService.updateAvatar(
        id,
        avatarUrl
      );
      res.status(200).json(instructor);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Create a new course
   */
  public createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // Instructor ID
      const courseData: CourseCreateDTO = req.body;

      // Validate required fields
      if (!courseData?.title || !courseData?.description) {
        res.status(400).json({ message: "Missing required course fields" });
        return;
      }

      // Validate modules if provided
      if (courseData.modules && courseData.modules.length > 0) {
        for (const module of courseData.modules) {
          if (!module.title || !module.description) {
            res.status(400).json({ message: "Missing required module fields" });
            return;
          }

          // Validate lessons if provided
          if (module.lessons && module.lessons.length > 0) {
            for (const lesson of module.lessons) {
              if (!lesson.title || !lesson.description || !lesson.lessonType) {
                res
                  .status(400)
                  .json({ message: "Missing required lesson fields" });
                return;
              }

              // Validate specific lesson types
              switch (lesson.lessonType) {
                case LessonType.VIDEO:
                  if (!lesson.videoData?.url && !lesson.videoData?.videoUrl) {
                    res
                      .status(400)
                      .json({
                        message: "Missing required video lesson fields",
                      });
                    return;
                  }
                  break;
                case LessonType.CODING:
                  if (
                    !lesson.codingData?.language ||
                    !lesson.codingData?.problem ||
                    !lesson.codingData?.solution
                  ) {
                    res
                      .status(400)
                      .json({
                        message: "Missing required coding exercise fields",
                      });
                    return;
                  }
                  break;
                case LessonType.FINAL_TEST:
                  if (
                    !lesson.finalTestData?.questions ||
                    lesson.finalTestData.questions.length === 0
                  ) {
                    res
                      .status(400)
                      .json({
                        message: "Final test must have at least one question",
                      });
                    return;
                  }

                  // Validate questions and answers
                  for (const question of lesson.finalTestData.questions) {
                    if (!question.content) {
                      res
                        .status(400)
                        .json({ message: "Missing question content" });
                      return;
                    }

                    if (!question.answers || question.answers.length === 0) {
                      res
                        .status(400)
                        .json({
                          message:
                            "Each question must have at least one answer",
                        });
                      return;
                    }

                    // Check if at least one answer is correct
                    const hasCorrectAnswer = question.answers.some(
                      (answer) => answer.isCorrect
                    );
                    if (!hasCorrectAnswer) {
                      res
                        .status(400)
                        .json({
                          message:
                            "Each question must have at least one correct answer",
                        });
                      return;
                    }
                  }
                  break;
              }
            }
          }
        }
      }

      const course = await this.instructorService.createCourse(id, courseData);
      res.status(201).json(course);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Create a new workshop
   */
  public createWorkshop = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const workshopData = req.body;

      // Validate required fields
      if (
        !workshopData?.title ||
        !workshopData?.description ||
        !workshopData?.scheduledAt ||
        !workshopData?.duration
      ) {
        res.status(400).json({ message: "Missing required workshop fields" });
        return;
      }

      const workshop = await this.instructorService.createWorkshop(
        id,
        workshopData
      );
      res.status(201).json(workshop);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // /**
  //  * Get all instructors (with optional filtering)
  //  */
  public getAllInstructors = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      // Calculate skip based on page and limit
      const skip = (page - 1) * limit;

      // Extract filters from query params (excluding page and limit)
      const { page: _, limit: __, ...filters } = req.query;

      const instructors = await this.instructorService.findAll({
        skip,
        take: limit,
        where: filters,
      });

      res.status(200).json(instructors);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   *  Get all all topic by instructor ID
   */
  public createTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const topicData = req.body;
      // Validate required fields
      if (
        !topicData?.name ||
        !topicData?.thumbnail ||
        !topicData?.description
      ) {
        res.status(400).json({
          message: "Missing required topic fields",
        });
        return;
      }

      const topic = await this.instructorService.createTopic(id, topicData);
      res.status(201).json(topic);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Upload a video file to Cloudflare R2
   */
  public uploadVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if file exists in the request
      if (!req.file) {
        res.status(400).json({ message: "No video file uploaded" });
        return;
      }

      const file = req.file as unknown as UploadedFile;

      // Upload the video to Cloudflare R2
      const uploadResult = await r2StorageService.uploadVideo(
        file,
        "course-videos"
      );

      // Return only the video URL
      res.status(200).json({
        videoUrl: uploadResult.videoUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        duration: Math.round(uploadResult.duration),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all courses for an instructor
   */
  public getCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // Instructor ID
      const courses = await this.instructorService.getCoursesByInstructor(id);
      res.status(200).json(courses);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get a single course by ID with all its modules and lessons
   */
  public getCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      const course = await this.instructorService.getCourseById(courseId, id);
      res.status(200).json(course);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update a course
   */
  public updateCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      const courseData = req.body;

      // Validate required fields
      if (!courseData?.title || !courseData?.description) {
        res.status(400).json({ message: "Missing required course fields" });
        return;
      }

      const course = await this.instructorService.updateCourse(
        id,
        courseId,
        courseData
      );
      res.status(200).json(course);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Delete a course
   */
  public deleteCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      await this.instructorService.deleteCourse(id, courseId);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all modules for a course
   */
  public getModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;
      const modules = await this.instructorService.getModulesByCourse(courseId);
      res.status(200).json(modules);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get a single module by ID with all its lessons
   */
  public getModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const module = await this.instructorService.getModuleById(moduleId);
      res.status(200).json(module);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Create a new module for a course
   */
  public createModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;
      const moduleData = req.body;

      // Validate required fields
      if (!moduleData?.title || !moduleData?.description) {
        res.status(400).json({ message: "Missing required module fields" });
        return;
      }

      const module = await this.instructorService.createModule(
        courseId,
        moduleData
      );
      res.status(201).json(module);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update a module
   */
  public updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const moduleData = req.body;

      // Validate required fields
      if (!moduleData?.title || !moduleData?.description) {
        res.status(400).json({ message: "Missing required module fields" });
        return;
      }

      const module = await this.instructorService.updateModule(
        moduleId,
        moduleData
      );
      res.status(200).json(module);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Delete a module
   */
  public deleteModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params;
      await this.instructorService.deleteModule(moduleId);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all lessons for a module
   */
  public getLessons = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const lessons = await this.instructorService.getLessonsByModule(moduleId);
      res.status(200).json(lessons);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get a single lesson by ID with its content
   */
  public getLesson = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const lesson = await this.instructorService.getLessonById(lessonId);
      res.status(200).json(lesson);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update a lesson
   */
  public updateLesson = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const lessonData = req.body;

      // Validate required fields
      if (!lessonData?.title || !lessonData?.description) {
        res.status(400).json({ message: "Missing required lesson fields" });
        return;
      }

      const lesson = await this.instructorService.updateLesson(
        lessonId,
        lessonData
      );
      res.status(200).json(lesson);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Delete a lesson
   */
  public deleteLesson = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      await this.instructorService.deleteLesson(lessonId);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getCoursesFullrelation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params; // Instructor ID
      console.log(id);
      const courses = await this.instructorService.getFullRelationCourses(id);
      res.status(200).json(courses);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update a video lesson
   */
  public updateVideoLesson = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const videoData = req.body;

      // Validate required fields
      if (!videoData?.url && !videoData?.videoUrl) {
        res.status(400).json({ message: "Missing required video URL" });
        return;
      }

      const videoLesson = await this.instructorService.updateVideoLesson(
        lessonId,
        videoData
      );
      res.status(200).json(videoLesson);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all topics
   */
  public getAllTopics = async (req: Request, res: Response): Promise<void> => {
    try {
      const topics = await this.instructorService.getAllTopics();
      res.status(200).json(topics);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get topic by ID
   */
  public getTopicById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId } = req.params;
      const topic = await this.instructorService.getTopicById(topicId);
      res.status(200).json(topic);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get topics by instructor ID
   */
  public getTopicsByInstructor = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const topics = await this.instructorService.getTopicsByInstructor(id);
      res.status(200).json(topics);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get topics with courses
   */
  public getTopicsWithCourses = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const topics = await this.instructorService.getTopicsWithCourses();
      res.status(200).json(topics);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update a topic
   */
  public updateTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId } = req.params;
      const topicData = req.body;

      // Validate required fields
      if (!topicData?.name) {
        res.status(400).json({ message: "Topic name is required" });
        return;
      }

      const topic = await this.instructorService.updateTopic(
        topicId,
        topicData
      );
      res.status(200).json(topic);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get instructor wallet
   */
  public getInstructorWallet = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const wallet = await this.instructorService.getInstructorWallet(id);
      res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.params.instructorId;
      const transactions =
        await this.instructorService.getTransactionsByInstructorId(
          instructorId
        );
      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request withdrawal from instructor wallet
   */
  public requestWithdrawal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { amount, accountNumber, accountHolder, bank } = req.body;

      // Validate required fields
      if (!amount || typeof amount !== "number") {
        res
          .status(400)
          .json({ message: "Valid withdrawal amount is required" });
        return;
      }

      const transaction = await this.instructorService.requestWithdrawal(
        id,
        amount,
        accountNumber,
        accountHolder,
        bank
      );
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  createBankInfoByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { bankName, accountNumber, accountName } = req.body;

      if (!bankName || !accountNumber || !accountName) {
        res
          .status(400)
          .json({ message: "Missing required bank information fields" });
        return;
      }

      const bankInfo = await this.instructorService.createBankInfo(
        id,
        bankName,
        accountNumber,
        accountName
      );
      res.status(201).json({
        success: true,
        data: bankInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  getBankInfoByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const bankInfo = await this.instructorService.getBankInfoByInstructor(id);
      res.status(200).json({
        success: true,
        data: bankInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBankInfoByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { bankName, accountNumber, accountName } = req.body;

      // Validate required fields
      if (!bankName || !accountNumber || !accountName) {
        res
          .status(400)
          .json({ message: "Missing required bank information fields" });
        return;
      }

      const bankInfo = await this.instructorService.updateBankInfo(
        id,
        bankName,
        accountNumber,
        accountName
      );
      res.status(200).json({
        success: true,
        data: bankInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBankInfoByInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const bankInfo = await this.instructorService.deleteBankInfo(id);
      res.status(200).json({
        success: true,
        data: bankInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  handleVietQRHook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { data } = req.body;
      console.log("VietQR Hook Data:", data);

      const rawTransactionId = data[0].description;

      const convertToUUID = (hexString: string): string => {
        const cleanHex = hexString.replace(/[^a-fA-F0-9]/g, "").slice(0, 32);
        const padded = cleanHex.padEnd(32, "0");
        return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(
          12,
          16
        )}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
      };

      const transactionId = convertToUUID(rawTransactionId);

      const transaction = await this.instructorService.updateTransactionStatus(
        transactionId
      );

      res.status(200).json({
        success: true,
        data: {
          transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get instructor statistics
   */
  public getInstructorStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id: instructorId } = req.params;
      const { courseId, dateRange } = req.query;

      const statistics = await this.instructorService.getInstructorStatistics(
        instructorId,
        courseId as string,
        (dateRange as '7d' | '30d' | 'all') || 'all'
      );

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };
}
