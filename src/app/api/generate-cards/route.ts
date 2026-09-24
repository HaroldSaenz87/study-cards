import { GoogleGenAI, type Part } from "@google/genai";

import { NextResponse } from "next/server";

const ai = new GoogleGenAI ({ apiKey: process.env.GEMINI_API_KEY });

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request){
    
    try{
        
        const form = await req.formData();
        const notes = (form.get("notes") as string | null) ?? "";
        const count = Number(form.get("count") ?? 10);
        const file = form.get("file") as File | null;

        if(!notes.trim() && !file){
            return NextResponse.json({ error: "Add notes or a PDF."}, { status: 400 });
        }

        if(file && (file.type !== "application/pdf" || file.size > MAX_FILE_SIZE)){
            return NextResponse.json({ error: "Please upload a PDF  under 10 MB."}, { status: 400 });

        }

        const parts: Part[] = [
            {
                text: ` Create ${count} flashcards from the study material provided. Return JSON only: [{"question": "...", "answer": "..."}] Keep answers short and accurate. ${notes.trim() ? `\n\nNotes:\n${notes}` : ""}`,

            },
        ];

        if (file) {
            
            const data = Buffer.from(await file.arrayBuffer()).toString("base64");
            parts.push({ inlineData: { mimeType: "application/pdf", data } });

        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
            config: { responseMimeType: "applation/json" },

        });

        return NextResponse.json(JSON.parse(response.text ?? "[]"));

    }
    catch(err){
        console.error(err);
        return NextResponse.json({ error: "Couldn't generate cards. Try again." }, { status: 500 });
    }
}
