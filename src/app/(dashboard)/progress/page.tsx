import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

const TIMEZONE = "America/New_York";
const CHART_DAYS = 14;
const HISTORY_DAYS = 90; // how far back to look when counting the streak
const DAY_MS = 24 * 60 * 60 * 1000;

// Formats a date as "2026-09-28" in your timezone
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE });

export default async function ProgressPage() {
  await connectDB();
  const now = new Date();

  // Reviews per day, grouped by MongoDB
  const daily = await Review.aggregate<{ _id: string; count: number; correct: number }>([
    { $match: { reviewedAt: { $gte: new Date(now.getTime() - HISTORY_DAYS * DAY_MS) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$reviewedAt", timezone: TIMEZONE } },
        count: { $sum: 1 },
        correct: { $sum: { $cond: [{ $in: ["$rating", ["good", "easy"]] }, 1, 0] } },
      },
    },
  ]);
  const byDay = new Map(daily.map((d) => [d._id, d]));

  // Last 14 days for the chart, oldest first (days with no reviews show as 0)
  const chart = Array.from({ length: CHART_DAYS }, (_, i) => {
    const date = new Date(now.getTime() - (CHART_DAYS - 1 - i) * DAY_MS);
    const key = dayKey.format(date);
    return {
      key,
      label: date.toLocaleDateString("en-US", { timeZone: TIMEZONE, month: "numeric", day: "numeric" }),
      count: byDay.get(key)?.count ?? 0,
    };
  });
  const maxCount = Math.max(1, ...chart.map((d) => d.count));

  // Last 7 days totals
  const week = chart.slice(-7);
  const weekReviews = week.reduce((sum, d) => sum + d.count, 0);
  const weekCorrect = week.reduce((sum, d) => sum + (byDay.get(d.key)?.correct ?? 0), 0);
  const accuracy = weekReviews ? Math.round((weekCorrect / weekReviews) * 100) : 0;

  // Streak: consecutive days with reviews, counting back from today
  // (if you haven't studied yet today, it counts from yesterday)
  let streak = 0;
  for (let i = byDay.has(dayKey.format(now)) ? 0 : 1; i < HISTORY_DAYS; i++) {
    if (!byDay.has(dayKey.format(new Date(now.getTime() - i * DAY_MS)))) break;
    streak++;
  }

  // Mastery per deck and overall
  const decks = await Deck.find().sort({ createdAt: -1 }).lean();
  const deckStats = decks.map((deck) => {
    const total = deck.cards.length;
    const mastered = deck.cards.filter((c) => c.intervalDays >= 21).length;
    return {
      id: String(deck._id),
      title: deck.title,
      total,
      mastered,
      percent: total ? Math.round((mastered / total) * 100) : 0,
    };
  });
  const totalCards = deckStats.reduce((sum, d) => sum + d.total, 0);
  const totalMastered = deckStats.reduce((sum, d) => sum + d.mastered, 0);
  const overallMastery = totalCards ? Math.round((totalMastered / totalCards) * 100) : 0;

  const stats = [
    { label: "Reviews this week", value: String(weekReviews) },
    { label: "Accuracy this week", value: weekReviews ? `${accuracy}%` : "–" },
    { label: "Current streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
    { label: "Cards mastered", value: `${totalMastered} / ${totalCards}` },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[38px] font-semibold">Progress</h1>
        <p className="text-muted">
          {overallMastery}% of your cards are mastered (reviewed well enough to be scheduled 3+ weeks out).
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E4DECF] bg-white p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Reviews per day chart */}
      <section
        aria-labelledby="chart-heading"
        className="rounded-2xl border border-[#E4DECF] bg-white p-6"
      >
        <h2 id="chart-heading" className="font-display text-[22px] font-semibold">
          Reviews, last 14 days
        </h2>
        <div className="mt-6 flex h-48 items-end gap-2">
          {chart.map((day) => (
            <div key={day.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              {day.count > 0 && <span className="text-xs text-muted">{day.count}</span>}
              <div
                className={`w-full rounded-t ${day.count > 0 ? "bg-accent" : "bg-[#ECE7DA]"}`}
                style={{ height: day.count > 0 ? `${(day.count / maxCount) * 100}%` : "4px" }}
                aria-label={`${day.label}: ${day.count} reviews`}
                role="img"
              />
              <span className="text-[11px] text-muted">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mastery by deck */}
      <section
        aria-labelledby="mastery-heading"
        className="rounded-2xl border border-[#E4DECF] bg-white p-6"
      >
        <h2 id="mastery-heading" className="font-display text-[22px] font-semibold">
          Mastery by deck
        </h2>
        {deckStats.length === 0 ? (
          <p className="mt-4 text-muted">No decks yet.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-5">
            {deckStats.map((deck) => (
              <li key={deck.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold">{deck.title}</span>
                  <span className="shrink-0 text-sm text-muted">
                    {deck.mastered} / {deck.total} cards · {deck.percent}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${deck.title} mastery`}
                  aria-valuenow={deck.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2.5 rounded bg-[#ECE7DA]"
                >
                  <div className="h-2.5 rounded bg-accent" style={{ width: `${deck.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}