import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { formatPrice } from "@/lib/priceUtils";
import { notFound } from "next/navigation";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { Star } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

import type { IProduct, IProductSpecification } from "@/types/product";
import type { ICategory } from "@/types/category";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";
import { Types } from "mongoose";

export const revalidate = 3600;
export const dynamicParams = true;

// ✅ টাইপ ডিফাইন করো any এর বদলে
type ProductWithCategorySlug = {
  slug: string;
  category: {
    _id: Types.ObjectId;
    slug: string;
  };
};

export async function generateStaticParams() {
  await dbConnect();
  const products = await Product.find({ status: "published" })
    .select("slug category")
    .populate("category", "slug")
    .lean<ProductWithCategorySlug[]>(); // টাইপ দাও এখানে

  return products.map((p) => ({
    category: p.category.slug, // এখন আর any না
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).lean<IProduct>();
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || product.title,
    description: product.seoDesc || product.shortDesc,
    openGraph: {
      images: [product.thumbnail],
    },
  };
}

type PopulatedProduct = Omit<IProduct, "category"> & {
  category: ICategory;
};

async function getProductData(slug: string) {
  await dbConnect();

  const productDoc = await Product.findOne({ slug, status: "published" })
    .populate("category", "name slug")
    .lean();

  if (!productDoc) return null;

  const product = productDoc as unknown as PopulatedProduct;

  const relatedProductsDocs = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    status: "published",
  })
    .limit(4)
    .lean();

  const relatedProducts = relatedProductsDocs as unknown as IProduct[];

  return {
    product: JSON.parse(JSON.stringify(product)) as PopulatedProduct,
    relatedProducts: JSON.parse(JSON.stringify(relatedProducts)) as IProduct[],
  };
}

export default async function ProductDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const params = await paramsPromise;
  const data = await getProductData(params.slug);

  if (!data) notFound();

  const { product, relatedProducts } = data;

  const displayPrice = product.salePrice || product.regularPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">
          {product.category.name}
        </span>
      </div>

      {/* Main Section */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* Image */}
        <ProductImageGallery images={product.images || []} />

        {/* Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold tracking-widest rounded">
                Official
              </span>

              <div className="flex items-center gap-1 text-xs">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">
                  {product.ratings?.average || 4.8}
                </span>
                <span className="text-muted-foreground">
                  ({product.ratings?.count || 12})
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight">
              {product.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.shortDesc}
            </p>
          </div>

          {/* 💰 Pricing (FIXED) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sale Price FIRST */}
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">
              {formatPrice(displayPrice)}
            </span>

            {/* Regular Price AFTER */}
            {product.salePrice && (
              <span className="text-muted-foreground text-sm tracking-widest line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}

            {/* Save Badge */}
            {product.salePrice && (
              <span className="sm:text-lg md:text-xl  font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                বাঁচবে {formatPrice(product.regularPrice - product.salePrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <ProductActions
              productId={String(product._id)}
              productTitle={product.title}
              stock={product.stockQuantity}
            />
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className="grid md:grid-cols-3 gap-8 pt-10 border-t">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-black">Description</h2>
          <div
            className="prose max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black">Specifications</h2>
          <div className="bg-muted/40 rounded-xl p-4 space-y-3">
            {(product.specifications || []).map(
              (spec: IProductSpecification, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{spec.key}</span>
                  <span className="font-semibold text-right">{spec.value}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-10">
          <h2 className="text-xl font-black">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedProducts.map((p: IProduct) => (
              <ProductCard key={String(p._id)} product={p} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
