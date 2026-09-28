"use server";
import Review from "@/models/Review";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Deck from "@/models/Deck";
import { nextInterval, nextReviewDate, type Rating } from "@/lib/schedule";

const RATINGS: Rating[] = ["again", "hard", "good", "easy"];

export async function reviewCard(deckId: string, cardId: string, rating: Rating){

    if (!isValidObjectId(deckId) || !isValidObjectId(cardId) || !RATINGS.includes(rating)){
        
        throw new Error("Invalid review");

    }

    await connectDB();

    const deck = await Deck.findOne(
        {_id: deckId, "cards._id": cardId },
        { "cards.$": 1 }

    ).lean();

    const card = deck?.cards[0];
    if(!card) throw new Error("Card not found");

    const intervalDays = nextInterval(card.intervalDays, rating);

    await Deck.updateOne(
        {_id: deckId, "cards._id":cardId},
        {
            $set: {
                "cards.$.intervalDays": intervalDays,
                "cards.$.nextReviewDate": nextReviewDate(intervalDays),
            },
        }
    );

    await Review.create({ deckId, cardId, rating });
}

