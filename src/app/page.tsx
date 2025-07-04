"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface UploadedFile {
  fileId: string;
  originalFile: string;
  pages: string[];
  totalPages: number;
}

export default function Home() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cachedFiles, setCachedFiles] = useState<string[]>([]);
  const [selectedCacheFile, setSelectedCacheFile] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previousFiles, setPreviousFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCacheList() {
      try {
        const res = await fetch("/api/cache");
        const data = await res.json();
        if (data.files) {
          setCachedFiles(
            data.files.map((file: string) => file.replace(".json", ""))
          );
        }
      } catch (error) {
        console.error("Error fetching cache list:", error);
      }
    }

    async function fetchUploadedFiles() {
      try {
        const res = await fetch("/api/uploads");
        const data = await res.json();
        if (data.files) {
          setPreviousFiles(data.files);
        }
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    }

    fetchCacheList();
    fetchUploadedFiles();
  }, []);

  async function handleFileUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadedFileId(result.fileId);
        setUploadedFile(file);
        
        // Create new file entry for the previous files list
        let pages: string[] = [];
        let totalPages = 1;
        
        if (file.type === "application/pdf" && result.processedImages > 0) {
          // Generate page filenames for PDF
          pages = Array.from({ length: result.processedImages }, (_, i) => `page.${i + 1}.jpeg`);
          totalPages = result.processedImages;
        }
        
        const newFile: UploadedFile = {
          fileId: result.fileId,
          originalFile: file.name,
          pages,
          totalPages
        };
        
        // Add to previous files list
        setPreviousFiles(prev => [newFile, ...prev]);
        
        // Auto-select the newly uploaded file
        setSelectedFileId(result.fileId);
        setSelectedPageIndex(0);
        
        // Set preview URL for the uploaded file
        if (file.type.startsWith("image/")) {
          // For images, show the original file
          const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
          setPreviewUrl(`/api/image/${result.fileId}/original${fileExtension}`);
        } else if (file.type === "application/pdf" && pages.length > 0) {
          // For PDFs, show the first converted page
          setPreviewUrl(`/api/image/${result.fileId}/${pages[0]}`);
        } else {
          setPreviewUrl("");
        }
        
        // Clear any previous output
        setOutput("");
        setSelectedCacheFile("");
      } else {
        console.error("Upload failed:", result.error);
        setOutput(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setOutput("Upload failed. Please try again.");
    }
  }

  async function handleAnalyze() {
    const targetFileId = selectedFileId || uploadedFileId;
    if (!targetFileId) {
      setOutput("Please upload a file or select a previously uploaded file.");
      return;
    }

    setLoading(true);
    setOutput("");
    try {
      let url = `/api/analyse?fileId=${targetFileId}`;
      if (selectedFileId && selectedPageIndex > 0) {
        url += `&pageIndex=${selectedPageIndex}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        setOutput(`Error: ${data.error}`);
        return;
      }

      // Extract JSON from markdown code block
      const jsonMatch = data.completion.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[1]);
        setOutput(JSON.stringify(parsedJson, null, 2));
      } else {
        // If no code block, try to display raw response
        setOutput(data.completion);
      }

      if (data.fileId) {
        if (!cachedFiles.includes(data.fileId)) {
          setCachedFiles((prevFiles) => [...prevFiles, data.fileId]);
        }
        setSelectedCacheFile(data.fileId);
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
      setOutput("Analysis failed. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCacheSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const fileId = event.target.value;
    setSelectedCacheFile(fileId);

    if (!fileId) {
      setOutput("");
      return;
    }

    setLoading(true);
    setOutput("");
    try {
      const res = await fetch(`/api/cache/${fileId}`);
      const data = await res.json();
      const jsonMatch = data.text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[1]);
        setOutput(JSON.stringify(parsedJson, null, 2));
      } else {
        setOutput(data.text);
      }
    } catch (error) {
      console.error("Error fetching cache data:", error);
      setOutput("An error occurred. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }

  // Drag and drop handlers
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  }

  function handlePreviousFileSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const fileId = event.target.value;
    setSelectedFileId(fileId);
    setSelectedPageIndex(0);
    
    // Clear current upload states when selecting previous file
    if (fileId) {
      setUploadedFile(null);
      setUploadedFileId("");
      setOutput("");
      setSelectedCacheFile("");
      
      // Set preview URL for the selected file
      const selectedFile = previousFiles.find(f => f.fileId === fileId);
      if (selectedFile) {
        if (selectedFile.pages.length > 0) {
          // Show first page image for PDFs
          setPreviewUrl(`/api/image/${fileId}/${selectedFile.pages[0]}`);
        } else if (selectedFile.originalFile) {
          // Show original file for images
          setPreviewUrl(`/api/image/${fileId}/${selectedFile.originalFile}`);
        }
      }
    } else {
      setPreviewUrl("");
    }
  }

  function handlePageSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const pageIndex = parseInt(event.target.value);
    setSelectedPageIndex(pageIndex);
    
    // Update preview URL for the selected page
    if (selectedFileId && pageIndex > 0) {
      const selectedFile = previousFiles.find(f => f.fileId === selectedFileId);
      if (selectedFile && selectedFile.pages[pageIndex - 1]) {
        setPreviewUrl(`/api/image/${selectedFileId}/${selectedFile.pages[pageIndex - 1]}`);
      }
    } else if (selectedFileId && pageIndex === 0) {
      // Show first page when "All pages" is selected
      const selectedFile = previousFiles.find(f => f.fileId === selectedFileId);
      if (selectedFile) {
        if (selectedFile.pages.length > 0) {
          setPreviewUrl(`/api/image/${selectedFileId}/${selectedFile.pages[0]}`);
        } else if (selectedFile.originalFile) {
          setPreviewUrl(`/api/image/${selectedFileId}/${selectedFile.originalFile}`);
        }
      }
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Generic Document Detector</h1>
        <p>Upload a PDF or image file to analyze. Supports tax statements, driver&apos;s licenses, and payslips.</p>
        
        <div className={styles.uploadSection}>
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />
            <div className={styles.dropZoneContent}>
              {uploadedFile ? (
                <div>
                  <p>✓ {uploadedFile.name}</p>
                  <p>Click to upload a different file</p>
                </div>
              ) : (
                <div>
                  <p>Drag and drop a file here, or click to select</p>
                  <p>Supports PDF, JPG, JPEG, and PNG files</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.ctas}>
          <select
            value={selectedFileId}
            onChange={handlePreviousFileSelect}
            disabled={loading}
          >
            <option value="">Select uploaded file</option>
            {previousFiles.map((file) => (
              <option key={file.fileId} value={file.fileId}>
                {file.originalFile} ({file.totalPages} pages)
              </option>
            ))}
          </select>
          
          {selectedFileId && previousFiles.find(f => f.fileId === selectedFileId)?.totalPages > 1 && (
            <select
              value={selectedPageIndex}
              onChange={handlePageSelect}
              disabled={loading}
            >
              <option value={0}>All pages</option>
              {previousFiles
                .find(f => f.fileId === selectedFileId)
                ?.pages.map((page, index) => (
                  <option key={page} value={index + 1}>
                    Page {index + 1}
                  </option>
                ))}
            </select>
          )}
          
          <button
            className={styles.primary}
            onClick={handleAnalyze}
            disabled={loading || (!uploadedFileId && !selectedFileId)}
          >
            {loading ? "Analyzing..." : "Analyze Document"}
          </button>
          <select
            value={selectedCacheFile}
            onChange={handleCacheSelect}
            disabled={loading}
          >
            <option value="">Select a cached response</option>
            {cachedFiles.map((fileId) => (
              <option key={fileId} value={fileId}>
                {fileId}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.sideBySide}>
          <div className={styles.imageContainer}>
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Uploaded document preview"
                fill
                className={styles.formImage}
                style={{ objectFit: 'contain' }}
              />
            ) : uploadedFile && uploadedFile.type === "application/pdf" ? (
              <div className={styles.pdfPlaceholder}>
                <p>📄 PDF uploaded: {uploadedFile.name}</p>
                <p>Converted to {uploadedFile.size > 0 ? "images" : "image"} for analysis</p>
              </div>
            ) : (
              <div className={styles.placeholder}>
                <p>Upload a document to see preview</p>
              </div>
            )}
          </div>
          <div className={styles.output}>
            {output && <pre>{output}</pre>}
          </div>
        </div>
      </main>
    </div>
  );
}
