import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import Product from "@/models/Product";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await Product.find({
      wishlistUsers: session.user.id,
    }).populate("seller", "firstName lastName profilePicture");

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is already in wishlist
    const isInWishlist = product.wishlistUsers.includes(session.user.id);

    let updatedProduct;

    if (isInWishlist) {
      // Remove from wishlist
      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $pull: { wishlistUsers: session.user.id } },
        { new: true }
      );
    } else {
      // Add to wishlist
      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $addToSet: { wishlistUsers: session.user.id } },
        { new: true }
      );
    }

    return NextResponse.json({
      inWishlist: !isInWishlist,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Failed to update wishlist:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
