import { Schema, models, model, Document } from "mongoose";
import type { IUser } from "@/types/user";

const AddressSchema = new Schema(
  {
    label: { type: String, required: true, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const UserSchema = new Schema<IUser & Document>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, trim: true },
    emailVerified: { type: Date },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    emergencyContact: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ resetToken: 1 });

export default models.User || model<IUser & Document>("User", UserSchema);
