// src/components/common/InvoiceQR.tsx
"use client";

import { QRCodeSVG } from "qrcode.react";

interface InvoiceQRProps {
  value: string;
  size?: number;
}

/**
 * Invoice-এ ব্যবহারের জন্য QR Code wrapper
 *
 * 🔄 Future migration to antd:
 *   import { QRCode } from "antd";
 *   return <QRCode value={value} size={size} color="#002060" bordered={false} />;
 */
export function InvoiceQR({ value, size = 76 }: InvoiceQRProps) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      bgColor="#ffffff"
      fgColor="#002060"
      marginSize={2}
    />
  );
}