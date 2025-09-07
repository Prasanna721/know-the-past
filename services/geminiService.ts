import { GoogleGenAI, Type } from "@google/genai";
import type { HistoricalPlace } from '../types';

// This assumes the API_KEY is available as an environment variable.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Official name of the place." },
        description: { type: Type.STRING, description: "A concise and engaging 1-2 sentence description, focusing on its core identity." },
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
        zoom_level: { type: Type.INTEGER, description: "Zoom level between 15 and 22." },
        details: {
            type: Type.ARRAY,
            description: "An array of 2-4 key details tailored to the place's category.",
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING, description: "Custom label for the detail (e.g., 'Geological Age', 'Era')." },
                    value: { type: Type.STRING, description: "The specific fact or data for the label." },
                    icon: { type: Type.STRING, description: "An icon name from the allowed list: 'calendar', 'globe', 'geology', 'architecture', 'growth', 'time', 'sparkles'." }
                },
                required: ["label", "value", "icon"]
            }
        }
    },
    required: ["name", "description", "latitude", "longitude", "zoom_level", "details"]
};


export const fetchHistoricalPlace = async (category: string): Promise<HistoricalPlace> => {
    const prompt = `You are an expert historian and geologist. Based on the category '${category}', find a globally significant location. Your response must be highly specific and tailored.

1.  Provide a concise, engaging 1-2 sentence description.
2.  Generate an array of 2 to 4 key details that are *specifically relevant* to this place and its category. Do NOT use generic labels. Make them insightful.
3.  For each detail, provide a custom 'label', a 'value', and an 'icon' name from the following list: ['calendar', 'globe', 'geology', 'architecture', 'growth', 'time', 'sparkles'].

Example for category 'nature':
- A detail could be { "label": "Geological Age", "value": "Formed over 2 billion years", "icon": "geology" }.

Example for category 'ancient':
- A detail could be { "label": "Constructed During", "value": "70-80 AD", "icon": "calendar" }.

Always include a detail for the location's country using the 'globe' icon.`;

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

        // Add category to the response object, as it's not in the schema
        data.category = category;

        return data as HistoricalPlace;
    } catch (error) {
        console.error("Error fetching data from Gemini API:", error);
        throw new Error("Failed to generate historical place from AI. Please try again.");
    }
};
