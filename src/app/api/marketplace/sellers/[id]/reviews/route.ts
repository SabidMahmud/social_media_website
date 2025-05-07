import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import SellerReview from "@/models/SellerReview";
import Product from "@/models/Product";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const reviews = await SellerReview.find({ seller: params.id })
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("product", "title images")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Failed to fetch seller reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { rating, comment, productId } = data;

    // Verify the reviewer has purchased from this seller
    const hasPurchased = await Product.findOne({
      seller: params.id,
      buyer: session.user.id,
      sold: true,
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You can only review sellers you've purchased from" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this seller
    const existingReview = await SellerReview.findOne({
      seller: params.id,
      reviewer: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this seller" },
        { status: 400 }
      );
    }

    const review = await SellerReview.create({
      seller: params.id,
      reviewer: session.user.id,
      rating,
      comment,
      product: productId,
    });

    const populatedReview = await SellerReview.findById(review._id)
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("product", "title images");

    return NextResponse.json(populatedReview, { status: 201 });
  } catch (error) {
    console.error("Failed to create seller review:", error);
    return NextResponse.json(
      { error: "Failed to create seller review" },
      { status: 500 }
    );
  }
}
