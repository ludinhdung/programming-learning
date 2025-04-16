import apiClient from './apiClient';
import authService from './authService';
import courseService from './courseService';
import lessonService from './lessonService';
import mediaService from './mediaService';
import moduleService from './moduleService';
import topicService from './topicService';

export {
  apiClient,
  authService,
  courseService,
  lessonService,
  mediaService,
  moduleService,
  topicService
};

// For backward compatibility
export const instructorService = {
  ...courseService,
  ...moduleService,
  ...lessonService,
  ...mediaService,
  ...topicService,
};

export default apiClient;
