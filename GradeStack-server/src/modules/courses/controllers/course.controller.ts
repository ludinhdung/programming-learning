import { Request, Response, NextFunction } from "express";
import { CourseService } from "../services/course.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  async getCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        topicId,
        instructorId,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
        select,
      } = req.query;

      const courses = await this.courseService.findCourses({
        topicId: topicId as string,
        instructorId: instructorId as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        order: order as "asc" | "desc",
        select: select as string,
      });

      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  }

  getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.getCourseById(courseId);
      res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  };
  getCoursebyCourseId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.getCoursebyCourseId(courseId);
      res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  };
  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await this.courseService.getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  };

  getUnpublishedCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const courses = await this.courseService.getUnpublishedCourses();
      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  };

  toggleCoursePublishStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.params;
      const updatedCourse = await this.courseService.toggleCoursePublishStatus(courseId);
      res.status(200).json(updatedCourse);
    } catch (error) {
      next(error);
    }
  };

  getStudentEnrolledCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
   try {
     const { courseId } = req.params;
     const enrolledStudents = await this.courseService.getStudentEnrolledCourses(courseId);
     res.status(200).json({
       success: true,
       data: enrolledStudents
     })
   } catch (error) {
    next(error)
    }
  };

}
