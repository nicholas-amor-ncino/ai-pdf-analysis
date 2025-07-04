import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { createGenericDocumentPrompt } from "../prompt";
import { uuid } from "../../../utils/uuid";
import { promises as fs } from "fs";
import path from "path";
import { getFileMetadata } from "../../../utils/fileUtils";

const cacheDir = path.resolve(process.cwd(), "src/data/cache");

async function ensureCacheDirExists() {
  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch (error) {
    console.error("Error creating cache directory:", error);
  }
}

ensureCacheDirExists();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  const pageIndexStr = searchParams.get("pageIndex");
  const pageIndex = pageIndexStr ? parseInt(pageIndexStr) : undefined;

  if (!fileId) {
    return NextResponse.json(
      { error: "Missing fileId parameter" },
      { status: 400 }
    );
  }

  // Verify the file exists
  const fileMetadata = getFileMetadata(fileId);
  if (!fileMetadata) {
    return NextResponse.json(
      { error: "File not found or has been deleted" },
      { status: 404 }
    );
  }

  try {
    const client = new BedrockRuntimeClient({ region: "us-east-1" });
    const { prompt, base64Image } = createGenericDocumentPrompt(fileId, pageIndex);

    const input = {
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
      contentType: "application/json",
      accept: "application/json",
      modelId: process.env.MODEL_ID!,
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const decodedResponseBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(decodedResponseBody);

    const cacheFileId = uuid();
    const cacheFilePath = path.join(cacheDir, `${cacheFileId}.json`);

    try {
      await fs.writeFile(
        cacheFilePath,
        JSON.stringify(responseBody.content[0], null, 2)
      );
    } catch (error) {
      console.error("Error writing to cache file:", error);
      // Continue despite cache error
    }

    return NextResponse.json({
      completion: responseBody.content[0].text,
      fileId: cacheFileId,
      originalFileId: fileId,
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
