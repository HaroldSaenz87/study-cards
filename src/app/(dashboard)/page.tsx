import Link from "next/link";
import DeckCard, {type DeckSummary} from "@/components/DeckCard";
import NewDeck from "@/components/NewDeck";

//temp data
const sampleDecks: DeckSummary[] = [
  { id: "bio", title: "Biology: Cell Structure", cardCount: 24, dueCount: 8, mastery: 62 },
  { id: "python", title: "Intro to Python", cardCount: 30, dueCount: 10, mastery: 38 },
  { id: "history", title: "US History: 1900s", cardCount: 15, dueCount: 0, mastery: 90 },
];


export default function Home() {

  const totalDue = sampleDecks.reduce((sum, deck) => sum + deck.dueCount, 0);

  return (

    <div className="flex flex-col gap-7">

      <header className="flex items-end justify-between">
        
        <div className="flex flex-col gap-1.5">
          
          <h1 className="font-display text-[38px] font-semibold">Good evening</h1>
          
          <p className="text-muted">You have {totalDue} cards due for review today.</p>
        
        </div>
        
        <Link
          href="/study"
          className="flex min-h-11 items-center rounded-lg bg-ink px-5 font-semibold text-white hover:bg-black"
        >
          Start review
        </Link>

      </header>

      <NewDeck />

      <section aria-labelledby="decks-heading" className="flex flex-col gap-4">
        
        <h2 id="decks-heading" className="font-display text-[22px] font-semibold">
          Your decks
        </h2>
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          
          {sampleDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        
        </div>

      </section>
    
    </div>
    
  );
}
