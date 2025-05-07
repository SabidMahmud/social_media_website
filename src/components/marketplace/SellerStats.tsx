"use client";

import { Store, ShoppingBag, Star } from "lucide-react";

interface SellerStatsProps {
  stats: {
    totalProducts: number;
    soldProducts: number;
    totalReviews: number;
    averageRating: number;
  };
}

export default function SellerStats({ stats }: SellerStatsProps) {
  const statItems = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Store,
    },
    {
      label: "Products Sold",
      value: stats.soldProducts,
      icon: ShoppingBag,
    },
    {
      label: "Reviews",
      value: stats.totalReviews,
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between p-4 bg-secondary rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-md">
              <item.icon className="h-5 w-5" />
            </div>
            <span className="font-medium">{item.label}</span>
          </div>
          <span className="text-xl font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
