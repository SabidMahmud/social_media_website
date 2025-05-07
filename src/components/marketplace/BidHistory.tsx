"use client";

import { useState, useEffect } from "react";
import { formatDistance } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface BidHistoryProps {
  productId: string;
  refreshTrigger?: number;
}

export default function BidHistory({
  productId,
  refreshTrigger = 0,
}: BidHistoryProps) {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/marketplace/bids?productId=${productId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bids");
        }

        const data = await response.json();
        setBids(data);
      } catch (error) {
        toast.error("Failed to load bid history");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [productId, refreshTrigger, toast]);

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-primary-foreground">
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="ml-auto">
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="bg-primary-foreground">
        <CardTitle>Bid History</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {bids.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            No bids placed yet
          </p>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="flex items-center space-x-4 p-2 rounded-md transition-colors hover:bg-secondary"
              >
                <Avatar>
                  <AvatarImage src={bid.user.profilePicture} />
                  <AvatarFallback>
                    {bid.user.firstName[0]}
                    {bid.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {bid.user.firstName} {bid.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistance(new Date(bid.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="ml-auto font-semibold">
                  ${bid.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
