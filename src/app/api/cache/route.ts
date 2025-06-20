import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const cacheDir = path.resolve(process.cwd(), "src/data/cache");

export async function GET(request: Request) {
  try {
    const files = await fs.readdir(cacheDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    return NextResponse.json({ files: jsonFiles });
  } catch (error) {
    console.error("Error reading cache directory:", error);
    return NextResponse.json(
      { error: "Error reading cache directory" },
      { status: 500 }
    );
  }
}
