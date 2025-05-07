import { Suspense } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus } from 'lucide-react';
import ProductGrid from '@/components/marketplace/ProductGrid';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import ProductSearch from '@/components/marketplace/ProductSearch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center">
            <ShoppingBag className="mr-2 h-8 w-8" />
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            Browse and purchase items from our community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/marketplace/wishlist">
            <Button variant="outline" className="transition-all hover:bg-secondary/80">
              My Wishlist
            </Button>
          </Link>
          <Link href="/marketplace/sell">
            <Button className="transition-all hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Sell Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <ProductSearch />
        <div className="text-sm text-muted-foreground">
          {search && <span>Search results for &quot;{search}&quot;</span>}
        </div>
      </div>

      <div className="mb-8">
        <CategoryFilter />
      </div>

      <Suspense
        fallback={
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
        }
      >
        <ProductGrid category={category} search={search} />
      </Suspense>
    </div>
  );
}