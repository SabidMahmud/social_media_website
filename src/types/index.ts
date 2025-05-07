export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id?: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  seller: string | User;
  isBiddable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  sold: boolean;
  buyer?: string | User;
  wishlistUsers?: string[] | User[];
}

export interface Bid {
  _id?: string;
  product: string | Product;
  user: string | User;
  amount: number;
  createdAt?: Date;
}

export type ProductCategory =
  | "Electronics"
  | "Clothing"
  | "Home & Garden"
  | "Books"
  | "Toys & Games"
  | "Sports"
  | "Automotive"
  | "Jewelry"
  | "Art"
  | "Other";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Books",
  "Toys & Games",
  "Sports",
  "Automotive",
  "Jewelry",
  "Art",
  "Other",
];
