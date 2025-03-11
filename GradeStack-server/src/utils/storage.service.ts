import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const CONTAINER_NAME = "learningstage";

if (!STORAGE_CONNECTION_STRING) {
  console.error("Azure Storage connection string not found!");
  process.exit(1);
}

const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

/**
 * Uploads a file to Azure Blob Storage (replaces if exists).
 * @param file - The file to upload (Browser File object).
 * @returns The URL of the uploaded file.
 */
export const uploadFile = async (filePath: string, folderName?:string): Promise<string | null> => {
    try {
      const fileName = path.basename(filePath); // Extract filename
      if(!folderName)
        folderName = "uploads"
      const blobName = `${folderName}/${fileName}`;
      const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);
  
      console.log(`Uploading file: ${filePath} as ${blobName}...`);

      const contentType = getContentType(fileName);
  
      // Read file as a Buffer
      const fileBuffer = fs.readFileSync(filePath);

  
      // Upload file as binary data
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: contentType, // Set proper Content-Type
          blobContentDisposition: "inline", // Ensures it opens in browser
        },
      });
  
      console.log(`Uploaded successfully! Blob URL: ${blockBlobClient.url}`);
      return blockBlobClient.url;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

/**
 * Deletes a file from Azure Blob Storage.
 * @param fileName - The file name in the container.
 * @returns True if deletion is successful, otherwise false.
 */
export const deleteFile = async (fileName: string): Promise<boolean> => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(`uploads/${fileName}`);
    
    await blockBlobClient.deleteIfExists();
    console.log(`Deleted ${fileName} successfully.`);
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
};

/**
 * Updates an existing file in Azure Blob Storage.
 * @param file - The new file to replace the existing one.
 * @param existingFileName - The name of the existing file in storage.
 * @returns The updated file's URL.
 */
export const updateFile = async (file: File, existingFileName: string): Promise<string | null> => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(`uploads/${existingFileName}`);

    console.log(`Updating file: ${existingFileName}...`);

    const buffer = Buffer.from(await file.arrayBuffer());

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type },
    });

    console.log(`Updated successfully! New file URL: ${blockBlobClient.url}`);
    return blockBlobClient.url;
  } catch (error) {
    console.error("Update failed:", error);
    return null;
  }
};

function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
  };
  return mimeTypes[ext] || "application/octet-stream";
}


