import { RcFile } from "antd/es/upload";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

export const supporterService = {
  async getSupporterById(supporterId: string) {
    const respone = await api.get(`/supporter/${supporterId}`);
    return respone.data;
  },
  
  async getAllInstructor() {
    const respone = await api.get("/supporter/instructors");
    return respone.data;
  },

  async createInstructor(instructorData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organization: string;
    role: string;
  }) {
    const respone = await api.post(
      "/supporter/create/instructor",
      instructorData
    );
    return respone.data;
  },

  async updateUserStatus(id: string, status: { isBlocked: boolean }) {
    const respone = await api.patch(
      `/supporter/update-status/user/${id}`,
      status
    );
    return respone.data;
  },

  async deleteInstructor(instructorId: string) {
    const respone = await api.delete(
      `/supporter/delete/instructor/${instructorId}`
    );
    return respone.data;
  },

  async getAllLearner() {
    const respone = await api.get("/supporter/learners");
    return respone.data;
  },

  async warningLearner(learnerId: string, warningContent: string) {
    console.log(learnerId);

    const respone = await api.patch(`/supporter/warning/learner/${learnerId}`, {
      warningContent,
    });
    return respone.data;
  },

  async deleteLearner(learnerId: string) {
    const respone = await api.delete(`/supporter/delete/learner/${learnerId}`);
    return respone.data;
  },
};

