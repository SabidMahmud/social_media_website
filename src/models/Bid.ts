import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBid extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const bidSchema = new Schema<IBid>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Bid = mongoose.models.Bid || mongoose.model<IBid>("Bid", bidSchema);

export default Bid;
