// src/lib/invoice-number.ts
import mongoose from "mongoose";

// Counter Schema — global sequence track
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Format: "global_invoice_seq"
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

  const counterKey = "global_invoice_seq";

  // Check if global counter exists
  let counter = await Counter.findById(counterKey);

  if (!counter) {
    // Initialize the global counter from the latest order if it exists
    const Order = mongoose.models.Order;
    let lastSeq = 0;
    
    if (Order) {
      const latestOrder = await Order.findOne().sort({ createdAt: -1 });
      if (latestOrder && latestOrder.orderNumber) {
        // Remove "GC" (2 chars) and Date (6 chars) to get only the sequence part
        const seqPart = latestOrder.orderNumber.slice(8);
        if (seqPart) {
          lastSeq = parseInt(seqPart, 10);
        }
      }
    }
    
    // Create the counter with the last known sequence
    await Counter.create({ _id: counterKey, sequence: lastSeq });
  }

  // Atomic increment — race condition free
  counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  const seq = String(counter!.sequence).padStart(5, "0");

  return `GC${dd}${mm}${yy}${seq}`;
}