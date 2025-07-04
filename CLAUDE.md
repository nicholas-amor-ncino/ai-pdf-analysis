# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean:uploads` - Remove all uploaded files
- `npm run clean:cache` - Remove all cached analysis results
- `npm run clean` - Clean both uploads and cache

### Testing

This project does not currently have tests configured.

## Architecture Overview

This is a Next.js application that serves as a generic document detector and analyzer. It accepts file uploads (PDF, JPG, JPEG, PNG) and uses AWS Bedrock's Claude model to identify and analyze documents such as tax statements, driver's licenses, and payslips.

### Key Components

**API Routes:**

- `src/app/api/upload/route.ts` - File upload endpoint that handles PDF conversion to images
- `src/app/api/analyse/route.ts` - Main analysis endpoint that sends images to AWS Bedrock
- `src/app/api/cache/route.ts` - Lists cached analysis results
- `src/app/api/cache/[fileId]/route.ts` - Retrieves specific cached results
- `src/app/api/uploads/route.ts` - Lists all uploaded files with metadata
- `src/app/api/image/[fileId]/[filename]/route.ts` - Serves uploaded images and files
- `src/app/api/prompt.ts` - Creates prompts with base64-encoded images for AI analysis

**Utility Functions:**

- `src/utils/fileUtils.ts` - Helper functions for file processing and metadata extraction
- `src/utils/uuid.ts` - UUID generation utility

**Data Flow:**

1. User uploads file via drag-and-drop or file picker on frontend
2. `/api/upload` endpoint processes the file:
   - PDFs are converted to JPEG images using pdf2pic
   - Images are stored in `src/data/uploads/[fileId]/`
   - Returns fileId for subsequent analysis
3. Frontend triggers analysis via `/api/analyse?fileId=[fileId]` endpoint
4. `createPrompt()` function encodes uploaded images and creates analysis prompt
5. Request sent to AWS Bedrock with images and structured prompt
6. Response cached locally in `src/data/cache/` with UUID filename
7. Extracted JSON data displayed on frontend

**Data Structure:**

- `src/data/uploads/` - User uploaded files organized by fileId
  - `[fileId]/original.[ext]` - Original uploaded file
  - `[fileId]/page.N.jpeg` - PDF pages converted to JPEG images
  - `[fileId]/metadata.json` - File metadata including original name, type, size, and upload timestamp
- `src/data/cache/` - Analysis results stored as JSON files with UUID filenames
- `src/data/pdf/` - Legacy PDF storage directory (may contain older test files)
- `src/data/1125A.fields.json` - Legacy fields definition for Form 1125-A analysis

### Dependencies

Key packages for file upload and analysis functionality:

- `@aws-sdk/client-bedrock-runtime` - AWS Bedrock client for AI model interactions
- `pdf2pic` - Converts PDF pages to JPEG images
- `multer` - File upload handling (types only)
- Next.js 15 with Turbopack for development
- React 19

### Environment Requirements

The application requires:

- `MODEL_ID` environment variable for AWS Bedrock model identifier
- AWS credentials configured for Bedrock access in `us-east-1` region

### File Processing

- Supports PDF, JPG, JPEG, and PNG file uploads
- PDFs are automatically converted to JPEG images (200 DPI, 800px width)
- Uses ImageMagick for PDF conversion via pdf2pic
- Files are organized by unique fileId in upload directories
- Image previews shown for supported formats

The response parsing expects AI output in markdown code blocks with JSON format:

```json
{
  "field1": "value1",
  "field2": "value2"
}
```
