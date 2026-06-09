import { jsPDF } from "jspdf";
import { Payment } from "@/store/slices/paymentSlice";

const LOGO_SVG = `<svg width="144" height="31" viewBox="0 0 144 31" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M139.3 0.647629H109.501C106.905 0.647629 104.801 2.75175 104.801 5.34731V25.6527C104.801 28.2482 106.905 30.3524 109.501 30.3524H139.3C141.896 30.3524 144 28.2482 144 25.6527V5.34731C144 2.75175 141.896 0.647629 139.3 0.647629Z" fill="#00FF9D"/><path d="M113.949 5.6899H119.304L124.338 24.9694H120.269L119.25 20.5517H113.868L112.849 24.9694H108.806L113.947 5.6899H113.949ZM118.501 17.4173L117.028 11.071C116.975 10.8041 116.921 10.5126 116.868 10.2003C116.815 9.888 116.769 9.58895 116.733 9.30314C116.697 9.00031 116.661 8.688 116.625 8.36624H116.464C116.428 8.688 116.385 9.00031 116.33 9.30314C116.294 9.58895 116.254 9.888 116.209 10.2003C116.163 10.5126 116.107 10.8022 116.035 11.071L114.589 17.4173H118.497H118.501Z" fill="white"/><path d="M126.615 21.3278H131.837V13.8571H127.285V10.242H135.587V21.3278H139.738V24.9694H126.617V21.3278H126.615ZM131.033 6.35993C131.033 5.78832 131.216 5.33406 131.582 4.99526C131.947 4.65646 132.433 4.48611 133.041 4.48611H133.844C134.451 4.48611 134.938 4.65646 135.303 4.99526C135.668 5.33406 135.852 5.79022 135.852 6.35993C135.852 6.92965 135.668 7.3858 135.303 7.7246C134.938 8.0634 134.442 8.23375 133.817 8.23375H133.041C132.433 8.23375 131.947 8.06529 131.582 7.7246C131.216 7.3858 131.033 6.92965 131.033 6.35993Z" fill="white"/><path d="M15.583 6.20094V10.4577H10.3344V24.9429H5.24669V10.4577H0V6.20094H15.583Z" fill="#191919"/><path d="M31.3287 6.22745V24.9713H26.294V21.8653H20.4568L19.1981 24.9713H13.4404L19.0902 11.3151C20.8031 7.19085 21.9558 6.22745 26.2921 6.22745H31.3268H31.3287ZM26.294 10.5107C25.1697 10.6981 24.5546 11.7694 23.5893 14.1259L22.1962 17.6066H26.2921V10.5107H26.294Z" fill="#191919"/><path d="M47.2864 20.7126V24.9694H37.5407C35.2107 24.9694 34.4612 23.8716 34.4612 21.7025V6.22745H39.5489V19.9101C39.5489 20.4987 39.6833 20.7126 40.3249 20.7126H47.2864Z" fill="#191919"/><path d="M54.1685 11.2868V13.4558H61.9061V17.7391H54.1685V19.9082C54.1685 20.4968 54.3029 20.7107 54.9445 20.7107H63.2442V24.9675H52.1584C49.8284 24.9675 49.0789 23.8697 49.0789 21.7006V9.52082C49.0789 7.32524 49.8284 6.22745 52.1584 6.22745H63.2442V10.4842H54.9445C54.301 10.4842 54.1685 10.6981 54.1685 11.2868Z" fill="#191919"/><path d="M83.0328 6.22745V24.9713H79.4442C77.0877 24.9713 76.0429 24.4356 74.9735 22.2666L71.0366 14.4211V24.9713H65.9489V6.22745H69.4562C72.106 6.22745 72.9634 7.00347 73.9552 9.01167L77.9451 16.9915V6.22745H83.0328Z" fill="#191919"/><path d="M100.465 6.20094V10.4577H95.2164V24.9429H90.1287V10.4577H84.8801V6.20094H100.463H100.465Z" fill="#191919"/></svg>`;

function loadLogoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const blob = new Blob([LOGO_SVG], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 576; canvas.height = 124;
      canvas.getContext("2d")!.drawImage(img, 0, 0, 576, 124);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = url;
  });
}

