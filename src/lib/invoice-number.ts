// src/lib/invoice-number.ts
import mongoose from "mongoose";

// Counter Schema — daily sequence track
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Format: "DDMMYYYY"
  sequence: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

/**
 * Generates: GC + DDMMYY + 4-digit sequence
 * Example: GC2006260001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const yyyy = String(now.getFullYear());

  // Counter key: full date (DDMMYYYY) — duplicate এড়াতে full year
  const counterKey = `${dd}${mm}${yyyy}`;

  // Atomic increment — race condition free
  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  const seq = String(counter.sequence).padStart(4, "0");

  return `GC${dd}${mm}${yy}${seq}`;
}