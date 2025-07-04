import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string; filename: string } }
) {
  try {
    const { fileId, filename } = params;
    
    const filePath = path.join(
      process.cwd(),
      "src/data/uploads",
      fileId,
      filename
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const imageBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = "image/jpeg";
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}