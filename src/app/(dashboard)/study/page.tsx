import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";
import StudySession, { type StudyCard } from "@/components/StudySession";

export const dynamic = "force-dynamic";

const MAX_CARDS = 50; // keep sessions a reasonable length

export default async function ReviewAllPage() {
  await connectDB();
  const now = new Date();

  // Only fetch decks that have at least one due card
  const decks = await Deck.find({ "cards.nextReviewDate": { $lte: now } }).lean();

  // Gather every due card from every deck
  const due = decks.flatMap((deck) =>
    deck.cards
      .filter((card) => card._id && card.nextReviewDate <= now)
      .map((card) => ({ deck, card }))
  );

  // Most overdue first
  due.sort((a, b) => a.card.nextReviewDate.getTime() - b.card.nextReviewDate.getTime());

  const dueCards: StudyCard[] = due.slice(0, MAX_CARDS).map(({ deck, card }) => ({
    id: String(card._id),
    deckId: String(deck._id),
    deckTitle: deck.title,
    question: card.question,
    answer: card.answer,
    intervalDays: card.intervalDays,
  }));

  return <StudySession title="Review all decks" cards={dueCards} />;
}