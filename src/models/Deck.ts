import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
import { title } from "process";

const cardSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    intervalDays: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: () => new Date() },
});

const deckSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        cards: { type: [cardSchema], default: [] },
    },
    { timestamps: true }

);

export type DeckDoc = InferSchemaType<typeof deckSchema>;

const Deck = (models.Deck as Model<DeckDoc>) || model<DeckDoc>("Deck", deckSchema);

export default Deck;