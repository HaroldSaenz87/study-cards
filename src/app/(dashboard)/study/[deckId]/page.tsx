import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";
import StudySession, { type StudyCard } from "@/components/StudySession";

export const dynamic = "force-dynamic";

export default async function StudyDeckPage({ params }: PageProps<"/study/[deckId]">) {
  const { deckId } = await params;
  if (!isValidObjectId(deckId)) notFound();

  await connectDB();
  const deck = await Deck.findById(deckId).lean();
  if (!deck) notFound();

  const now = new Date();
  const dueCards: StudyCard[] = deck.cards
    .filter((card) => card._id && card.nextReviewDate <= now)
    .map((card) => ({
      id: String(card._id),
      deckId: String(deck._id),
      deckTitle: deck.title,
      question: card.question,
      answer: card.answer,
      intervalDays: card.intervalDays,
    }));

  return <StudySession deckId={deckId} title={deck.title} cards={dueCards} />;
}