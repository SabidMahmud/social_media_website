"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BidFormProps {
  productId: string;
  currentHighestBid: number | null;
  basePrice: number;
}

export default function BidForm({
  productId,
  currentHighestBid,
  basePrice,
}: BidFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(
    currentHighestBid ? currentHighestBid + 5 : basePrice
  );
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(e.target.value));
    setError("");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");

      const minAmount = currentHighestBid ? currentHighestBid + 1 : basePrice;

      if (amount < minAmount) {
        setError(
          `Bid must be at least ${
            currentHighestBid ? "higher than current bid" : "the base price"
          }`
        );
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/marketplace/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: productId,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to place bid");
      }

      toast.success(
        `Your bid of $${amount.toFixed(2)} has been placed successfully.`
      );

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="bg-primary-foreground">
        <CardTitle>Place a Bid</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div>
              <label
                htmlFor="amount"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Bid Amount ($)
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={currentHighestBid ? currentHighestBid + 1 : basePrice}
                value={amount}
                onChange={handleAmountChange}
                className="transition-all focus-visible:ring-2 mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {currentHighestBid
                  ? `Current highest bid: $${currentHighestBid.toFixed(2)}`
                  : `Starting price: $${basePrice.toFixed(2)}`}
              </p>
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Bid...
              </>
            ) : (
              "Place Bid"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
