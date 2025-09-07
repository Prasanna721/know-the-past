
import { GoogleGenAI, Type } from "@google/genai";
import type { HistoricalPlace } from '../types';

// This assumes the API_KEY is available as an environment variable.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Exact official name of the place." },
        description: { type: Type.STRING, description: "Rich, engaging 3-4 sentence description that captures the place's visual beauty, historical context, and unique characteristics. Paint a vivid picture of what visitors would experience." },
        historicalPeriod: { type: Type.STRING, description: "Specific time period or era (e.g., '12th century CE', '1850-1950', 'Jurassic Period - 150 million years ago')." },
        latitude: { type: Type.NUMBER, description: "Precise decimal latitude." },
        longitude: { type: Type.NUMBER, description: "Precise decimal longitude." },
        country: { type: Type.STRING, description: "Full country name." },
        significance: { type: Type.STRING, description: "Detailed explanation of why this place is historically, culturally, or geologically important. What makes it special or unique in world history?" },
        category: { type: Type.STRING, description: "The category provided in the prompt." },
        visualImpact: { type: Type.STRING, description: "Brief description of the most striking visual or experiential aspect." },
        bestViewingTime: { type: Type.STRING, description: "When to visit for optimal experience (season, time of day, etc.)." },
        historicalContext: { type: Type.STRING, description: "Additional historical background or interesting facts." },
        zoom_level: { type: Type.INTEGER, description: "An integer zoom level for the map, between 15 and 22." },
    },
    required: ["name", "description", "historicalPeriod", "latitude", "longitude", "country", "significance", "category", "visualImpact", "bestViewingTime", "historicalContext", "zoom_level"]
};


export const fetchHistoricalPlace = async (category: string): Promise<HistoricalPlace> => {
    const prompt = `Based on the category '${category}', pick a fascinating and visually striking historical or natural place anywhere in the world. Provide the following details as a JSON object. Ensure the latitude and longitude are accurate for mapping. The zoom_level should be appropriate to see the place in detail.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        // Ensure category from the request is used, in case the model hallucinates it.
        data.category = category;

        return data as HistoricalPlace;
    } catch (error) {
        console.error("Error fetching data from Gemini API:", error);
        throw new Error("Failed to generate historical place from AI. Please try again.");
    }
};
