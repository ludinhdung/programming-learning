import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create multer instance with configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!') as any, false);
    }
  },
});

// Export middleware for different upload scenarios
export const uploadVideo = upload.single('video');
export const uploadVideos = upload.array('videos', 10); // Allow up to 10 videos
