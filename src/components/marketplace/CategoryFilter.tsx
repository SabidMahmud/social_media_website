'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const categories = [
  { label: 'All', value: '' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Home & Garden', value: 'Home & Garden' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Toys', value: 'Toys' },
  { label: 'Books', value: 'Books' },
  { label: 'Art', value: 'Art' },
  { label: 'Collectibles', value: 'Collectibles' },
  { label: 'Jewelry', value: 'Jewelry' },
  { label: 'Other', value: 'Other' },
];

export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || '';
  
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <ScrollArea className="pb-4 whitespace-nowrap">
      <div className="flex space-x-2 p-1">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={currentCategory === category.value ? "default" : "outline"}
            className="rounded-full px-4 transition-all"
            onClick={() => handleCategoryChange(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}