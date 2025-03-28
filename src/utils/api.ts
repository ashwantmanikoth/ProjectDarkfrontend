import axios from 'axios';
import { error } from 'console';

const API_URL = process.env.FLASK_URL || 'http://127.0.0.1:5000';

export const uploadPDF = async (file: File) => {
    console.log("uploading file")
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    if(response.status!=200){
        throw new Error('Cannot process now');
    }
    return response.data;
};

export const searchDocuments = async (query: string) => {
    console.log("searching file")

    const response = await axios.post(`${API_URL}/query`, {
        query: query,
    });
    return response;
};