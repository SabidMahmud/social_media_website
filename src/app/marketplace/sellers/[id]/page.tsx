import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft, Star, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import User from "@/models/User";
import Product from "@/models/Product";
import SellerReview from "@/models/SellerReview";

import SellerProductGrid from "@/components/marketplace/SellerProductGrid";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import connectDB from "@/lib/dbConnect";
import SellerReviews from "@/components/marketplace/SellerReviews";
import SellerStats from "@/components/marketplace/SellerStats";

async function getSellerData(id: string) {
  await connectDB();

  const seller = await User.findById(id).select(
    "firstName lastName profilePicture bio"
  );

  if (!seller) {
    return null;
  }

  // Get seller statistics
  const totalProducts = await Product.countDocuments({ seller: id });
  const soldProducts = await Product.countDocuments({ seller: id, sold: true });

  // Get average rating
  const reviews = await SellerReview.find({ seller: id });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    ...seller.toObject(),
    _id: seller._id.toString(),
    stats: {
      totalProducts,
      soldProducts,
      totalReviews: reviews.length,
      averageRating,
    },
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

export default async function SellerPage({
  params,
}: {
  params: { id: string };
}) {
  const seller = await getSellerData(params.id);

  if (!seller) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Check if the current user can review this seller (has purchased from them)
  let canReview = false;
  if (userId && userId !== seller._id) {
    canReview = await hasUserPurchasedFromSeller(userId, seller._id);
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="mb-6">
        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className="transition-all hover:bg-secondary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow-md">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={seller.profilePicture} />
                <AvatarFallback>
                  {seller.firstName[0]}
                  {seller.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl font-bold mb-2">
                {seller.firstName} {seller.lastName}
              </h1>

              <div className="flex items-center gap-1 text-muted-foreground mb-4">
                <Store className="h-4 w-4" />
                <span>Seller</span>
              </div>

              {seller.bio && (
                <p className="text-muted-foreground">{seller.bio}</p>
              )}

              <div className="flex items-center gap-1 mt-4">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {seller.stats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({seller.stats.totalReviews} reviews)
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <SellerStats stats={seller.stats} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Products by {seller.firstName}
            </h2>
            <SellerProductGrid sellerId={seller._id} />
          </div>

          <div id="reviews">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <SellerReviews
              sellerId={seller._id}
              isCurrentUser={session?.user?.id === seller._id}
              canReview={canReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
