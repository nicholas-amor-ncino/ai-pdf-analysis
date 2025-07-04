# AI PDF Analysis

This project is a Next.js application that uses AWS Bedrock to analyze an image of a tax form (Form 1125-A) and extract specific fields into a JSON format.

## Overview

The application provides a simple web interface to trigger an analysis of a predefined document. When a user clicks the "Infer" button, the frontend makes a request to a backend API endpoint.

![AI PDF Analysis Screenshot](/public/ai-pdf-analysis-screenshot.png)

The backend then:

1. Constructs a prompt containing the image of the document and the desired fields to extract.
2. Sends this prompt to an AWS Bedrock model for analysis.
3. Receives the extracted data in JSON format from the model.
4. Caches the response to a local file.
5. Returns the extracted data to the frontend to be displayed.

The application also allows users to view the results of previous analyses from a dropdown list of cached responses.

## Tech Stack

- Next.js
- React
- TypeScript
- AWS SDK for JavaScript (Bedrock Runtime)

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

First, provide your AWS credentials and set the `MODEL_ID` environment variable :

```
echo 'PROFILE_ID=<your-profile-id>' >> .env.local
```

Then, run the development server with a genai SSO profile:

```bash
sso genai
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
