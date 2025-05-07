"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment must not exceed 500 characters"),
});

interface SellerReviewsProps {
  sellerId: string;
  isCurrentUser: boolean;
  canReview: boolean;
}

export default function SellerReviews({
  sellerId,
  isCurrentUser,
  canReview,
}: SellerReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingReview, setExistingReview] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `/api/marketplace/sellers/${sellerId}/reviews`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);

        // Check if current user has already reviewed this seller
        const hasExistingReview = data.reviews.some(
          (review: any) => review.reviewer?._id === sellerId
        );
        setExistingReview(hasExistingReview);
      } catch (error) {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [sellerId]);

  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/marketplace/sellers/${sellerId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      const newReview = await response.json();

      setReviews([newReview, ...reviews]);
      setTotalReviews(totalReviews + 1);
      setExistingReview(true);

      // Update average rating
      const newTotalRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) + values.rating;
      setAverageRating(newTotalRating / (totalReviews + 1));

      form.reset();
      setSelectedRating(0);

      toast.success("Your review has been posted successfully.");

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-sm text-muted-foreground mt-1">
                Based on {totalReviews} reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isCurrentUser && canReview && !existingReview && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => {
                                setSelectedRating(star);
                                field.onChange(star);
                              }}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-8 w-8 transition-colors ${
                                  star <= selectedRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted hover:fill-yellow-200 hover:text-yellow-200"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Share your experience with this seller..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {!isCurrentUser && !canReview && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to purchase a product from this seller before you can leave
            a review.
          </AlertDescription>
        </Alert>
      )}

      {!isCurrentUser && canReview && existingReview && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have already submitted a review for this seller.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {reviews.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No reviews yet for this seller.
              </p>
            </CardContent>
          </Card>
        )}

        {reviews.map((review) => (
          <Card key={review._id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.reviewer.profilePicture} />
                    <AvatarFallback>
                      {review.reviewer.firstName[0]}
                      {review.reviewer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>

              <p className="mt-4">{review.comment}</p>

              {review.product && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="h-16 w-16 relative rounded overflow-hidden">
                    <Image
                      width={100}
                      height={100}
                      src={review.product.images[0]}
                      alt={review.product.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Purchased Item</p>
                    <p className="text-sm text-muted-foreground">
                      {review.product.title}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
