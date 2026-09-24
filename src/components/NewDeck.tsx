"use client";

import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";

type Flashcard = { question: string; answer: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function NewDeckForm() {
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState("10");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);

  // Shared by both drag-and-drop and "browse files"
  function pickFile(picked: File | undefined) {
    if (!picked) return;
    if (picked.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (picked.size > MAX_FILE_SIZE) {
      setError("That PDF is over 10 MB.");
      return;
    }
    setError(null);
    setFile(picked);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault(); // stop the browser from opening the PDF
    setIsDragging(false);
    pickFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!notes.trim() && !file) {
      setError("Add a PDF or paste some notes first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("notes", notes);
      formData.append("count", count);
      if (file) formData.append("file", file);

      const res = await fetch("/api/generate-cards", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="new-deck-heading"
      className="rounded-2xl border border-[#E4DECF] bg-white p-7"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h2 id="new-deck-heading" className="font-display text-[22px] font-semibold">
          Create a new deck
        </h2>

        {/* Drop zone, or the chosen file */}
        {file ? (
          <div className="flex min-h-40 items-center justify-between gap-4 rounded-xl border-2 border-accent bg-[#EEF1FA] px-6">
            <div className="flex min-w-0 items-center gap-3">
              <FileText size={28} className="shrink-0 text-accent" aria-hidden />
              <div className="min-w-0">
                <p className="truncate font-semibold">{file.name}</p>
                <p className="text-sm text-muted">
                  {(file.size / 1024 / 1024).toFixed(1)} MB · ready to generate
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label="Remove PDF"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-white"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              // Ignore "leaving" into a child element inside the zone
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 text-center transition-colors focus-within:outline-2 focus-within:outline-accent ${
              isDragging
                ? "border-accent bg-[#EEF1FA]"
                : "border-[#B9B3A3] bg-[#FBFAF6] hover:border-accent"
            }`}
          >
            <Upload size={28} className="text-accent" aria-hidden />
            <span className="text-lg font-semibold">
              {isDragging ? "Drop it here" : "Drag a PDF here"}
            </span>
            <span className="text-sm text-muted">
              or <span className="font-semibold text-accent underline">browse files</span> · up to 10 MB
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </label>
        )}

        {/* Paste notes */}
        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-base font-semibold text-muted">
            or you can paste notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes here…"
            className="h-20 resize-none rounded-lg border border-[#D8D2C2] bg-[#FBFAF6] p-3.5 focus:outline-2 focus:outline-accent"
          />
        </div>

        {/* Count + Generate */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="count" className="text-base font-semibold text-muted">
              Cards
            </label>
            <select
              id="count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="min-h-11 rounded-lg border border-[#D8D2C2] bg-white px-3 cursor-pointer"
            >
              <option>10</option>
              <option>20</option>
              <option>30</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-white hover:bg-[#1F3680] disabled:cursor-wait disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Generating…" : "Generate flashcards"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-[#A3321F]">
          {error}
        </p>
      )}

      {cards.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <p className="font-semibold">Generated {cards.length} cards:</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {cards.map((card, i) => (
              <li key={i} className="rounded-lg bg-[#FBFAF6] p-4">
                <p className="font-semibold">{card.question}</p>
                <p className="mt-1 text-sm text-muted">{card.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}