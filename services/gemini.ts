import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { RECEIPT_ANALYSIS_PROMPT } from '../constants/prompts';

// In a real app, use expo-env or similar. For now, we use the provided key.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ReceiptData {
    date?: string;
    storeName?: string;
    totalAmount?: number;
    rawText: string;
}

export const analyzeReceipt = async (imageUri: string): Promise<ReceiptData> => {
    try {
        // 0. Resize and compress image
        const manipulated = await manipulateAsync(
            imageUri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
        );

        // 1. Read file as base64
        const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
            encoding: 'base64',
        });

        // 2. Prepare model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 3. Prepare prompt
        const prompt = RECEIPT_ANALYSIS_PROMPT;

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
