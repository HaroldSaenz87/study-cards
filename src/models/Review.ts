import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema({
  deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true, index: true },
  cardId: { type: Schema.Types.ObjectId, required: true },
  rating: { type: String, enum: ["again", "hard", "good", "easy"], required: true },
  reviewedAt: { type: Date, default: () => new Date(), index: true },
});

export type ReviewDoc = InferSchemaType<typeof reviewSchema>;

const Review = (models.Review as Model<ReviewDoc>) || model<ReviewDoc>("Review", reviewSchema);
export default Review;