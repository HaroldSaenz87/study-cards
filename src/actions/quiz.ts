"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { ai, MODEL } from "@/lib/gemini";
import Deck from "@/models/Deck";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

const MAX_QUESTIONS = 20;

// Shuffle options ourselves, because AI models tend to put the right answer first
function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const correct = q.options[q.correctIndex];
  const options = [...q.options];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { question: q.question, options, correctIndex: options.indexOf(correct) };
}

export async function generateQuiz(deckId: string): Promise<QuizQuestion[]> {
  if (!isValidObjectId(deckId)) throw new Error("Invalid deck");

  await connectDB();
  const deck = await Deck.findById(deckId).lean();
  if (!deck || deck.cards.length === 0) throw new Error("Deck not found");

  const cards = deck.cards
    .slice(0, MAX_QUESTIONS)
    .map((c) => ({ question: c.question, answer: c.answer }));

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Turn these flashcards into a multiple-choice quiz, one question per card.
Each question has exactly 4 options: the correct answer plus 3 plausible but clearly wrong distractors.
Keep all options similar in length and style so the answer isn't obvious.
Return JSON only: [{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0}]

FLASHCARDS:
${JSON.stringify(cards)}`,
    config: { responseMimeType: "application/json" },
  });

  const raw = JSON.parse(response.text ?? "[]") as QuizQuestion[];

  // Keep only well-formed questions
  const quiz = raw
    .filter(
      (q) =>
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < 4
    )
    .map(shuffleOptions);

  if (quiz.length === 0) throw new Error("Quiz generation failed");
  return quiz;
}

export async function explainAnswer(question: string, correct: string, chosen: string) {
  const inputs = [question, correct, chosen];
  if (inputs.some((s) => typeof s !== "string" || s.length > 500)) {
    throw new Error("Invalid input");
  }

  const gotItRight = chosen === correct;
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `A student answered a quiz question.
Question: ${question}
Correct answer: ${correct}
Student's answer: ${chosen}

In 2–3 short sentences, explain why the correct answer is right${
      gotItRight ? "" : " and why the student's answer is wrong"
    }. Use simple, encouraging language.`,
  });

  return response.text ?? "";
}