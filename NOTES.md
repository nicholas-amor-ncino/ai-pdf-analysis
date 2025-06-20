# Project Notes

GOAL: Extract structured data from the Deklam Divas 2019.pdf document, specifically from Form 1125-A, by using Claude via AWS Bedrock.

- [Deklam Divas 2019.pdf page 12](<src/data/pdf/Deklam Divas 2019/Deklam Divas 2019.pdf-12.jpg>) is a Form 1125-A form, and the fields for that are in [1125A.fields.json](src/data/1125A.fields.json)

- to use the inference profile we need to run ala `$ aws sso login --profile genai; export AWS_PROFILE=genai; npm run dev`
