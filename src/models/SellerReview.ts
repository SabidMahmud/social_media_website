import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISellerReview extends Document {
  seller: Types.ObjectId;
  reviewer: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  product?: Types.ObjectId;
}

const sellerReviewSchema = new Schema<ISellerReview>(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

// Prevent multiple reviews from the same user for the same seller
sellerReviewSchema.index({ seller: 1, reviewer: 1 }, { unique: true });

const SellerReview =
  mongoose.models.SellerReview ||
  mongoose.model<ISellerReview>("SellerReview", sellerReviewSchema);

export default SellerReview;
