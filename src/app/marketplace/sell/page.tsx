import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/marketplace/ProductForm";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export default async function SellPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="mb-6">
        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className="transition-all hover:bg-secondary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell an Item</h1>
        <p className="text-muted-foreground">
          List your item on the marketplace for others to purchase
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
