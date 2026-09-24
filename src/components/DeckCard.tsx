import Link from "next/link";

export type DeckSummary = {
    id: string;
    title: string;
    cardCount: number;
    dueCount: number;
    mastery: number;

};

export default function DeckCard({ deck }: {deck: DeckSummary }) {

    const caughtUp = deck.dueCount === 0;
    
    return (
        <article className="flex flex-col gap-3.5 rounded-2xl border border-[#E4DECF] bg-white p-5.5">

            <div className="flex items-center justify-between">

                <span className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${caughtUp ? "bg-[#E3EBDD] text-[32F5220]" : "bg-due text-[#6B4506]"}`}>

                    {caughtUp ? "All caught up" : `${deck.dueCount} due`}

                </span>

                <span className="text-[13px] text-muted">
                    {deck.cardCount} cards
                </span>

            </div>

            <h3 className="text-[19px] font-semibold">{deck.title}</h3>

            <div
                role="progressbar"
                aria-label={`${deck.title} mastery`}
                aria-valuenow={deck.mastery}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 rounded bg-[#ECE7DA]"
            >

                <div className="h-2 rounded bg-accent" style={{ width: `${deck.mastery}%` }} />


            </div>

            <p className="text-[13px] text-muted">
                
                {deck.mastery}%

            </p>

            <Link
                href={caughtUp ? `/quiz/${deck.id}` : `/study/${deck.id}`}
                className="flex min-h-11 items-center justify-center rounded-lg bg-[#F1EDE3] font-semibold text-ink transition-colors hover:bg-[#E8E2D4]"
            >
                {caughtUp ? "Take quiz" : "Study"}
            </Link>

        </article>

    );

}
