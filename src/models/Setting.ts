import mongoose, { Schema, models, model, Document } from "mongoose";

export interface ISetting {
  _id: string | mongoose.Types.ObjectId;
  storeName: string;
  storeEmail?: string;
  storePhone?: string;
  currency: string;
  deliveryChargeInside: number;
  deliveryChargeOutside: number;
  freeShippingThreshold?: number;
  facebookURL?: string;
  instagramURL?: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting & Document>(
  {
    storeName: { type: String, required: true, default: "Gadget Collections" },
    storeEmail: { type: String },
    storePhone: { type: String },
    currency: { type: String, default: "BDT" },
    deliveryChargeInside: { type: Number, default: 60 },
    deliveryChargeOutside: { type: Number, default: 120 },
    freeShippingThreshold: { type: Number, default: 0 },
    facebookURL: { type: String },
    instagramURL: { type: String },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default models.Setting ||
  model<ISetting & Document>("Setting", SettingSchema);
