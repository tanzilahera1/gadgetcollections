// ==================== src/types/cart.ts ====================
import type { ID, ItemQuantity } from "./index";

export interface ICartItem {
  product: ID; // Product _id
  variant?: ID; // ProductVariant _id — ভ্যারিয়েন্ট থাকলে
  itemQuantity: ItemQuantity;
  addedAt: Date;
}

export interface IPopulatedCartItem extends Omit<ICartItem, "product"> {
  product: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    regularPrice: number;
    salePrice?: number;
    stockQuantity: number;
    status: string;
    category?: {
      slug: string;
    };
  };
  subtotal: number;
}

export interface ICart {
  user?: ID; // Logged-in হলে User _id, Guest হলে undefined
  sessionId?: string; // Guest এর জন্য UUID — 30 দিন TTL
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}
