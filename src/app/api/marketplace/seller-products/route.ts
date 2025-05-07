import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Product from "@/models/Product";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sellerId = searchParams.get("sellerId"); // New parameter for seller filtering

    const query: any = {};

    // Only filter for non-sold products by default (for marketplace)
    // But when viewing a seller's products, show all their products
    if (!sellerId) {
      query.sold = false;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (sellerId) {
      query.seller = sellerId;
    }

    const products = await Product.find(query)
      .populate("seller", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    data.seller = session.user.id;

    const product = await Product.create(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
