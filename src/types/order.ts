import type { Document, Types } from "mongoose";
import type {
  Price,
  ItemQuantity,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from "./index";
import type { ID } from "./index";

export interface IOrderItem {
  product: ID;
  variant?: ID;
  productTitle: string;
  productSlug: string;
  productImage: string;
  unitPrice: Price;
  itemQuantity: ItemQuantity;
  productSku: string;
}

export interface IOrderShipping {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface IOrderBase {
  orderNumber: string;
  user?: ID;
  items: IOrderItem[];
  shipping: IOrderShipping;
  subtotal: Price;
  shippingCost: Price;
  discount: Price;
  total: Price;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  senderNumber?: string;
  paymentProvider?: "bkash" | "nagad" | "rocket";
  orderStatus: OrderStatus;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  customerNotes?: string;
  adminNotes?: string;
  couponCode?: string;
}

export interface IOrder extends IOrderBase, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderSerializable extends IOrderBase {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
