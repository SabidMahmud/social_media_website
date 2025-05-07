"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ReviewSellerButtonProps {
  sellerId: string;
  productId?: string;
  hasPurchased: boolean;
}

export default function ReviewSellerButton({
  sellerId,
  productId,
  hasPurchased,
}: ReviewSellerButtonProps) {
  const router = useRouter();

  if (!hasPurchased) {
    return (
      <Button variant="outline" disabled className="w-full mt-4">
        <Star className="mr-2 h-4 w-4" />
        Purchase required to review seller
      </Button>
    );
  }

  return (
    <Link href={`/marketplace/sellers/${sellerId}`} className="w-full">
      <Button variant="outline" className="w-full mt-4">
        <Star className="mr-2 h-4 w-4" />
        Review Seller
      </Button>
    </Link>
  );
}
