import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";

export const dynamic = "force-dynamic";

export default async function QuizPickerPage() {
  await connectDB();
  const decks = await Deck.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[38px] font-semibold">Quiz mode</h1>
        <p className="text-muted">Pick a deck to test yourself with multiple-choice questions.</p>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E4DECF] bg-white p-10 text-center">
          <p className="text-muted">You don&apos;t have any decks yet.</p>
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-lg bg-accent px-5 font-semibold text-white hover:bg-[#1F3680]"
          >
            Create your first deck
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {decks.map((deck) => (
            <li key={String(deck._id)}>
              <Link
                href={`/quiz/${deck._id}`}
                className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-[#E4DECF] bg-white px-5 transition-colors hover:border-accent hover:bg-[#EEF1FA]"
              >
                <div>
                  <p className="font-semibold">{deck.title}</p>
                  <p className="text-sm text-muted">
                    {Math.min(deck.cards.length, 20)} questions
                  </p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}