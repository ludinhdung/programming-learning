import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { ModuleService } from '../../module/services/module.service';
import { LessonService } from '../../lesson/services/lesson.service';
import { VideoLessonService } from '../../videoLesson/services/videoLesson.service';
import { r2StorageService, UploadedFile } from '../../../shared/services/r2-storage.service';
import { createCourseSchema, updateCourseSchema } from '../validation/course.validation';
import { CertifierService } from '../../../shared/services/certificate.service';

export class CourseController {
    private courseService: CourseService;
    private moduleService: ModuleService;
    private lessonService: LessonService;
    private videoLessonService: VideoLessonService;
    private certificateService: CertifierService;

    constructor() {
        this.courseService = new CourseService();
        this.moduleService = new ModuleService();
        this.lessonService = new LessonService();
        this.videoLessonService = new VideoLessonService();
        this.certificateService = new CertifierService();
    }

    /**
     * Helper method to handle errors
     */
    private handleError(res: Response, error: any): void {
        console.error('Error:', error);
        const status = error.status || 500;
        const message = error.message || 'Internal server error';
        res.status(status).json({ message });
    }

    async getCoursesPage(req: Request, res: Response): Promise<void> {
        try {
            const {
                topicId,
                instructorId,
                search,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                order = 'desc',
                select
            } = req.query;

            const courses = await this.courseService.findCourses({
                topicId: topicId as string,
                instructorId: instructorId as string,
                search: search as string,
                page: Number(page),
                limit: Number(limit),
                sortBy: sortBy as string,
                order: order as 'asc' | 'desc',
                select: select as string
            });

            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({
                message: 'Failed to retrieve courses',
                error: (error as Error).message
            });
        }
    }
    /**
     * Create a new course
     */
    public createCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // Instructor ID
            const courseData = req.body;

            // Validate using Zod schema
            const validationResult = createCourseSchema.safeParse(courseData);
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            // Passing validated data directly - service will handle the transformation
            const course = await this.courseService.createCourse(id, validationResult.data);
            res.status(201).json(course);
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
                res.status(400).json({ message: 'No video file uploaded' });
                return;
            }

            const file = req.file as unknown as UploadedFile;
            
            // Upload the video to Cloudflare R2
            const uploadResult = await r2StorageService.uploadVideo(file, 'course-videos');
            
            // Return only the video URL
            res.status(200).json({
                videoUrl: uploadResult.videoUrl,
                thumbnailUrl: uploadResult.thumbnailUrl,
                duration: Math.round(uploadResult.duration)
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
            const courses = await this.courseService.getCoursesByInstructor(id);
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
            const course = await this.courseService.getCourseById(courseId, id);
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
            
            // Validate using Zod schema
            const validationResult = updateCourseSchema.safeParse(courseData);
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            const course = await this.courseService.updateCourse(id, courseId, validationResult.data);
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
            await this.courseService.deleteCourse(id, courseId);
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
            const modules = await this.moduleService.getModulesByCourse(courseId);
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
            const module = await this.moduleService.getModuleById(moduleId);
            res.status(200).json(module);
        } catch (error) {
            this.handleError(res, error);
        }
    };
    
    /**
     * Get courses with full relation data
     */
    public getCoursesFullrelation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // Instructor ID
            console.log(id);
            const courses = await this.courseService.getFullRelationCourses(id);
            
            res.status(200).json(courses);
        } catch (error: any) {
            this.handleError(res, error.message);
        }
    };

    /**
     * Get a single course by ID with full relation data
     */
    public getCourseFullRelation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params;
            
            // Use the getFullRelationCourses method but filter for a specific course
            const course = await this.courseService.getCourseWithFullRelations(courseId);
            
            if (!course) {
                res.status(404).json({ message: 'Course not found' });
                return;
            }
            
            res.status(200).json(course);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };
    
    /**
     * Update a video lesson
     */
    public updateVideoLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const videoData = req.body;
            
            // Validate required fields
            if (!videoData?.url && !videoData?.videoUrl) {
                res.status(400).json({ message: 'Missing required video URL' });
                return;
            }

            // Prepare video data for the lesson service
            const lessonData = {};
            const videoLessonData = {
                url: videoData.url || videoData.videoUrl,
                thumbnailUrl: videoData.thumbnailUrl,
                duration: videoData.duration
            };

            const updatedLesson = await this.lessonService.updateVideoLesson(lessonId, lessonData, videoLessonData);
            res.status(200).json(updatedLesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Cập nhật trạng thái xuất bản của khóa học
     */
    public toggleCoursePublishStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, courseId } = req.params;
            const { isPublished } = req.body;
            
            // Validate dữ liệu đầu vào
            if (isPublished === undefined) {
                res.status(400).json({ message: 'Thiếu trường isPublished' });
                return;
            }
            
            // Xử lý cập nhật trạng thái
            let updatedCourse;
            
            if (isPublished) {
                updatedCourse = await this.courseService.publishCourse(courseId);
            } else {
                updatedCourse = await this.courseService.unpublishCourse(courseId);
            }
            
            res.status(200).json({
                message: `Khóa học đã được ${isPublished ? 'xuất bản' : 'hủy xuất bản'} thành công`,
                data: updatedCourse
            });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Lấy thông tin chứng chỉ từ Certifier.io
     */
    public getCertificate = async (req: Request, res: Response): Promise<void> => {
        try {
            const { certificateId } = req.params;
            const certificate = await this.certificateService.getCertificate(certificateId);
            res.status(200).json(certificate);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
    * Tạo chứng chỉ khi học viên hoàn thành khóa học
    */
    public generateCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { learnerId, courseId } = req.params;
      
      // Tạo chứng chỉ với email
      const certificate = await this.certificateService.generateCertificate(
        learnerId,
        courseId
      );
      
      res.status(201).json({
        message: 'Chứng chỉ đã được tạo và gửi đến email của học viên',
        certificate
      });
    } catch (error) {
      this.handleError(res, error);
    }
    };

    /**
     * Lấy danh sách chứng chỉ của học viên
     */
    public getLearnerCertificates = async (req: Request, res: Response): Promise<void> => {
        try {
            const { learnerId } = req.params;
            const certificates = await this.certificateService.getLearnerCertificates(learnerId);
            res.status(200).json(certificates);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Lấy danh sách chứng chỉ của khóa học
     */
    public getCourseCertificates = async (req: Request, res: Response): Promise<void> => {
        try {
            const { publicId } = req.params;
            const certificates = await this.certificateService.getCertificate(publicId);
            res.status(200).json(certificates);
        } catch (error) {
            this.handleError(res, error);
        }
    }
}
