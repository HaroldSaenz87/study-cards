import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";
import QuizSession from "@/components/QuizSession";

export const dynamic = "force-dynamic";

export default async function QuizDeckPage({ params }: PageProps<"/quiz/[deckId]">) {
  const { deckId } = await params;
  if (!isValidObjectId(deckId)) notFound();

  await connectDB();
  const deck = await Deck.findById(deckId).lean();
  if (!deck) notFound();

  return (
    <QuizSession
      deckId={deckId}
      title={deck.title}
      cardCount={Math.min(deck.cards.length, 20)}
    />
  );
}