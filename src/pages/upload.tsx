import { useState } from "react";
import { uploadPDF } from "../utils/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "../components/Layout";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      await uploadPDF(file);
      setMessage("File uploaded successfully!");
    } catch (error) {
      setMessage("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Upload PDF Document</h1>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 text-white bg-blue-500 rounded ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default UploadPage;
