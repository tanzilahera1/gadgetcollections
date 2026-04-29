// src/app/(main)/dashboard/wishlist/page.tsx
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { redirect } from "next/navigation";
import { Heart, HeartCrack } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/priceUtils";
import { IProduct } from "@/types/product";

export const metadata = {
  title: "My Wishlist | GadgetCollections",
  description: "View and manage your saved products.",
};

async function getWishlistProducts(userId: string): Promise<IProduct[]> {
  await dbConnect();
  // Ensure Product model is initialized before populate
  Product.init();
  
  const user = await User.findById(userId).populate({
    path: "wishlist",
    model: Product,
  }).lean<{ wishlist: IProduct[] }>();
  
  return user?.wishlist ? JSON.parse(JSON.stringify(user.wishlist)) : [];
}

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/wishlist");
  }

  const wishlist = await getWishlistProducts(session.user.id);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
         <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 lowercase first-letter:uppercase">
            <Heart className="size-8 text-rose-500 fill-rose-500" />
            Wishlist
         </h1>
         <p className="text-slate-500 font-medium tracking-tight">Products you have saved for later.</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {wishlist.map((item) => {
              const displayPrice = item.salePrice || item.regularPrice;
              // Safely getting slug
              const categorySlug = (typeof item.category === 'object' && item.category !== null && 'slug' in item.category) 
                ? (item.category as { slug: string }).slug 
                : 'uncategorized';
              const productHref = `/products/${categorySlug}/${item.slug}`;

              return (
                 <div key={item._id as string} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                    <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden p-4 flex items-center justify-center">
                       <Link href={productHref} className="block relative w-full h-full">
                          <Image src={item.thumbnail} alt={item.title} fill className="object-contain group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                       </Link>
                       <div className="absolute top-3 right-3">
                          <div className="size-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white text-rose-500 cursor-default">
                             <Heart className="size-5 fill-rose-500" />
                          </div>
                       </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                       <Link href={productHref}>
                         <h3 className="text-[15px] font-black tracking-tight text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                           {item.title}
                         </h3>
                       </Link>
                       <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                          <p className="text-lg font-black text-slate-900 tracking-tighter">
                             {formatPrice(displayPrice)}
                          </p>
                          <Link href={productHref}>
                            <button className="text-[10px] uppercase tracking-widest font-black bg-slate-100 text-slate-900 py-2 px-4 rounded-xl hover:bg-primary hover:text-white transition-colors">
                              View
                            </button>
                          </Link>
                       </div>
                    </div>
                 </div>
              )
           })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
           <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <HeartCrack className="size-10 text-rose-300" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Your wishlist is empty</h3>
           <p className="text-slate-500 font-medium mb-8">Save products you love so you can find them later.</p>
           <Link href="/">
             <button className="bg-primary text-white font-black tracking-tight px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Browse Products
             </button>
           </Link>
        </div>
      )}
    </div>
  );
}
