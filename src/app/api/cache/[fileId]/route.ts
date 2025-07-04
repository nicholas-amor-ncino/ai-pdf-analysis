import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const cacheDir = path.resolve(process.cwd(), "src/data/cache");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const filePath = path.join(cacheDir, `${fileId}.json`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(fileContent));
  } catch (error) {
    console.error(`Error reading cache file ${fileId}:`, error);
    return NextResponse.json(
      { error: `File not found: ${fileId}` },
      { status: 404 }
    );
  }
}
