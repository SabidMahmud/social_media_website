import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Product from "@/models/Product";
import Bid from "@/models/Bid";

import BidHistory from "@/components/marketplace/BidHistory";
import BidForm from "@/components/marketplace/BidForm";
import PurchaseButton from "@/components/marketplace/PurchaseButton";
import WishlistButton from "@/components/marketplace/WishlistButton";
import ProductImageGallery from "@/components/marketplace/ProductImageGallery";
import ReviewSellerButton from "@/components/marketplace/ReviewSellerButton";
import connectDB from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import Image from "next/image";

async function getProduct(id: string) {
  await connectDB();

  const product = await Product.findById(id)
    .populate("seller", "firstName lastName profilePicture")
    .populate("buyer", "firstName lastName");

  if (!product) {
    return null;
  }

  const highestBid = await Bid.findOne({ product: id })
    .sort({ amount: -1 })
    .limit(1);

  return {
    ...product.toObject(),
    _id: product._id.toString(),
    seller: {
      ...product.seller.toObject(),
      _id: product.seller._id.toString(),
    },
    buyer: product.buyer
      ? {
          ...product.buyer.toObject(),
          _id: product.buyer._id.toString(),
        }
      : null,
    highestBid: highestBid ? highestBid.amount : null,
  };
}

async function hasUserPurchasedFromSeller(userId: string, sellerId: string) {
  await connectDB();

  const hasPurchased = await Product.findOne({
    seller: sellerId,
    buyer: userId,
    sold: true,
  });

  return !!hasPurchased;
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const isOwner = userId && product.seller._id === userId;
  const isInWishlist = product.wishlistUsers.includes(userId);

  // Check if the current user has purchased from this seller
  let hasPurchased = false;
  if (userId && !isOwner) {
    hasPurchased = await hasUserPurchasedFromSeller(userId, product.seller._id);
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/marketplace" className="hover:underline">
            Marketplace
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link
            href={`/marketplace?category=${product.category}`}
            className="hover:underline"
          >
            {product.category}
          </Link>
        </div>
        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 transition-all hover:bg-secondary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ProductImageGallery images={product.images} title={product.title} />
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{product.category}</Badge>
                {product.isBiddable && (
                  <Badge className="bg-accent text-accent-foreground">
                    Auction
                  </Badge>
                )}
                {product.sold && <Badge variant="destructive">Sold</Badge>}
              </div>
            </div>

            {userId && !isOwner && (
              <WishlistButton
                productId={product._id}
                initialState={isInWishlist}
              />
            )}
          </div>

          <div className="flex items-baseline mb-6">
            <span className="text-3xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.isBiddable && product.highestBid && (
              <span className="ml-2 text-muted-foreground">
                Current bid: ${product.highestBid.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Link href={`/${product.seller._id}`}>
              <div className="flex items-center transition-transform hover:scale-105">
                <div className="w-10 h-10 rounded-full overflow-hidden border mr-2 shadow-sm">
                  {product.seller.profilePicture ? (
                    <Image
                      width={48}
                      height={48}
                      src={product.seller.profilePicture}
                      alt={`${product.seller.firstName} ${product.seller.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-secondary-foreground font-medium">
                        {product.seller.firstName[0]}
                        {product.seller.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {product.seller.firstName} {product.seller.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <Separator className="my-6" />

          {!product.sold ? (
            <>
              {userId &&
                !isOwner &&
                (product.isBiddable ? (
                  <BidForm
                    productId={product._id}
                    currentHighestBid={product.highestBid}
                    basePrice={product.price}
                  />
                ) : (
                  <PurchaseButton productId={product._id} />
                ))}

              {isOwner && (
                <div className="bg-secondary p-4 rounded-lg shadow-sm">
                  <p className="text-center text-muted-foreground">
                    This is your listing. You cannot bid on or purchase your own
                    product.
                  </p>
                </div>
              )}

              {!userId && (
                <div className="bg-secondary p-4 rounded-lg shadow-sm">
                  <p className="text-center text-muted-foreground">
                    Please sign in to{" "}
                    {product.isBiddable ? "place a bid" : "purchase this item"}.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-secondary p-4 rounded-lg shadow-sm">
              <p className="text-center font-medium mb-1">
                This item has been sold
              </p>
              {product.buyer && (
                <p className="text-center text-muted-foreground">
                  Purchased by {product.buyer.firstName}{" "}
                  {product.buyer.lastName}
                </p>
              )}
            </div>
          )}

          {/* Review Seller Button - only show if user is logged in and not the owner */}
          {userId && !isOwner && (
            <ReviewSellerButton
              sellerId={product.seller._id}
              productId={product._id}
              hasPurchased={hasPurchased}
            />
          )}

          {product.isBiddable && (
            <div className="mt-6">
              <BidHistory productId={product._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
