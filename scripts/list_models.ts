import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDjal2zAxO-ikqbUUtNSzr_TH_oOy9W58s";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // Note: The SDK doesn't expose listModels directly on the main class in all versions,
        // but let's try to use the model directly or just check a simple generation to debug.
        // Actually, for debugging, let's try to generate content with 'gemini-1.5-flash' again 
        // but with a very simple prompt to isolate the issue.

        // If we want to list models, we might need to use the REST API directly if the SDK helper isn't obvious.
        // Let's try a direct fetch to the models endpoint.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => console.log(m.name));
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
