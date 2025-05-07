import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  images: string[]; // URLs
  category: string;
  price: number;
  seller: Types.ObjectId; // Refers to User
  isBiddable: boolean;
  createdAt: Date;
  updatedAt: Date;
  sold: boolean;
  buyer?: Types.ObjectId; // Refers to User
  wishlistUsers: Types.ObjectId[]; // Users who saved the product
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    price: { type: Number, required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isBiddable: { type: Boolean, default: false },
    sold: { type: Boolean, default: false },
    buyer: { type: Schema.Types.ObjectId, ref: "User" },
    wishlistUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
