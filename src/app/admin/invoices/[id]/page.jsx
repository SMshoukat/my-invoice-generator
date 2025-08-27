"use client";

import React, { useEffect, useState } from "react";
import "../invoices.css";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function AdminInvoiceViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/invoices/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch invoice");
        }

        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load invoice.");
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (error) {
    return <div className="admin-invoice-view">Error: {error}</div>;
  }

  if (!invoice) {
    return <div className="admin-invoice-view">Loading...</div>;
  }

  return (
    <div className="admin-invoice-view">
      <button
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 2) {
            router.back();
          } else {
            router.push("/admin/invoices");
          }
        }}
        className="back-button"
      >
        ← Back
      </button>

      <div className="invoice-box">
        <div className="logo-flex">
          <div className="logo-parent">
            {invoice.logo && (
              <img
                src={invoice.logo}
                alt="Company Logo"
                className="invoice-logo"
              />
            )}
          </div>

          <div className="">
            <h2>Invoice #{invoice.invoiceNumber}</h2>
          </div>
        </div>

        <div className="invoice-section">
          <div className="">
            <p>
              <strong>Client:</strong> {invoice.clientName}
            </p>
            <p>
              <strong>Company:</strong> {invoice.companyName}
            </p>
            <p>
              <strong>Amount:</strong> ${invoice.total}
            </p>
          </div>
          <div className="">
            <p>
              <strong>Date:</strong> {invoice.date}
            </p>
            <p>
              <strong>Due Date:</strong> {invoice.dueDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
