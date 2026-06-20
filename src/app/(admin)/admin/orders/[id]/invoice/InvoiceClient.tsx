// src/app/(admin)/admin/orders/[id]/invoice/InvoiceClient.tsx
"use client";

import type { IOrderSerializable } from "@/types/order";
import {
  WhatsAppIcon,
  FacebookIcon,
} from "@/socialCustomSVGIcon/SocialCustomSVGIcon";
import { Phone } from "lucide-react";
import { useMemo } from "react";

import "@/styles/invoice.css";
import { InvoiceQR } from "@/components/admin/InvoiceQR";

interface Props {
  order: IOrderSerializable;
}

function nWords(n: number): string {
  return n.toLocaleString("bn-BD");
}

/**
 * ✅ Invoice number = আজকের তারিখ (DDMMYY) + Order ID-এর শেষের 4 digit
 *
 * Order ID: ORD-261225-9353 → শেষের 4 digit = 9353
 * আজকের তারিখ: 26 Dec 2025 → 261225
 * Result: "2612259353"
 *
 * 🔁 Deterministic: একই order একই দিনে print করলে সবসময় একই invoice number
 */
function generateInvoiceNumber(orderNumber: string): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);

  const match = orderNumber.match(/(\d{4})$/);
  const last4 = match ? match[1] : "0000";

  return `${dd}${mm}${yy}${last4}`;
}

