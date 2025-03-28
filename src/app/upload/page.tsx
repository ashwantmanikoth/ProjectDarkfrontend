"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { uploadPDF } from "../../utils/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import AppLayout from "../../components/Layout";
import { Input } from "../../components/ui/input";
import { Button } from "@/components/ui/button";

const UploadPage = () => {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(); // Redirect to login page if not authenticated
    }
  }, [status]);

  const handleFileChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
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

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading message while checking authentication status
  }
  return (
    <ProtectedRoute>
      <AppLayout children={undefined} />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex items-center">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-white hover:text-black border border-black transition-all duration-300 transform hover:scale-105"
          >
            Upload PDF
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </ProtectedRoute>
  );
};

export default UploadPage;
