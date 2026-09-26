import { GoogleGenAI, type Part } from "@google/genai";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

type GeneratedDeck = {
  title: string;
  cards: { question: string; answer: string }[];
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const notes = (form.get("notes") as string | null) ?? "";
    const count = Number(form.get("count") ?? 10);
    const file = form.get("file") as File | null;

    if (!notes.trim() && !file) {
      return NextResponse.json({ error: "Add notes or a PDF." }, { status: 400 });
    }
    if (file && (file.type !== "application/pdf" || file.size > MAX_FILE_SIZE)) {
      return NextResponse.json({ error: "Please upload a PDF under 10 MB." }, { status: 400 });
    }

    const parts: Part[] = [
      {
        text: `Create ${count} flashcards from the study material provided.
Also write a short deck title (under 6 words) describing the topic.
Return JSON only: {"title": "...", "cards": [{"question": "...", "answer": "..."}]}
Keep answers short and accurate.${notes.trim() ? `\n\nNOTES:\n${notes}` : ""}`,
      },
    ];

    if (file) {
      const data = Buffer.from(await file.arrayBuffer()).toString("base64");
      parts.push({ inlineData: { mimeType: "application/pdf", data } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json" },
    });

    const generated = JSON.parse(response.text ?? "{}") as GeneratedDeck;
    if (!generated.title || !Array.isArray(generated.cards) || generated.cards.length === 0) {
      throw new Error("Gemini returned an unexpected format");
    }

    await connectDB();
    const deck = await Deck.create({ title: generated.title, cards: generated.cards });

    return NextResponse.json({
      id: String(deck._id),
      title: deck.title,
      cardCount: deck.cards.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Couldn't generate cards. Try again." }, { status: 500 });
  }
}