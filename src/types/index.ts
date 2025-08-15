export interface UploadResponse {
    documentId: string;
    summary: string;
    pageCount: number;
    filePath: string;
}

export interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    pageNumber: number;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    documentCount?: number;
}

export interface Document {
    id: string;
    title: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    pageCount: number;
    status: 'processed' | 'processing' | 'failed';
    summary?: string;
    uploadedAt: Date;
    processedAt?: Date;
    userId: string;
    groupId?: string;
}

export interface Query {
    text: string;
    results: SearchResult[];
}