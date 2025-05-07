import Link from "next/link";
import { ShoppingBag, Heart, PlusCircle, UserCircle, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSession } from "next-auth/react";

export async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2" />
            <span className="font-bold text-xl">Marketplace</span>
          </Link>

          <nav className="ml-auto flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/marketplace/sell">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </Link>
            <Link href="/marketplace/wishlist">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">{children}</div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
