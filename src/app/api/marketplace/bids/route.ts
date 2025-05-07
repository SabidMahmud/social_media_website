import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Bid from "@/models/Bid";
import Product from "@/models/Product";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const productId = req.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const bids = await Bid.find({ product: productId })
      .populate("user", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });

    return NextResponse.json(bids);
  } catch (error) {
    console.error("Failed to fetch bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
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

    const data = await req.json();
    const { product: productId, amount } = data;

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user is not the seller
    if (product.seller.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot bid on your own product" },
        { status: 400 }
      );
    }

    // Check if product is biddable
    if (!product.isBiddable) {
      return NextResponse.json(
        { error: "This product does not accept bids" },
        { status: 400 }
      );
    }

    // Check if product is already sold
    if (product.sold) {
      return NextResponse.json(
        { error: "This product has already been sold" },
        { status: 400 }
      );
    }

    // Get highest bid
    const highestBid = await Bid.findOne({ product: productId })
      .sort({ amount: -1 })
      .limit(1);

    // Check if bid amount is higher than the highest bid
    if (highestBid && amount <= highestBid.amount) {
      return NextResponse.json(
        {
          error: `Your bid must be higher than the current highest bid of $${highestBid.amount}`,
        },
        { status: 400 }
      );
    }

    // Check if bid amount is higher than the base price
    if (amount < product.price) {
      return NextResponse.json(
        {
          error: `Your bid must be at least the base price of $${product.price}`,
        },
        { status: 400 }
      );
    }

    // Create new bid
    const newBid = await Bid.create({
      product: productId,
      user: session.user.id,
      amount,
    });

    const populatedBid = await Bid.findById(newBid._id).populate(
      "user",
      "firstName lastName profilePicture"
    );

    return NextResponse.json(populatedBid, { status: 201 });
  } catch (error) {
    console.error("Failed to place bid:", error);
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 });
  }
}