export function InvoiceClient({ order }: Props) {
  const dateStr = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const totalItems = order.items.reduce((s, i) => s + i.itemQuantity, 0);

  const payLabel = order.paymentMethod === "cod" ? "COD" : "Paid";

  const shipping = order.shipping;

  const fullAddress =
    shipping.addressLine1 +
    (shipping.addressLine2 ? `, ${shipping.addressLine2}` : "") +
    (shipping.district ? `, ${shipping.district}` : "") +
    (shipping.city ? `, ${shipping.city}` : "") +
    (shipping.postalCode ? ` - ${shipping.postalCode}` : "");

  // ✅ Deterministic invoice number
  const invoiceNo = useMemo(
    () => generateInvoiceNumber(order.orderNumber),
    [order.orderNumber],
  );

  return (
    <>
      {/* Toolbar */}
      <div className="invoice-toolbar no-print">
        <button onClick={() => window.history.back()}>← Back</button>
        <button className="primary" onClick={() => window.print()}>
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Tip */}
      <div
        className="no-print"
        style={{
          maxWidth: "148mm",
          margin: "0 auto 8px",
          padding: "8px 12px",
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#9a3412",
        }}
      >
        💡 <strong>Tip:</strong> Print dialog-এ Paper size{" "}
        <strong>A5</strong>, Margins <strong>None</strong>, Background graphics{" "}
        <strong>ON</strong> সিলেক্ট করুন।
      </div>

      {/* Invoice */}
      <div className="invoice-page">
        {/* Invoice No — top-LEFT */}
        <div className="invoice-no-top">
          <span className="invoice-no-label">Invoice:</span> {invoiceNo}
        </div>

        {/* ✅ QR Code — top-RIGHT */}
        <div className="invoice-qr">
          <InvoiceQR value="https://gadgetcollections.vercel.app" size={76} />
          <div className="invoice-qr-label">Visit Us</div>
        </div>

        {/* WATERMARK */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt=""
          className="invoice-watermark"
          aria-hidden="true"
        />

        {/* CONTENT */}
        <div className="invoice-content">
          {/* HEADER */}
          <div className="invoice-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt=""
              className="invoice-logo"
              width={64}
              height={64}
            />
            <div className="invoice-header-text">
              <p className="invoice-store-name">Gadget Collections</p>
              <p className="invoice-store-address">
                5C(5th floor), 92/1, Motijheel C/A, Dhaka-1000
              </p>
              <p className="invoice-store-contact">
                <span className="contact-item">
                  <Phone className="icon-phone" />
                  Mobile
                </span>
                <span>&amp;</span>
                <span className="contact-item">
                  <WhatsAppIcon className="icon-wa" />
                  WhatsApp
                </span>
                <span>: 01568390014</span>
              </p>
            </div>
          </div>

          {/* INFO GRID */}
          <section className="invoice-info-grid !py-10">
            <div className="invoice-info-col">
              <h2 className="invoice-section-title">Order Info</h2>
              <div className="invoice-info-row">
                <span className="invoice-label">Order ID:</span>{" "}
                {order.orderNumber}
              </div>
              <div className="invoice-info-row">
                <span className="invoice-label">Placed:</span> {dateStr}
              </div>
              <div className="invoice-info-row">
                <span className="invoice-label">Payment Method:</span>{" "}
                <span className="highlight-yellow">{payLabel}</span>
              </div>
              <div className="invoice-info-row">
                <span className="invoice-label">Total Product:</span>{" "}
                {order.items.length}
              </div>
              <div className="invoice-info-row">
                <span className="invoice-label">Total Items:</span> {totalItems}
              </div>
            </div>

            <div className="invoice-info-col">
              <h2 className="invoice-section-title">Delivery Address</h2>
              <div className="invoice-info-row">
                <span className="invoice-label">Name:</span> {shipping.name}
              </div>
              <div className="invoice-info-row">
                <span className="invoice-label">Address:</span>{" "}
                <span className="highlight-yellow">{fullAddress}</span>
              </div>
              <div className="invoice-info-row">
                <span className="invoice-label">Phone:</span>{" "}
                <span className="highlight-yellow">{shipping.phone}</span>
              </div>
            </div>
          </section>

          {/* ITEMS TABLE */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="col-sn">SN</th>
                <th className="col-product">Product</th>
                <th className="col-qty">Quantity</th>
                <th className="col-unit">Unit Price</th>
                <th className="col-price">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="col-sn">{idx + 1}</td>
                  <td className="col-product">{item.productTitle}</td>
                  <td className="col-qty">{item.itemQuantity}</td>
                  <td className="col-unit">{item.unitPrice}</td>
                  <td className="col-price">
                    {item.unitPrice * item.itemQuantity}
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={2} rowSpan={order.discount > 0 ? 5 : 4} />
                <td colSpan={2} className="summary-label">
                  Subtotal
                </td>
                <td className="summary-value">{order.subtotal}</td>
              </tr>
              <tr>
                <td colSpan={2} className="summary-label">
                  Shipping
                </td>
                <td className="summary-value">{order.shippingCost}</td>
              </tr>
              {order.discount > 0 && (
                <tr>
                  <td colSpan={2} className="summary-label">
                    Discount
                  </td>
                  <td className="summary-value">-{order.discount}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2} className="summary-label">
                  Total
                </td>
                <td className="summary-value">{order.total}</td>
              </tr>
              <tr className="payable-row">
                <td colSpan={2} className="summary-label highlight-yellow">
                  Customer Payable
                </td>
                <td className="summary-value highlight-yellow">
                  {order.total}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="invoice-words">
            কথায়: {nWords(order.total)} টাকা মাত্র।
          </p>

          {order.customerNotes && (
            <p className="invoice-customer-note">
              📝 Customer Note: {order.customerNotes}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="invoice-footer">
          <p className="invoice-footer-thanks">
            Thank you for shopping with Gadget Collections!
          </p>
          <p className="invoice-footer-subtitle">
            আপনার আস্থার জন্য আমরা কৃতজ্ঞ।🎉
          </p>

          <div className="invoice-footer-links">
            <span className="invoice-footer-link">
              🌐 www.gadgetcollections.com
            </span>
            <span className="invoice-footer-divider">|</span>
            <span className="invoice-footer-link">
              <FacebookIcon />
              www.facebook.com/gadgetcollectionsbd
            </span>
          </div>
        </div>
      </div>
    </>
  );
}