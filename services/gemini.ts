import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system/legacy';

// In a real app, use expo-env or similar. For now, we use the provided key.
const API_KEY = "AIzaSyDjal2zAxO-ikqbUUtNSzr_TH_oOy9W58s";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ReceiptData {
    date?: string;
    storeName?: string;
    totalAmount?: number;
    rawText: string;
}

export const analyzeReceipt = async (imageUri: string): Promise<ReceiptData> => {
    try {
        // 1. Read file as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // 2. Prepare model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 3. Prepare prompt
        const prompt = `
        Analyze this receipt image and extract the following information in JSON format:
        - storeName: The name of the store.
        - date: The date of the transaction (formatted as YYYY/MM/DD).
        - totalAmount: The total amount paid (number only, remove currency symbols).
        
        If any field is missing or illegible, set it to null.
        Return ONLY the JSON object, no markdown formatting.
        `;

        // 4. Generate content
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: "image/jpeg", // Assuming JPEG from camera
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // 5. Parse JSON
        // Cleanup markdown code blocks if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        return {
            storeName: data.storeName || undefined,
            date: data.date || undefined,
            totalAmount: data.totalAmount ? Number(data.totalAmount) : undefined,
            rawText: text, // Keep the full response for debugging if needed
        };

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
};
