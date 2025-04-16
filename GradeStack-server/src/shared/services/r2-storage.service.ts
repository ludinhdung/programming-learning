import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dotenv from "dotenv";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { promisify } from "util";

const execPromise = promisify(exec);

dotenv.config();

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // Duration in seconds
}

export interface ImageUploadResult {
  imageUrl: string;
}

export class R2StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicBaseUrl: string;

  constructor() {
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
      },
    });

    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET || "";
    this.publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";
  }

  /**
   * Extract video duration using ffprobe
   * @param buffer Video buffer
   * @returns Duration in seconds
   */
  private async extractVideoDuration(buffer: Buffer): Promise<number> {
    try {
      // Create a temporary file to analyze with ffprobe
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `temp_video_${Date.now()}.mp4`);

      // Write the buffer to a temporary file
      fs.writeFileSync(tempFilePath, buffer);

      // Sử dụng đường dẫn tuyệt đối của ffprobe
      const ffprobePath = "ffprobe";

      // Use ffprobe to get video duration
      const { stdout } = await execPromise(
        `${ffprobePath} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFilePath}"`
      );

      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);

      // Parse the duration (in seconds)
      const duration = parseFloat(stdout.trim());
      return isNaN(duration) ? 0 : duration;
    } catch (error) {
      console.error("Error extracting video duration:", error);
      return 0; // Return 0 if duration extraction fails
    }
  }

  /**
   * Uploads a video file to Cloudflare R2 storage
   * @param file The video file to upload
   * @param folder Optional folder path within the bucket
   * @returns Object containing URLs for the video and thumbnail, plus duration
   */
  async uploadVideo(
    file: UploadedFile,
    folder: string = "videos"
  ): Promise<VideoUploadResult> {
    try {
      if (!file || !file.buffer) {
        throw new Error("Invalid file provided");
      }

      // Extract video duration
      const duration = await this.extractVideoDuration(file.buffer);

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${timestamp}-${file.originalname.replace(/\s+/g, "-")}`;

      // Path for the video in R2
      const videoKey = `${folder}/${fileName}`;

      // Upload video to R2
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: videoKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // Generate a thumbnail from the video (this would typically be done with a video processing library)
      // For this example, we'll assume we have a thumbnail and upload it
      // In a real implementation, you would extract a frame from the video to use as thumbnail
      const thumbnailKey = `${folder}/thumbnails/${timestamp}-thumbnail.jpg`;

      // For demonstration purposes, we're creating a placeholder for the thumbnail
      // In a real implementation, you would generate a thumbnail from the video
      // and upload the actual thumbnail image
      const placeholderThumbnail = Buffer.from("Placeholder for thumbnail");

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: thumbnailKey,
          Body: placeholderThumbnail,
          ContentType: "image/jpeg",
        })
      );

      // Return the URLs for the video and thumbnail, plus duration
      return {
        videoUrl: `${this.publicBaseUrl}/${videoKey}`,
        thumbnailUrl: `${this.publicBaseUrl}/${thumbnailKey}`,
        duration: duration,
      };
    } catch (error) {
      console.error("Error uploading video to R2:", error);
      throw new Error(`Failed to upload video: ${(error as Error).message}`);
    }
  }

  /**
   * Uploads an image file to Cloudflare R2 storage
   * @param file The image file to upload
   * @param folder Optional folder path within the bucket
   * @returns Object containing the URL for the image
   */
  async uploadImage(file: UploadedFile, folder: string = 'images'): Promise<ImageUploadResult> {
    try {
      if (!file || !file.buffer) {
        throw new Error('Invalid file provided');
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
      
      // Path for the image in R2
      const imageKey = `${folder}/${fileName}`;
      
      // Upload image to R2
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: imageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // Return the URL for the image
      return {
        imageUrl: `${this.publicBaseUrl}/${imageKey}`
      };
    } catch (error) {
      console.error('Error uploading image to R2:', error);
      throw new Error(`Failed to upload image: ${(error as Error).message}`);
    }
  }

  /**
   * Generates a pre-signed URL for direct upload to R2
   * @param key The key (path) where the file will be stored
   * @param contentType The content type of the file
   * @param expiresIn Expiration time in seconds
   * @returns Pre-signed URL for upload
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Generates a pre-signed URL for downloading a file from R2
   * @param key The key (path) of the file to download
   * @param expiresIn Expiration time in seconds
   * @returns Pre-signed URL for download
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}

// Export a singleton instance
export const r2StorageService = new R2StorageService();
