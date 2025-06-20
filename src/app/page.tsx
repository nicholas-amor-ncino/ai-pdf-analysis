"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cachedFiles, setCachedFiles] = useState<string[]>([]);
  const [selectedCacheFile, setSelectedCacheFile] = useState("");

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
    fetchCacheList();
  }, []);

  async function handleClick() {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/analyse?document=documentType&form=1125A");
      const data = await res.json();
      // The response from the API is a string that contains a JSON object.
      // The JSON object is inside a code block. We need to extract it.
      const jsonString = data.completion.match(/```json\n([\s\S]*?)\n```/)[1];
      const parsedJson = JSON.parse(jsonString);
      setOutput(JSON.stringify(parsedJson, null, 2));

      if (data.fileId) {
        if (!cachedFiles.includes(data.fileId)) {
          setCachedFiles((prevFiles) => [...prevFiles, data.fileId]);
        }
        setSelectedCacheFile(data.fileId);
      }
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
      setOutput("An error occurred. Please check the console for details.");
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
      const jsonString = data.text.match(/```json\n([\s\S]*?)\n```/)[1];
      const parsedJson = JSON.parse(jsonString);
      setOutput(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      console.error("Error fetching or parsing cache data:", error);
      setOutput("An error occurred. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <button
            className={styles.primary}
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? "Inferring..." : "Infer"}
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
            <Image
              src="/form-image.jpg"
              alt="Form 1125-A"
              width={800}
              height={1035}
              className={styles.formImage}
            />
          </div>
          <div className={styles.output}>
            {output && <pre>{output}</pre>}
          </div>
        </div>
      </main>
    </div>
  );
}
