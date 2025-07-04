import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fromPath } from "pdf2pic";
import { uuid } from "../../../utils/uuid";

const uploadsDir = path.resolve(process.cwd(), "src/data/uploads");

async function ensureUploadsDirExists() {
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadsDirExists();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Generate unique file ID
    const fileId = uuid();
    const fileExtension = path.extname(file.name).toLowerCase();

    // Validate file type
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, JPG, JPEG, or PNG files." },
        { status: 400 }
      );
    }

    // Create directory for this upload
    const uploadPath = path.join(uploadsDir, fileId);
    await mkdir(uploadPath, { recursive: true });

    // Save the original file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalFilePath = path.join(uploadPath, `original${fileExtension}`);
    await writeFile(originalFilePath, buffer);

    // Save metadata about the upload
    const metadata = {
      originalName: file.name,
      fileType: fileExtension,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size
    };
    const metadataPath = path.join(uploadPath, "metadata.json");
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    let processedImages: string[] = [];

    if (fileExtension === ".pdf") {
      // Convert PDF to images
      try {
        // Validate that the PDF file was saved correctly
        if (!existsSync(originalFilePath)) {
          throw new Error("PDF file was not saved properly");
        }

        console.log("Starting PDF conversion for:", originalFilePath);
        
        const convertToBase64 = fromPath(originalFilePath, {
          density: 200,           // Output DPI
          saveFilename: "page",   // File prefix for output
          savePath: uploadPath,   // Directory to save images
          format: "jpeg",         // Output format
          width: 1200,           // Max width
          height: 1600,          // Max height - aspect ratio will be preserved
          quality: 90,           // JPEG quality
          background: "white",   // Set white background for transparency
          colorspace: "RGB",     // Ensure proper colorspace
          flatten: true,         // Flatten transparency layers
          preserveAspectRatio: true  // Explicitly preserve aspect ratio
        });

        // Configure to use ImageMagick (false = ImageMagick, true = GraphicsMagick)
        convertToBase64.setGMClass(false);

        console.log("Attempting to convert all pages...");
        // Use bulk() method to convert all pages
        let results;
        try {
          // Try converting all pages using bulk method
          results = await convertToBase64.bulk(-1); // -1 converts all pages
        } catch (bulkError) {
          console.log("Bulk conversion failed, trying single page conversion...");
          // Fallback: try converting just the first page
          const singleResult = await convertToBase64(1);
          results = [singleResult]; // Wrap in array to match expected format
        }
        console.log("Conversion successful, processed", results.length, "pages");
        
        processedImages = results.map((result, index) => 
          path.join(uploadPath, `page.${index + 1}.jpeg`)
        );
      } catch (error) {
        console.error("PDF conversion error:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          originalFilePath,
          uploadPath
        });
        return NextResponse.json(
          { error: `Failed to process PDF file: ${error instanceof Error ? error.message : String(error)}` },
          { status: 500 }
        );
      }
    } else {
      // For image files, just use the original
      processedImages = [originalFilePath];
    }

    return NextResponse.json({
      fileId,
      originalName: file.name,
      fileType: fileExtension,
      processedImages: processedImages.length,
      message: "File uploaded and processed successfully"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}