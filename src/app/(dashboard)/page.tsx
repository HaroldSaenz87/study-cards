import Link from "next/link";
import DeckCard, { type DeckSummary } from "@/components/DeckCard";

import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";
import NewDeckForm from "@/components/NewDeck";

// Always fetch fresh data instead of building this page once at deploy time
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  const decks = await Deck.find().sort({ createdAt: -1 }).lean();
  const now = new Date();

  const summaries: DeckSummary[] = decks.map((deck) => {
    const total = deck.cards.length;
    const due = deck.cards.filter((c) => c.nextReviewDate <= now).length;
    const mastered = deck.cards.filter((c) => c.intervalDays >= 21).length;
    return {
      id: String(deck._id),
      title: deck.title,
      cardCount: total,
      dueCount: due,
      mastery: total ? Math.round((mastered / total) * 100) : 0,
    };
  });

  const totalDue = summaries.reduce((sum, d) => sum + d.dueCount, 0);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[38px] font-semibold">Good evening</h1>
          <p className="text-muted">
            {totalDue > 0
              ? `You have ${totalDue} cards due for review today.`
              : "Nothing due right now. Nice work!"}
          </p>
        </div>
        <Link
          href="/study"
          className="flex min-h-11 items-center rounded-lg bg-ink px-5 font-semibold text-white hover:bg-black"
        >
          Start review
        </Link>
      </header>

      <NewDeckForm />

      <section aria-labelledby="decks-heading" className="flex flex-col gap-4">
        <h2 id="decks-heading" className="font-display text-[22px] font-semibold">
          Your decks
        </h2>
        {summaries.length === 0 ? (
          <p className="rounded-2xl border border-[#E4DECF] bg-white p-8 text-center text-muted">
            No decks yet. Upload a PDF or paste notes above to create your first one.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {summaries.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}