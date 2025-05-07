"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface PurchaseButtonProps {
  productId: string;
}

export default function PurchaseButton({ productId }: PurchaseButtonProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);

      const response = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to purchase product");
      }

      toast.success("You have successfully purchased this product.");

      router.refresh();
    } catch (error: any) {
      toast.error("Failed to purchase product");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full transition-all hover:bg-primary/90" size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy Now
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to purchase this item? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="transition-all hover:bg-secondary/80">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: { preventDefault: () => void }) => {
              e.preventDefault();
              handlePurchase();
            }}
            disabled={isPurchasing}
            className="transition-all hover:bg-primary/90"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
