export type Rating = "again" | "hard" | "good" | "easy";

export function nextInterval(current: number, rating: Rating): number{

    switch(rating) {

        case "again":
            return 0;
        case "hard":
            return Math.max(1, Math.round(current * 1.2));
        case "good":
            return current === 0 ? 1 : Math.round(current * 2.5);
        case "easy":
            return current === 0 ? 4 : Math.round(current * 3.5);
    }
}

export function nextReviewDate(intervalDays: number, from = new Date()): Date {

    const minutes = intervalDays === 0 ? 10 : intervalDays * 24 * 60;

    return new Date(from.getTime() + minutes * 60_000);

}

export function formatInterval(days: number): string {

    if(days === 0) return "10 min";
    if (days === 1) return "1 day";
    return `${days} days`;
}