export const instructorService = {
  async getInstructorById(instructorId: string) {
    const respone = await api.get(`/instructors/${instructorId}`);
    return respone.data;
  },

  async getInstructorProfile(instructorId: string) {
    const respone = await api.get(
      `/instructors/instructor/${instructorId}/profile`
    );
    return respone.data;
  },

  async updateInstructorProfile(
    instructorId: string,
    profileData: {
      bio: string;
      socials: string[];
      firstName?: string;
      lastName?: string;
    }
  ) {
    const response = await api.put(
      `/instructors/instructor/${instructorId}/profile`,
      profileData
    );
    return response.data;
  },

  async changePassword(
    instructorId: string,
    data: { oldPassword: string; newPassword: string }
  ) {
    const response = await api.post(
      `/instructors/instructor/${instructorId}/change-password`,
      data
    );
    return response.data;
  },

  async uploadVideo(file: RcFile) {
    const formData = new FormData();
    formData.append("video", file);
    const response = await api.post(`/instructors/upload-video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async uploadImage(formData: FormData) {
    const response = await api.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async createVideoLesson(
    lessonId: string,
    videoData: {
      url: string;
      thumbnailUrl?: string | null;
      duration?: number | null;
    }
  ) {
    const response = await api.post(`/lessons/${lessonId}/video`, videoData);
    return response.data;
  },

  async getTopics() {
    const response = await api.get(`/topics`);
    return response.data;
  },

  async getTopicsByInstructor(instructorId: string) {
    const response = await api.get(`/instructors/${instructorId}/topics`);
    return response.data;
  },

  async getTopicById(topicId: string) {
    const response = await api.get(`/topics/${topicId}`);
    return response.data;
  },

  async createTopic(
    instructorId: string,
    topicData: {
      name: string;
      description: string;
      thumbnail: string;
    }
  ) {
    const response = await api.post(
      `/instructors/${instructorId}/topics`,
      topicData
    );
    return response.data;
  },

  async updateTopic(
    topicId: string,
    topicData: {
      name?: string;
      description?: string;
      thumbnail?: string;
    }
  ) {
    const response = await api.put(`/topics/${topicId}`, topicData);
    return response.data;
  },

  async deleteTopic(topicId: string) {
    const response = await api.delete(`/topics/${topicId}`);
    return response.data;
  },

  async createCourse(
    instructorId: string,
    courseData: {
      title: string;
      description: string;
      price: number;
      thumbnailUrl: string;
      duration: number;
      isPublished: boolean;
      topicIds: string[];
      modules: {
        title: string;
        description: string;
        order: number;
        videoUrl?: string | null;
        thumbnailUrl?: string | null;
        videoDuration?: number | null;
        lessons: {
          title: string;
          description: string;
          lessonType: "VIDEO" | "CODING" | "FINAL_TEST";
          duration: number;
          isPreview: boolean;
          content: {
            video?: {
              url: string;
              thumbnailUrl: string | null;
              duration: number;
            };
            coding?: {
              language: string;
              problem: string;
              hint?: string;
              solution: string;
              codeSnippet?: string;
            };
            finalTest?: {
              estimatedDuration?: number;
              questions: {
                content: string;
                order: number;
                answers: {
                  content: string;
                  isCorrect: boolean;
                }[];
              }[];
            };
          };
        }[];
      }[];
    }
  ) {
    const response = await api.post(
      `/instructors/${instructorId}/courses`,
      courseData
    );
    return response.data;
  },

  async getCourse(id: string, courseId: string) {
    const response = await api.get(`/instructors/${id}/courses/${courseId}`);
    return response.data;
  },

  async getCourses(id: string) {
    const response = await api.get(`/instructors/${id}/courses`);
    return response.data;
  },

  async getFullCourses(id: string) {
    const response = await api.get(`/instructors/${id}/courses/full`);
    return response.data;
  },

  async deleteCourse(id: string, courseId: string) {
    const response = await api.delete(`/instructors/${id}/courses/${courseId}`);
    return response.data;
  },

  //Module
  async createModule(
    courseId: string,
    moduleData: { title: string; description: string }
  ) {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },
  async updateModule(
    moduleId: string,
    moduleData: {
      title: string;
      description: string;
      videoUrl?: string | null;
      thumbnailUrl?: string | null;
      videoDuration?: number;
    }
  ) {
    const response = await api.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  },

  async deleteModule(moduleId: string) {
    const response = await api.delete(`/modules/${moduleId}`);
    return response.data;
  },

  //Lesson

  async deleteLesson(lessonId: string) {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },

  async createNewVideoLesson(
    moduleId: string,
    lessonData: { title: string; description: string; isPreview: boolean },
    videoData: {
      url: string;
      thumbnailUrl?: string;
      duration: number;
    }
  ) {
    const response = await api.post(`/modules/${moduleId}/video-lessons`, {
      lessonData,
      videoData,
    });
    return response.data;
  },

  async createNewCodingLesson(
    moduleId: string,
    lessonData: { title: string; description: string; isPreview: boolean },
    codingData: {
      language: string;
      problem: string;
      hint: string;
      solution: string;
      codeSnippet: string;
    }
  ) {
    const response = await api.post(`/modules/${moduleId}/coding-exercises`, {
      lessonData,
      codingData,
    });
    return response.data;
  },

  async createNewFinalTestLesson(
    moduleId: string,
    lessonData: { title: string; description: string; isPreview: boolean },
    testData: {
      passingScore?: number;
      estimatedDuration: number;
      questions: Array<{
        content: string;
        order: number;
        answers: Array<{
          content: string;
          isCorrect: boolean;
        }>;
      }>;
    }
  ) {
    const response = await api.post(`/modules/${moduleId}/final-tests`, {
      lessonData,
      testData,
    });
    return response.data;
  },

  async getInstructorWallet(instructorId: string) {
    const response = await api.get(`/instructors/${instructorId}/wallet`);
    return response.data;
  },

  async requestWithdrawal(instructorId: string, amount: number) {
    const response = await api.post(
      `/instructors/${instructorId}/wallet/withdraw`,
      { amount }
    );
    return response.data;
  },

  async getInstructorTransactions(instructorId: string) {
    const response = await api.get(`/instructors/${instructorId}/transactions`);
    return response.data;
  },

  async getStudentEnrolledCourses(courseId: string) {
    const response = await api.get(`/courses/course/${courseId}/students`);
    return response.data;
  },

  async getCertificateByLearnerAndCourse(learnerId: string, courseId: string) {
    const response = await api.get(`/learners/${learnerId}/courses/${courseId}/certificate`);
    return response.data;
  },
};

export const learnerService = {
  async getAllInstructor() {
    const respone = await api.get("/supporter/instructors");
    return respone.data;
  },
  async getCourses() {
    const respone = await api.get("/courses/");
    return respone.data;
  },
  async getCoursebyCourseId(courseId: string) {
    const respone = await api.get(`/courses/course/${courseId}`);
    return respone.data;
  },
  async getAllCourses() {
    const respone = await api.get("/courses/all");
    return respone.data;
  },
  async updateCourseProgress(
    learnerId: string,
    courseId: string,
    progress: number
  ) {
    const response = await api.put(
      `/progress/learner/${learnerId}/courses/${courseId}/progress`,
      {
        progress,
      }
    );
    return response.data;
  },

  async getCourseProgress(learnerId: string, courseId: string) {
    const response = await api.get(
      `/progress/learner/${learnerId}/courses/${courseId}/progress`
    );
    return response.data;
  },

  async getCompletedLessons(learnerId: string, courseId: string) {
    const response = await api.get(
      `/progress/learner/${learnerId}/courses/${courseId}/completed-lessons`
    );
    return response;
  },

  async markLessonAsComplete(
    learnerId: string,
    courseId: string,
    lessonId: string
  ) {
    const response = await api.post(
      `/progress/learner/${learnerId}/courses/${courseId}/lessons/${lessonId}/complete`
    );
    return response;
  },

  async checkFinalTestSubmission(learnerId: string, lessonId: string) {
    const response = await api.get(
      `/final-test/learner/${learnerId}/lesson/${lessonId}/check-submission`
    );
    return response.data;
  },

  async submitFinalTest(learnerId: string, finalTestId: string, score: number) {
    const response = await api.post(
      `/final-test/${finalTestId}/learner/${learnerId}/submit`,
      {
        score,
      }
    );
    return response.data;
  },
};

export const userService = {
  async getMyEnrolledCourses(userId: string) {
    const respone = await api.get(`/users/${userId}/enrollments`);
    return respone.data;
  },
  async forgotPassword(email: string) {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  },
  async verifyResetCode(email: string, code: string) {
    const response = await api.post("/users/verify-reset-code", { email, code });
    return response.data;
  },
  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await api.post("/users/reset-password", { email, code, newPassword });
    return response.data;
  },
  
  
};

export const courseVerificationService = {
  async publishCourse(courseId: string) {
    const response = await api.patch(`/courses/verify/${courseId}/publish`);
    return response.data;
  },
  async getCoursebyCourseId(courseId: string) {
    const respone = await api.get(`/courses/course/${courseId}`);
    return respone.data;
  },
};

export const fetchBankList = async (): Promise<
  { name: string; code: string }[]
> => {
  try {
    const response = await fetch("https://api.vietqr.io/v2/banks");
    const data = await response.json();

    if (data.code === "00") {
      return data.data.map((bank: any) => ({
        name: bank.shortName,
        code: bank.bin,
      }));
    }
    throw new Error("Failed to fetch bank list");
  } catch (error) {
    console.error("Error fetching bank list:", error);
    throw error;
  }
};

export const feedbackService = {
  // Create new feedback
  async createFeedback(
    courseId: string,
    learnerId: string,
    data: { rating: number; comment?: string }
  ) {
    try {
      const response = await api.post(
        `/feedback/course/${courseId}/learner/${learnerId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error creating feedback for course ${courseId}:`, error);
      throw error;
    }
  },

  // Update feedback
  async updateFeedback(
    courseId: string,
    learnerId: string,
    data: { rating: number; comment?: string }
  ) {
    try {
      const response = await api.put(
        `/feedback/course/${courseId}/learner/${learnerId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error updating feedback for course ${courseId}:`, error);
      throw error;
    }
  },

  // Get all feedback for a course
  async getCourseFeedback(courseId: string) {
    try {
      const response = await api.get(`/feedback/course/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error getting feedbacks for course ${courseId}:`, error);
      throw error;
    }
  },

  // Get feedback of a specific learner for a course
  async getLearnerFeedback(courseId: string, learnerId: string) {
    try {
      const response = await api.get(
        `/feedback/course/${courseId}/learner/${learnerId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error(
        `Error getting learner feedback for course ${courseId}:`,
        error
      );
      throw error;
    }
  },

  // Get course rating statistics
  async getCourseRatingStats(courseId: string) {
    try {
      const response = await api.get(`/feedback/course/${courseId}/stats`);
      return response.data;
    } catch (error: unknown) {
      console.error(
        `Error getting rating stats for course ${courseId}:`,
        error
      );
      throw error;
    }
  },

  // Get all feedback
  async getAllFeedback() {
    const response = await api.get("/feedback");
    return response.data;
  },

  // Delete feedback
  async deleteFeedback(courseId: string, learnerId: string) {
    try {
      const response = await api.delete(
        `/feedback/course/${courseId}/learner/${learnerId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error deleting feedback for course ${courseId}:`, error);
      throw error;
    }
  },
};

export const adminService = {
  async getAllSupporters() {
    const response = await api.get("/admin/supporters");
    return response.data;
  },
  async getSupporterById(supporterId: string) {
    const response = await api.get(`/admin/supporters/${supporterId}`);
    return response.data;
  },
  async updateSupporterStatus(supporterId: string, isBlocked: boolean) {
    const response = await api.patch(`/admin/supporters/${supporterId}/status`, { isBlocked });
    return response.data;
  },
  async createSupporter(supporterData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const response = await api.post("/admin/create/supporter", supporterData);
    return response.data;
  },
  async deleteSupporter(supporterId: string) {
    const response = await api.delete(`/admin/supporters/${supporterId}`);
    return response.data;
  },
};

export default api;
