'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: any;
  isInWishlist: boolean;
  onWishlistToggle: (productId: string) => void;
}

export default function ProductCard({ product, isInWishlist, onWishlistToggle }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [isHovering, setIsHovering] = useState(false);
  
  const handleWishlistToggle = async () => {
    setIsWishlisted(!isWishlisted);
    onWishlistToggle(product._id);
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/marketplace/${product._id}`}>
        <div className="relative aspect-square overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className={`object-cover transition-transform duration-300 ${isHovering ? 'scale-105' : 'scale-100'}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <span className="text-secondary-foreground">No image</span>
            </div>
          )}
          {product.sold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive" className="text-lg px-4 py-2">SOLD</Badge>
            </div>
          )}
          {product.isBiddable && !product.sold && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              Auction
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/marketplace/${product._id}`} className="block">
            <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">{product.title}</h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 flex-shrink-0"
            onClick={handleWishlistToggle}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        </div>
        
        <p className="mt-1 text-xl font-bold">${product.price.toFixed(2)}</p>
        
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <span>{product.seller.firstName} {product.seller.lastName}</span>
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/marketplace/${product._id}`} className="w-full">
          <Button variant="default" className="w-full">
            {product.sold ? 'View Details' : (product.isBiddable ? 'Place Bid' : 'Buy Now')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}