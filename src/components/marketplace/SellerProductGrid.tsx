"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SellerProductGridProps {
  initialProducts?: any[];
  category?: string;
  search?: string;
  wishlistOnly?: boolean;
  sellerId?: string; // New prop for seller page
}

export default function SellerProductGrid({
  initialProducts,
  category,
  search,
  wishlistOnly,
  sellerId, // Added sellerId parameter with default value
}: SellerProductGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let url = "/api/marketplace/seller-products";
        const params = new URLSearchParams();

        if (category) {
          params.append("category", category);
        }

        if (search) {
          params.append("search", search);
        }

        if (sellerId) {
          params.append("sellerId", sellerId);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        if (wishlistOnly) {
          url = "/api/marketplace/wishlist";
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);

        // Get wishlist status for all products
        const wishlistResponse = await fetch("/api/marketplace/wishlist");

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setWishlistedProducts(wishlistData.map((item: any) => item._id));
        }
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (!initialProducts) {
      fetchProducts();
    } else {
      // Get wishlist status for initial products
      const fetchWishlist = async () => {
        try {
          const response = await fetch("/api/marketplace/wishlist");

          if (response.ok) {
            const data = await response.json();
            setWishlistedProducts(data.map((item: any) => item._id));
          }
        } catch (error) {
          // Silently fail, not critical
        }
      };

      fetchWishlist();
    }
  }, [initialProducts, category, search, wishlistOnly, sellerId]);

  const handleWishlistToggle = async (productId: string) => {
    try {
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

      if (inWishlist) {
        setWishlistedProducts([...wishlistedProducts, productId]);
      } else {
        setWishlistedProducts(
          wishlistedProducts.filter((id) => id !== productId)
        );
      }

      if (wishlistOnly) {
        // If we're on the wishlist page, remove the product when unwishlisted
        if (!inWishlist) {
          setProducts(products.filter((product) => product._id !== productId));
        }
      }

      toast.success(
        inWishlist
          ? "Product has been added to your wishlist"
          : "Product has been removed from your wishlist"
      );
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="mb-2 text-2xl font-semibold">No products found</h3>
        <p className="text-muted-foreground">
          {wishlistOnly
            ? "You haven't added any products to your wishlist yet."
            : sellerId
            ? "This seller hasn't listed any products yet."
            : "Try adjusting your filters or search criteria."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isInWishlist={wishlistedProducts.includes(product._id)}
          onWishlistToggle={handleWishlistToggle}
        />
      ))}
    </div>
  );
}
