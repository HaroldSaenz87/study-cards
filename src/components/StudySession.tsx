"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { reviewCard } from "@/actions/review";
import { nextInterval, formatInterval, type Rating } from "@/lib/schedule";

export type StudyCard = {
  id: string;
  deckId: string; // ← NEW (1)
  deckTitle: string; // ← NEW (1)
  question: string;
  answer: string;
  intervalDays: number;
};

const ratingButtons: { value: Rating; label: string; className: string }[] = [
  { value: "again", label: "Again", className: "bg-[#F6DDD7] text-[#7A2515] hover:bg-[#F0CBC2]" },
  { value: "hard", label: "Hard", className: "bg-due text-[#6B4506] hover:bg-[#F6D9A6]" },
  { value: "good", label: "Good", className: "bg-[#E3EBDD] text-[#2F5220] hover:bg-[#D3E0CA]" },
  { value: "easy", label: "Easy", className: "bg-[#DDE4F5] text-[#1F3680] hover:bg-[#CBD6F0]" },
];

// deckId is only passed when studying a single deck
type Props = { deckId?: string; title: string; cards: StudyCard[] };

export default function StudySession({ deckId, title, cards }: Props) {
  const [queue, setQueue] = useState(cards);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const card = queue[0];
  const total = reviewed + queue.length;
  const progress = total ? Math.round((reviewed / total) * 100) : 100;

  function rate(rating: Rating) {
    if (!card) return;
    setError(null);

    startTransition(async () => {
      try {
        await reviewCard(card.deckId, card.id, rating); // ← FIXED (2)
        setReviewed((n) => n + 1);
        setRevealed(false);
        // "Again" sends the card to the back of the line for this session
        setQueue((q) =>
          rating === "again" ? [...q.slice(1), { ...q[0], intervalDays: 0 }] : q.slice(1)
        );
      } catch {
        setError("Couldn't save that rating. Try again.");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft size={16} aria-hidden /> Dashboard
        </Link>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-[32px] font-semibold">{title}</h1>
          {card && (
            <span className="shrink-0 text-sm text-muted">
              {reviewed} / {total} reviewed
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Session progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 rounded bg-[#ECE7DA]"
        >
          <div className="h-2 rounded bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {card ? (
        <>
          <div className="flex min-h-72 flex-col justify-center gap-6 rounded-2xl border border-[#E4DECF] bg-white p-10 text-center">
            {/* NEW (3): show the deck name when reviewing across decks */}
            {!deckId && (
              <span className="mx-auto w-fit rounded-full bg-[#F1EDE3] px-3 py-1 text-xs font-semibold text-muted">
                {card.deckTitle}
              </span>
            )}
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Question</p>
            <p className="font-display text-2xl font-semibold">{card.question}</p>
            {revealed && (
              <>
                <hr className="border-[#E4DECF]" />
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">Answer</p>
                <p className="text-xl">{card.answer}</p>
              </>
            )}
          </div>

          {revealed ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => rate(btn.value)}
                  disabled={isPending}
                  className={`flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${btn.className}`}
                >
                  {btn.label}
                  <span className="text-xs font-normal">
                    {formatInterval(nextInterval(card.intervalDays, btn.value))}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="min-h-12 cursor-pointer rounded-lg bg-ink font-semibold text-white hover:bg-black"
            >
              Show answer
            </button>
          )}

          {error && (
            <p role="alert" className="text-center text-sm font-semibold text-[#A3321F]">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E4DECF] bg-white p-10 text-center">
          <p className="font-display text-2xl font-semibold">
            {reviewed > 0 ? "Session complete!" : "Nothing due right now"}
          </p>
          <p className="text-muted">
            {reviewed > 0
              ? `You reviewed ${reviewed} cards. They'll come back when they're due.`
              : deckId
                ? "All cards in this deck are scheduled for later. You can still quiz yourself."
                : "You're all caught up across every deck. Come back later or create a new deck."}
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex min-h-11 items-center rounded-lg bg-ink px-5 font-semibold text-white hover:bg-black"
            >
              Back to dashboard
            </Link>
            {/* FIXED (4): only link to a quiz when studying one deck */}
            {deckId && (
              <Link
                href={`/quiz/${deckId}`}
                className="flex min-h-11 items-center rounded-lg bg-[#F1EDE3] px-5 font-semibold hover:bg-[#E8E2D4]"
              >
                Take quiz
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}