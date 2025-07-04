import { getUploadedFiles, encodeImageToBase64 } from "../../utils/fileUtils";

export function createGenericDocumentPrompt(fileId: string, pageIndex?: number) {
  const imageFiles = getUploadedFiles(fileId);
  
  if (imageFiles.length === 0) {
    throw new Error("No processed images found for the uploaded file");
  }

  // Use specific page if pageIndex is provided and valid, otherwise use first image
  let imagePath: string;
  if (pageIndex && pageIndex > 0 && pageIndex <= imageFiles.length) {
    imagePath = imageFiles[pageIndex - 1]; // pageIndex is 1-based, array is 0-based
  } else {
    imagePath = imageFiles[0];
  }
  
  const base64Image = encodeImageToBase64(imagePath);

  const prompt = `You are an expert document analyzer. The current time is ${new Date().toISOString()}. 

Analyze the provided document image and classify it into one of these categories:
1. Tax Statement (tax returns, tax forms, W-2s, 1099s, etc.)
2. Driver's License (driver's licenses, state IDs, identification cards)
3. Payslip (paystubs, salary slips, wage statements)
4. Other (if it doesn't fit the above categories)

Please provide your analysis in the following JSON format:

{
  "documentType": "tax_statement" | "drivers_license" | "payslip" | "other",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why you classified it this way",
  "extractedText": "Key text elements you can clearly read from the document",
  "metadata": {
    "analysisDateTime": "${new Date().toISOString()}",
    "hasMultiplePages": ${imageFiles.length > 1 ? 'true' : 'false'},
    "pageCount": ${imageFiles.length}
  }
}

Focus on clear visual indicators like:
- For tax documents: Look for IRS forms, tax year, taxpayer information, income/deduction fields
- For driver's licenses: Look for license numbers, expiration dates, state seals, photo placement areas
- For payslips: Look for employer names, pay periods, gross/net pay, deductions

Be thorough but concise in your analysis.`;

  return {
    prompt,
    base64Image,
  };
}

// Legacy function for backward compatibility (will be removed later)
export function createPrompt() {
  // This is now deprecated - keeping for compatibility during transition
  throw new Error("Legacy createPrompt() is deprecated. Use createGenericDocumentPrompt(fileId) instead.");
}
