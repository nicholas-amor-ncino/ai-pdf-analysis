import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { createPrompt } from "../prompt";
import { uuid } from "../../../utils/uuid";
import { promises as fs } from "fs";
import path from "path";

const cacheDir = path.resolve(process.cwd(), "src/data/cache");

async function ensureCacheDirExists() {
  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch (error) {
    console.error("Error creating cache directory:", error);
  }
}

ensureCacheDirExists();

export async function GET(request: Request) {
  const client = new BedrockRuntimeClient({ region: "us-east-1" });
  const { prompt, base64Image } = createPrompt();

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

  const fileId = uuid();
  const cacheFilePath = path.join(cacheDir, `${fileId}.json`);

  try {
    await fs.writeFile(
      cacheFilePath,
      JSON.stringify(responseBody.content[0], null, 2)
    );
  } catch (error) {
    console.error("Error writing to cache file:", error);
    // Decide how to handle the error, maybe return an error response
  }

  return NextResponse.json({
    completion: responseBody.content[0].text,
    fileId,
  });
}
