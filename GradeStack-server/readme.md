# GradeStack API Documentation

This repository contains the backend API for the GradeStack learning platform, a comprehensive online education system for instructors and students.

## Features

- **Course Management**: Create, update, and manage courses with modules and lessons
- **Video Lessons**: Upload and stream video content with automatic duration extraction
- **Cloudflare R2 Integration**: Secure cloud storage for educational content
- **User Authentication**: JWT-based authentication for instructors and students
- **Interactive API Documentation**: Swagger UI for easy API exploration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database
- Cloudflare R2 account (for video storage)
- ffprobe (for video duration extraction)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/gradestack-server.git
   cd gradestack-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/gradestack"
   JWT_SECRET="your-jwt-secret"
   CLOUDFLARE_R2_ENDPOINT="your-cloudflare-r2-endpoint"
   CLOUDFLARE_ACCESS_KEY_ID="your-cloudflare-access-key"
   CLOUDFLARE_SECRET_ACCESS_KEY="your-cloudflare-secret-key"
   CLOUDFLARE_R2_BUCKET="your-cloudflare-bucket-name"
   CLOUDFLARE_R2_PUBLIC_URL="your-cloudflare-public-url"
   ```

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

The API documentation is available through Swagger UI. After starting the server, you can access it at:

```
http://localhost:4000/api-docs
```

This interactive documentation allows you to:
- Explore all available endpoints
- View request/response schemas
- Test API endpoints directly from the browser
- Understand authentication requirements

## Recent Updates

- **Video Storage Optimization**: Videos are now stored directly on the Module model instead of creating separate VideoLesson records
- **Automatic Duration Extraction**: The system now automatically extracts video duration using ffprobe
- **Thumbnail Generation**: Automatic thumbnail generation for uploaded videos

## API Structure

The API is organized around the following main resources:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/instructors` - Instructor and course management

For detailed information on each endpoint, refer to the Swagger documentation.

## For Frontend Developers

When integrating with the GradeStack API:

1. **Authentication**: All protected endpoints require a JWT token in the Authorization header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

2. **Course Creation Flow**:
   - First create the course structure with modules
   - Then upload videos to specific modules using the upload-video endpoint
   - The server will automatically extract video duration and update the module with video information

3. **Error Handling**: All endpoints return standardized error responses with appropriate HTTP status codes and error messages.

## License

[MIT License](LICENSE)