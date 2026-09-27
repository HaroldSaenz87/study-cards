"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, X } from "lucide-react";
import { generateQuiz, explainAnswer, type QuizQuestion } from "@/actions/quiz";

const LETTERS = ["A", "B", "C", "D"];

type Props = { deckId: string; title: string; cardCount: number };

export default function QuizSession({ deckId, title, cardCount }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, startQuiz] = useTransition();
  const [isExplaining, startExplain] = useTransition();

  const current = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  function begin() {
    setError(null);
    startQuiz(async () => {
      try {
        const quiz = await generateQuiz(deckId);
        setQuestions(quiz);
        setIndex(0);
        setScore(0);
        setSelected(null);
        setExplanation(null);
        setFinished(false);
      } catch {
        setError("Couldn't build the quiz. Try again.");
      }
    });
  }

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === current.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setExplanation(null);
  }

  function explain() {
    if (!current || selected === null) return;
    startExplain(async () => {
      try {
        const text = await explainAnswer(
          current.question,
          current.options[current.correctIndex],
          current.options[selected]
        );
        setExplanation(text);
      } catch {
        setExplanation("Couldn't load an explanation right now.");
      }
    });
  }

  function optionStyle(i: number) {
    if (!answered) return "border-[#D8D2C2] bg-white hover:border-accent hover:bg-[#EEF1FA] cursor-pointer";
    if (i === current.correctIndex) return "border-[#3E7A2A] bg-[#E3EBDD]";
    if (i === selected) return "border-[#A3321F] bg-[#F6DDD7]";
    return "border-[#E4DECF] bg-white opacity-60";
  }

  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;

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
          {current && !finished && (
            <span className="shrink-0 text-sm text-muted">
              Question {index + 1} of {questions.length} · Score {score}
            </span>
          )}
        </div>
      </div>

      {/* Start screen */}
      {questions.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E4DECF] bg-white p-10 text-center">
          <p className="font-display text-2xl font-semibold">Ready to test yourself?</p>
          <p className="text-muted">
            A {cardCount}-question multiple-choice quiz built from this deck. It won&apos;t
            change your review schedule.
          </p>
          <button
            type="button"
            onClick={begin}
            disabled={isStarting}
            className="min-h-12 cursor-pointer rounded-lg bg-accent px-6 font-semibold text-white hover:bg-[#1F3680] disabled:cursor-wait disabled:opacity-70"
          >
            {isStarting ? "Building your quiz…" : "Start quiz"}
          </button>
          {error && (
            <p role="alert" className="text-sm font-semibold text-[#A3321F]">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Question */}
      {current && !finished && (
        <>
          <div className="rounded-2xl border border-[#E4DECF] bg-white p-8">
            <p className="font-display text-2xl font-semibold">{current.question}</p>
          </div>

          <div className="flex flex-col gap-3">
            {current.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 text-left transition-colors ${optionStyle(i)}`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F1EDE3] text-sm font-semibold">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{option}</span>
                {answered && i === current.correctIndex && (
                  <Check size={20} className="text-[#3E7A2A]" aria-label="Correct answer" />
                )}
                {answered && i === selected && i !== current.correctIndex && (
                  <X size={20} className="text-[#A3321F]" aria-label="Your answer" />
                )}
              </button>
            ))}
          </div>

          <div aria-live="polite">
            {answered && (
              <div className="flex flex-col gap-4">
                <p className="font-semibold">
                  {selected === current.correctIndex ? "Correct!" : "Not quite."}
                </p>

                {explanation ? (
                  <div className="flex gap-3 rounded-lg bg-[#EEF1FA] p-4">
                    <Sparkles size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    <p>{explanation}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={explain}
                    disabled={isExplaining}
                    className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-accent px-4 font-semibold text-accent hover:bg-[#EEF1FA] disabled:cursor-wait disabled:opacity-70"
                  >
                    <Sparkles size={18} aria-hidden />
                    {isExplaining ? "Thinking…" : "Explain this answer"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={next}
                  className="min-h-12 cursor-pointer rounded-lg bg-ink font-semibold text-white hover:bg-black"
                >
                  {isLast ? "See results" : "Next question"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Results */}
      {finished && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E4DECF] bg-white p-10 text-center">
          <p className="font-display text-5xl font-semibold">{percent}%</p>
          <p className="text-lg">
            You got {score} of {questions.length} right.
          </p>
          <p className="text-muted">
            {percent >= 80
              ? "Great work. You know this material well."
              : percent >= 50
                ? "Solid start. A study session will help lock it in."
                : "Worth another study session before trying again."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={begin}
              disabled={isStarting}
              className="min-h-11 cursor-pointer rounded-lg bg-accent px-5 font-semibold text-white hover:bg-[#1F3680] disabled:cursor-wait disabled:opacity-70"
            >
              {isStarting ? "Building…" : "New quiz"}
            </button>
            <Link
              href={`/study/${deckId}`}
              className="flex min-h-11 items-center rounded-lg bg-[#F1EDE3] px-5 font-semibold hover:bg-[#E8E2D4]"
            >
              Study this deck
            </Link>
            <Link
              href="/"
              className="flex min-h-11 items-center rounded-lg bg-[#F1EDE3] px-5 font-semibold hover:bg-[#E8E2D4]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}