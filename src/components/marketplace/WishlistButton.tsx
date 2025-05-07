"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  initialState: boolean;
}

export default function WishlistButton({
  productId,
  initialState,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWishlist = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/marketplace/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }

      const { inWishlist } = await response.json();
      setIsInWishlist(inWishlist);

      if (inWishlist) {
        toast.success("Product has been added to your wishlist");
      } else {
        toast.error("Product has been removed from your wishlist");
      }
      // toast(inWishlist ? 'Product has been added to your wishlist' : 'Product has been removed from your wishlist');
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex-shrink-0 transition-all hover:bg-secondary/80"
      onClick={handleToggleWishlist}
      disabled={isLoading}
    >
      <Heart
        className={`h-6 w-6 transition-all duration-300 ${
          isInWishlist ? "fill-red-500 text-red-500 scale-110" : "scale-100"
        }`}
      />
      <span className="sr-only">
        {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      </span>
    </Button>
  );
}
