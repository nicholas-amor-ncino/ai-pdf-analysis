# Document Analysis with AI

This project is a Next.js application that uses AWS Bedrock to analyze uploaded documents (PDFs, images) and extract structured information such as tax statements, driver's licenses, and payslips into JSON format.

## Overview

The application provides a drag-and-drop interface for uploading files and analyzing various document types. Users can upload PDF, JPG, JPEG, or PNG files, which are then processed and analyzed using AI.

![AI PDF Analysis Screenshot](/public/ai-pdf-analysis-screenshot.png)

The workflow:

1. User uploads a file via drag-and-drop or file picker
2. PDFs are automatically converted to JPEG images for analysis
3. Files are processed and stored with unique identifiers
4. AI analysis extracts structured data from the document
5. Results are cached locally and displayed to the user
6. Users can view cached analysis results from previous uploads

The application can identify and analyze documents including tax forms, driver's licenses, payslips, and other structured documents.

## Tech Stack

- Next.js 15 with Turbopack for development
- React 19
- TypeScript
- AWS SDK for JavaScript (Bedrock Runtime)
- pdf2pic for PDF to image conversion
- Multer for file upload handling

## Dependencies

This application requires ImageMagick or GraphicsMagick to be installed on your system for PDF to image conversion:

**macOS:**

```bash
brew install imagemagick
# or
brew install graphicsmagick
```

**Ubuntu/Debian:**

```bash
sudo apt-get install imagemagick
# or
sudo apt-get install graphicsmagick
```

**Windows:**
Download and install from:

- ImageMagick: https://imagemagick.org/script/download.php#windows
- GraphicsMagick: http://www.graphicsmagick.org/download.html

## Getting Started

First, set up your environment variables. Create a `.env.local` file:

```bash
MODEL_ID=<your-bedrock-model-id>
```

Set up AWS SSO profile for Bedrock access:

```bash
aws sso login --profile genai
export AWS_PROFILE=genai
```

Then, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **File Upload**: Drag-and-drop or click to upload PDF, JPG, JPEG, and PNG files
- **PDF Processing**: Automatic conversion of PDF pages to JPEG images for analysis
- **AI Analysis**: Uses AWS Bedrock's Claude model to extract structured data from documents
- **Document Types**: Supports tax forms, driver's licenses, payslips, and other structured documents
- **Caching**: Analysis results are cached locally for quick retrieval
- **File Management**: Built-in endpoints to list uploaded files and cached results
- **Clean-up Commands**: Scripts to clean uploaded files and cached data

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
