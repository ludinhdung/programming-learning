/**
 * API cho quản lý chứng chỉ
 * Sử dụng cho INSTRUCTOR_LEAD
 */
import api from './api';

/**
 * Kiểu dữ liệu chứng chỉ
 */
export interface Certificate {
  id: string;
  learnerId: string;
  courseId: string;
  certificateUrl: string;
  issuedAt: string;
  learner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
}

/**
 * Dữ liệu để tạo chứng chỉ mới
 */
export interface CreateCertificateDto {
  learnerId: string;
  courseId: string;
  certificateUrl: string;
}

/**
 * Dữ liệu để cập nhật chứng chỉ
 */
export interface UpdateCertificateDto {
  certificateUrl?: string;
}

/**
 * Lấy tất cả chứng chỉ
 * @returns Danh sách chứng chỉ
 */
export const getAllCertificates = async (): Promise<Certificate[]> => {
  try {
    const response = await api.get('/certificates');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chứng chỉ:', error);
    throw error;
  }
};

/**
 * Lấy chứng chỉ theo ID
 * @param certificateId ID chứng chỉ
 * @returns Thông tin chứng chỉ
 */
export const getCertificateById = async (certificateId: string): Promise<Certificate> => {
  try {
    const response = await api.get(`/certificates/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chứng chỉ ID ${certificateId}:`, error);
    throw error;
  }
};

/**
 * Lấy chứng chỉ theo khóa học
 * @param courseId ID khóa học
 * @returns Danh sách chứng chỉ của khóa học
 */
export const getCertificatesByCourse = async (courseId: string): Promise<Certificate[]> => {
  try {
    const response = await api.get(`/courses/${courseId}/certificates`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chứng chỉ cho khóa học ID ${courseId}:`, error);
    throw error;
  }
};

/**
 * Lấy chứng chỉ theo học viên
 * @param learnerId ID học viên
 * @returns Danh sách chứng chỉ của học viên
 */
export const getCertificatesByLearner = async (learnerId: string): Promise<Certificate[]> => {
  try {
    const response = await api.get(`/learners/${learnerId}/certificates`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chứng chỉ cho học viên ID ${learnerId}:`, error);
    throw error;
  }
};

/**
 * Lấy chứng chỉ theo học viên và khóa học
 * @param learnerId ID học viên
 * @param courseId ID khóa học
 * @returns Thông tin chứng chỉ
 */
export const getCertificateByLearnerAndCourse = async (
  learnerId: string,
  courseId: string
): Promise<Certificate> => {
  try {
    const response = await api.get(`/learners/${learnerId}/courses/${courseId}/certificate`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chứng chỉ cho học viên ID ${learnerId} và khóa học ID ${courseId}:`, error);
    throw error;
  }
};

/**
 * Tạo chứng chỉ mới
 * @param certificateData Dữ liệu chứng chỉ
 * @returns Thông tin chứng chỉ đã tạo
 */
export const createCertificate = async (certificateData: CreateCertificateDto): Promise<Certificate> => {
  try {
    const response = await api.post('/certificates', certificateData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo chứng chỉ:', error);
    throw error;
  }
};

/**
 * Cập nhật chứng chỉ
 * @param certificateId ID chứng chỉ
 * @param certificateData Dữ liệu cập nhật
 * @returns Thông tin chứng chỉ đã cập nhật
 */
export const updateCertificate = async (
  certificateId: string,
  certificateData: UpdateCertificateDto
): Promise<Certificate> => {
  try {
    const response = await api.put(`/certificates/${certificateId}`, certificateData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật chứng chỉ ID ${certificateId}:`, error);
    throw error;
  }
};

/**
 * Xóa chứng chỉ
 * @param certificateId ID chứng chỉ
 */
export const deleteCertificate = async (certificateId: string): Promise<void> => {
  try {
    await api.delete(`/certificates/${certificateId}`);
  } catch (error) {
    console.error(`Lỗi khi xóa chứng chỉ ID ${certificateId}:`, error);
    throw error;
  }
};
