import fs from "fs";
import path from "path";

const uploadsDir = path.resolve(process.cwd(), "src/data/uploads");

export function getUploadedFiles(fileId: string): string[] {
  const uploadPath = path.join(uploadsDir, fileId);
  
  if (!fs.existsSync(uploadPath)) {
    return [];
  }

  const files = fs.readdirSync(uploadPath);
  const imageFiles = files
    .filter(file => file.startsWith("page.") && file.endsWith(".jpeg"))
    .map(file => path.join(uploadPath, file))
    .sort(); // Sort to maintain page order

  // If no PDF pages found, look for original image file
  if (imageFiles.length === 0) {
    const originalFiles = files
      .filter(file => file.startsWith("original") && 
        (file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png")))
      .map(file => path.join(uploadPath, file));
    
    return originalFiles;
  }

  return imageFiles;
}

export function encodeImageToBase64(imagePath: string): string {
  const imageData = fs.readFileSync(imagePath);
  return Buffer.from(imageData).toString("base64");
}

export function getFileMetadata(fileId: string) {
  const uploadPath = path.join(uploadsDir, fileId);
  
  if (!fs.existsSync(uploadPath)) {
    return null;
  }

  const files = fs.readdirSync(uploadPath);
  const originalFile = files.find(file => file.startsWith("original"));
  const pageFiles = files.filter(file => file.startsWith("page."));

  return {
    fileId,
    hasOriginal: !!originalFile,
    originalType: originalFile ? path.extname(originalFile) : null,
    pageCount: pageFiles.length,
    uploadPath
  };
}