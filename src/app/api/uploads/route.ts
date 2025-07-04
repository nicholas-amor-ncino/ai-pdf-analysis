import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), "src/data/uploads");
    
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({ files: [] });
    }

    const fileIds = fs.readdirSync(uploadsDir).filter(item => {
      const itemPath = path.join(uploadsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    const files = fileIds.map(fileId => {
      const fileDir = path.join(uploadsDir, fileId);
      const filesInDir = fs.readdirSync(fileDir);
      
      // Try to read metadata first
      let originalFileName = null;
      const metadataPath = path.join(fileDir, "metadata.json");
      if (fs.existsSync(metadataPath)) {
        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          originalFileName = metadata.originalName;
        } catch (error) {
          console.error("Error reading metadata for", fileId, error);
        }
      }
      
      // Fallback to finding original file if no metadata
      const originalFile = filesInDir.find(f => f.startsWith("original."));
      const displayName = originalFileName || originalFile || `File ${fileId}`;
      
      const pageFiles = filesInDir.filter(f => f.match(/^page\.\d+\.jpeg$/)).sort((a, b) => {
        const aNum = parseInt(a.match(/page\.(\d+)\.jpeg/)?.[1] || "0");
        const bNum = parseInt(b.match(/page\.(\d+)\.jpeg/)?.[1] || "0");
        return aNum - bNum;
      });

      return {
        fileId,
        originalFile: displayName,
        pages: pageFiles,
        totalPages: pageFiles.length || 1
      };
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing uploads:", error);
    return NextResponse.json(
      { error: "Failed to list uploaded files" },
      { status: 500 }
    );
  }
}