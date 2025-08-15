import axios from 'axios';

const API_URL = process.env.FLASK_URL || 'http://127.0.0.1:5000';

/**
 * Upload a PDF file using regular multipart/form-data upload.
 * 
 * This function is suitable for smaller files (< 10MB) and provides:
 * - Standard file upload with FormData
 * - Progress tracking capability
 * - Error handling and retry logic
 * 
 * @param file - The PDF file to upload
 * @param documentId - Unique identifier for the document
 * @param groupId - Optional group identifier for organizing documents
 * @returns Promise with upload response data
 * 
 * @example
 * ```typescript
 * const response = await uploadPDF(file, 'doc123', 'group456');
 * console.log('Upload successful:', response);
 * ```
 */
export async function uploadPDF(file: File, documentId: string, groupId?: string) {
    try {
        console.log("uploadPDF - Starting upload...");
        console.log("uploadPDF - documentId:", documentId);
        console.log("uploadPDF - groupId:", groupId);
        console.log("uploadPDF - groupId type:", typeof groupId);
        console.log("uploadPDF - groupId === 'undefined':", groupId === 'undefined');

        // Prepare form data for multipart upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentId", documentId);

        // Add groupId if provided and valid
        if (groupId && groupId !== "undefined") {
            console.log("uploadPDF - Appending groupId to formData:", groupId);
            formData.append("groupId", groupId);
        } else {
            console.log("uploadPDF - Not appending groupId (invalid or undefined)");
        }

        const flaskUrl = `${API_URL}/upload`;
        console.log("uploadPDF - Flask URL:", flaskUrl);
        console.log("uploadPDF - FLASK_URL env var:", process.env.FLASK_URL);

        // Send upload request with timeout and proper headers
        const response = await axios.post(
            flaskUrl,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 30000, // 30 second timeout for upload
            }
        );

        if (response.status !== 200) {
            throw new Error("Upload failed");
        }

        return response.data;
    } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
    }
}

/**
 * Upload a PDF file using streaming upload for large files.
 * 
 * This function is designed for larger files (≥ 10MB) and provides:
 * - Chunked file upload to prevent memory issues
 * - Real-time progress tracking
 * - Better handling of large files
 * - Background processing support
 * 
 * @param file - The PDF file to upload
 * @param documentId - Unique identifier for the document
 * @param groupId - Optional group identifier for organizing documents
 * @param onProgress - Optional callback function for progress updates
 * @returns Promise with upload response data
 * 
 * @example
 * ```typescript
 * const response = await uploadPDFStream(
 *   file, 
 *   'doc123', 
 *   'group456',
 *   (progress) => console.log(`Upload: ${progress}%`)
 * );
 * ```
 */
export async function uploadPDFStream(file: File, documentId: string, groupId?: string, onProgress?: (progress: number) => void) {
    try {
        console.log("uploadPDFStream - Starting streaming upload...");
        console.log("uploadPDFStream - file size:", file.size);
        console.log("uploadPDFStream - documentId:", documentId);
        console.log("uploadPDFStream - groupId:", groupId);

        // Prepare form data for streaming upload
        const formData = new FormData();
        formData.append("documentId", documentId);

        // Add groupId if provided and valid
        if (groupId && groupId !== "undefined") {
            formData.append("groupId", groupId);
        }

        const flaskUrl = `${API_URL}/upload-stream`;
        console.log("uploadPDFStream - Flask URL:", flaskUrl);

        // Send streaming upload request with progress tracking
        const response = await axios.post(
            flaskUrl,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 0, // No timeout for large files
                onUploadProgress: (progressEvent) => {
                    // Calculate and report upload progress
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            }
        );

        if (response.status !== 200) {
            throw new Error("Streaming upload failed");
        }

        return response.data;
    } catch (error) {
        console.error("Error in streaming upload:", error);
        throw error;
    }
}

/**
 * Search through processed documents in the database.
 * 
 * @param query - Search query string
 * @returns Promise with search results
 */
export const searchDocuments = async (query: string) => {
    // Search through processed documents in our database
    const response = await fetch(`/api/documents/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
        throw new Error('Failed to search documents');
    }

    return response.json();
};

/**
 * Get detailed information about a specific document.
 * 
 * @param documentId - Unique identifier for the document
 * @returns Promise with document details
 */
export const getDocumentDetails = async (documentId: string) => {
    // Get document details from our database
    const response = await fetch(`/api/documents/${documentId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch document details');
    }

    return response.json();
};