export async function downloadInvoice(payment: Payment): Promise<void> {
  const logoDataUrl = await loadLogoDataUrl();
  const subtotal  = payment.amountCents ? payment.amountCents / 100 : (payment.planPrice || 0);
  const invoiceNo = `INV-${payment._id.slice(-8).toUpperCase()}`;
  const issueDate = new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, L = 20, R = 190, CW = R - L;

  const grey1  = [249, 250, 251] as [number, number, number];
  const grey2  = [229, 231, 235] as [number, number, number];
  const dark   = [17, 24, 39]   as [number, number, number];
  const mid    = [55, 65, 81]   as [number, number, number];
  const light  = [107, 114, 128] as [number, number, number];
  const accent = [13, 148, 136] as [number, number, number];

  doc.setFillColor(...accent); doc.rect(0, 0, W, 3, "F");
  doc.addImage(logoDataUrl, "PNG", L, 10, 48, 10.3);
  doc.setFont("helvetica", "bold"); doc.setFontSize(28); doc.setTextColor(...dark);
  doc.text("INVOICE", R, 18, { align: "right" });
  doc.setDrawColor(...grey2); doc.setLineWidth(0.4); doc.line(L, 26, R, 26);

  let y = 34;
  const metaLabel = (label: string, value: string, yy: number) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...light); doc.text(label, 130, yy);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...dark); doc.text(value, R, yy, { align: "right" });
  };
  metaLabel("Invoice Number:", invoiceNo, y);
  metaLabel("Issue Date:", issueDate, y + 6);
  metaLabel("Due Date:", issueDate, y + 12);
  metaLabel("Status:", "PAID", y + 18);

  const blockTitle = (t: string, yy: number) => { doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...accent); doc.text(t, L, yy); };
  const blockLine  = (t: string, yy: number, bold = false) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(9); doc.setTextColor(...(bold ? dark : mid)); doc.text(t, L, yy); };

  blockTitle("FROM", y);
  blockLine("TalentAI Platform", y + 6, true);
  blockLine("app.talentai.bid", y + 12);
  blockLine("support@talentai.bid", y + 18);
  doc.setDrawColor(...grey2); doc.line(L, y + 24, 100, y + 24);
  y += 30;
  blockTitle("BILL TO", y);
  blockLine("Subscription Customer", y + 6, true);
  blockLine(`Plan: ${payment.planName || "—"}`, y + 12);
  y += 26;
  doc.setDrawColor(...grey2); doc.line(L, y, R, y); y += 8;

  doc.setFillColor(...accent); doc.rect(L, y, CW, 9, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", L + 3, y + 6);
  doc.text("QTY", L + 95, y + 6, { align: "center" });
  doc.text("UNIT PRICE", L + 120, y + 6, { align: "center" });
  doc.text("AMOUNT", R - 3, y + 6, { align: "right" });
  y += 9;

  doc.setFillColor(...grey1); doc.rect(L, y, CW, 11, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...mid);
  doc.text(`TalentAI ${payment.planName || ""} Plan — Monthly Subscription`, L + 3, y + 7.2);
  doc.text("1", L + 95, y + 7.2, { align: "center" });
  doc.text(`$${subtotal.toFixed(2)}`, L + 120, y + 7.2, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
  doc.text(`$${subtotal.toFixed(2)}`, R - 3, y + 7.2, { align: "right" });
  y += 11;
  doc.setDrawColor(...grey2); doc.line(L, y, R, y); y += 8;

  const totalsX = R - 70;
  const totalRow = (label: string, value: string, yy: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...(bold ? dark : mid));
    doc.text(label, totalsX, yy); doc.text(value, R, yy, { align: "right" });
  };
  totalRow("Subtotal:", `$${subtotal.toFixed(2)}`, y);
  totalRow("Tax (0%):", "$0.00", y + 7);
  y += 14;
  doc.setDrawColor(...accent); doc.setLineWidth(0.6); doc.line(totalsX, y, R, y); y += 6;
  doc.setFillColor(...accent); doc.roundedRect(totalsX, y, R - totalsX, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
  doc.text("TOTAL DUE", totalsX + 4, y + 7.5);
  doc.text(`$${subtotal.toFixed(2)} USD`, R - 4, y + 7.5, { align: "right" });
  y += 18;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...accent);
  doc.text("PAYMENT INFORMATION", L, y); y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...mid);
  doc.text("Payment Method:  Credit / Debit Card (via Stripe)", L, y);
  doc.text(`Payment Date:    ${issueDate}`, L, y + 6);
  doc.text("Currency:        USD", L, y + 12);
  y += 24;

  doc.setDrawColor(...grey2); doc.setLineWidth(0.3); doc.line(L, y, R, y); y += 6;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...accent);
  doc.text("TERMS & CONDITIONS", L, y); y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...light);
  [
    "1. This invoice is generated automatically upon successful payment processing.",
    "2. All subscriptions are billed monthly. Cancellation takes effect at the end of the current billing period.",
    "3. Refunds are subject to TalentAI refund policy. Contact support@talentai.bid within 7 days of payment.",
    "4. This document serves as an official receipt and proof of payment.",
  ].forEach((line, i) => doc.text(line, L, y + i * 5));

  doc.setFillColor(...dark); doc.rect(0, H - 16, W, 16, "F");
  doc.setFillColor(...accent); doc.rect(0, H - 16, 3, 16, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(200, 200, 200);
  doc.text("TalentAI  ·  app.talentai.bid  ·  support@talentai.bid", W / 2, H - 9, { align: "center" });
  doc.setTextColor(...accent); doc.text(invoiceNo, W / 2, H - 4, { align: "center" });

  doc.save(`${invoiceNo}.pdf`);
}
