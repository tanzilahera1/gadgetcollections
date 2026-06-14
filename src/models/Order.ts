import { Schema, models, model } from "mongoose";
import type { IOrder } from "@/types/order";

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId },
    productTitle: { type: String, required: true },
    productSlug: { type: String, required: true },
    productImage: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    itemQuantity: { type: Number, required: true, min: 1 },
    productSku: { type: String, required: true },
  },
  { _id: true },
);

const OrderShippingSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String },
    district: { type: String },
    postalCode: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    customerPhone: { type: String, required: true, trim: true },
    items: { type: [OrderItemSchema], required: true },
    shipping: { type: OrderShippingSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "mobile"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, trim: true },
    senderNumber: { type: String, trim: true },
    paymentProvider: {
      type: String,
      enum: ["bkash", "nagad", "rocket"],
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    customerNotes: { type: String },
    adminNotes: { type: String },
    couponCode: { type: String, trim: true },
  },
  { timestamps: true },
);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customerPhone: 1 });
OrderSchema.index({ "shipping.phone": 1 });

export default models.Order || model<IOrder>("Order", OrderSchema);
