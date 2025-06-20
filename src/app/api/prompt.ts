import fs from "fs";
import path from "path";

// Function to encode the image
function encodeImage(imagePath: string) {
  const imageData = fs.readFileSync(imagePath);
  return Buffer.from(imageData).toString("base64");
}

export function createPrompt() {
  const fieldsPath = path.resolve("src/data/1125A.fields.json");
  const fields = JSON.parse(fs.readFileSync(fieldsPath, "utf-8"));

  // Add extractionDateTime to the fields to be extracted
  (fields as any).extractionDateTime = "Current ISO 8601 date and time";

  const imagePath = path.resolve(
    "src/data/pdf/Deklam Divas 2019/Deklam Divas 2019.pdf-12.jpg"
  );
  const base64Image = encodeImage(imagePath);

  const prompt = `You are an expert in analyzing tax documents. The current time is ${new Date().toISOString()}. Analyze the provided Form 1125-A and extract the information for the following fields in JSON format:

${JSON.stringify(fields, null, 2)}

Please provide the extracted data in a structured JSON format.`;

  return {
    prompt,
    base64Image,
  };
}
