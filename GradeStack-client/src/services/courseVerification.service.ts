import axios from 'axios';

const API_URL = 'http://localhost:4000/api/courses';

class CourseVerificationService {
    async getUnpublishedCourses() {
        const response = await axios.get(`${API_URL}/verify/unpublished`);
        return response.data;
    }

    async toggleCoursePublishStatus(courseId: string) {
        const response = await axios.patch(`${API_URL}/verify/${courseId}/publish`);
        return response.data;
    }
}

export default new CourseVerificationService(); 