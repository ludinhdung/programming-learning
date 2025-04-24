import { Request, Response } from 'express';
import { CertificateService } from '../services/certificate.service';
import { createCertificateSchema, updateCertificateSchema } from '../validation/certificate.validation';

export class CertificateController {
    private certificateService: CertificateService;

    constructor() {
        this.certificateService = new CertificateService();
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
     * Create a new certificate
     */
    public createCertificate = async (req: Request, res: Response): Promise<void> => {
        try {
            const certificateData = req.body;

            // Validate using Zod schema
            const validationResult = createCertificateSchema.safeParse(certificateData);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Validation error',
                    errors: validationResult.error.format()
                });
                return;
            }

            const certificate = await this.certificateService.createCertificate(validationResult.data);
            res.status(201).json(certificate);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get all certificates
     */
    public getAllCertificates = async (req: Request, res: Response): Promise<void> => {
        try {
            const certificates = await this.certificateService.getAllCertificates();
            res.status(200).json(certificates);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get certificates by learner ID
     */
    public getCertificatesByLearnerId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { learnerId } = req.params;
            const certificates = await this.certificateService.getCertificatesByLearnerId(learnerId);
            res.status(200).json(certificates);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get certificates by course ID
     */
    public getCertificatesByCourseId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params;
            const certificates = await this.certificateService.getCertificatesByCourseId(courseId);
            res.status(200).json(certificates);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get certificate by ID
     */
    public getCertificateById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { certificateId } = req.params;
            const certificate = await this.certificateService.getCertificateById(certificateId);
            res.status(200).json(certificate);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get certificate by learner ID and course ID
     */
    public getCertificateByLearnerAndCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const { learnerId, courseId } = req.params;
            const certificate = await this.certificateService.getCertificateByLearnerAndCourse(learnerId, courseId);
            res.status(200).json(certificate);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update certificate
     */
    public updateCertificate = async (req: Request, res: Response): Promise<void> => {
        try {
            const { certificateId } = req.params;
            const certificateData = req.body;

            // Validate using Zod schema
            const validationResult = updateCertificateSchema.safeParse(certificateData);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Validation error',
                    errors: validationResult.error.format()
                });
                return;
            }

            const certificate = await this.certificateService.updateCertificate(certificateId, validationResult.data);
            res.status(200).json(certificate);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Delete certificate
     */
    public deleteCertificate = async (req: Request, res: Response): Promise<void> => {
        try {
            const { certificateId } = req.params;
            await this.certificateService.deleteCertificate(certificateId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public handleWebhook = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log(req.body);
            res.status(200).json({ message: "ok" });
        } catch (error) {
            this.handleError(res, error);
        }
    }
}
