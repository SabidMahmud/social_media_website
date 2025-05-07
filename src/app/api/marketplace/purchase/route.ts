import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Product from "@/models/Product";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/option";

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

    // Check if product is already sold
    if (product.sold) {
      return NextResponse.json(
        { error: "This product has already been sold" },
        { status: 400 }
      );
    }

    // Check if user is not the seller
    if (product.seller.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot buy your own product" },
        { status: 400 }
      );
    }

    // Update product as sold and set buyer
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        sold: true,
        buyer: session.user.id,
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Failed to purchase product:", error);
    return NextResponse.json(
      { error: "Failed to purchase product" },
      { status: 500 }
    );
  }
}
