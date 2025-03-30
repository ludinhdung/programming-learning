import { Request, Response } from 'express';
import { TopicService } from '../services/topic.service';

export class TopicController {
    private topicService: TopicService;

    constructor() {
        this.topicService = new TopicService();
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

    /**
     * Tạo một chủ đề mới
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
                    message: 'Missing required topic fields' 
                });
                return;
            }
            
            const topic = await this.topicService.createTopic(id, topicData);
            res.status(201).json(topic);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Lấy tất cả các chủ đề
     */
    public getAllTopics = async (req: Request, res: Response): Promise<void> => {
        try {
            const topics = await this.topicService.getAllTopics();
            res.status(200).json(topics);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Lấy chủ đề theo ID
     */
    public getTopicById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { topicId } = req.params;
            const topic = await this.topicService.getTopicById(topicId);
            res.status(200).json(topic);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Lấy các chủ đề của một instructor
     */
    public getTopicsByInstructor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const topics = await this.topicService.getTopicsByInstructor(id);
            res.status(200).json(topics);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Lấy các chủ đề kèm theo các khóa học
     */
    public getTopicsWithCourses = async (req: Request, res: Response): Promise<void> => {
        try {
            const topics = await this.topicService.getTopicsWithCourses();
            res.status(200).json(topics);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Cập nhật một chủ đề
     */
    public updateTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const { topicId } = req.params;
            const topicData = req.body;
            
            // Validate required fields
            if (!topicData?.name) {
                res.status(400).json({ message: 'Topic name is required' });
                return;
            }

            const topic = await this.topicService.updateTopic(topicId, topicData);
            res.status(200).json(topic);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Xóa một chủ đề
     */
    public deleteTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const { topicId } = req.params;
            await this.topicService.deleteTopic(topicId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    }
}
