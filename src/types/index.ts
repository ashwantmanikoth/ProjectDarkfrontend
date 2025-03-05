export interface UploadResponse {
    success: boolean;
    message: string;
    fileUrl?: string;
}

export interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    pageNumber: number;
}

export interface Document {
    id: string;
    title: string;
    uploadedAt: Date;
    size: number; // in bytes
}

export interface Query {
    text: string;
    results: SearchResult[];
}