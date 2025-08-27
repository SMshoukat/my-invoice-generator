"use client";
import React from "react";
import "./PDFInvoiceLayout.css";

const PDFInvoiceLayout = ({ invoice }) => {
  if (!invoice) {
    return <p>Loading invoice...</p>;
  }
  console.log(invoice);
  const {
    invoiceNumber,
    clientName,
    companyName,
    date,
    dueDate,
    paymentTerms,
    paymentMode,
    items = [],
    total,
    notes,
    logo,
    currency,
  } = invoice;

  const currencySymbol =
    {
      USD: "$",
      EUR: "€",
      GBP: "£",
      PKR: "₨",
      INR: "₹",
      JPY: "¥",
      CNY: "¥",
      AUD: "A$",
      CAD: "C$",
    }[currency] || currency;

  return (
    <div className="pdf-invoice-wrapper">
      <div className="invoice-header">
        <div className="">
          {logo && <img src={logo} alt="Company Logo" className="pdf-logo" />}
        </div>
        <div className="">
          <h1>INVOICE</h1>
        </div>

        <div className="invoice-number">
          INVOICE#: {invoiceNumber || "INV-00001"}
          <div className="upr-date">
            {date && <div className="invoice-date"><strong>Issue Date: </strong>{date}</div>}
            {dueDate && (
              <div className="invoice-date-due"><strong>Due Date: </strong>{dueDate}</div>
            )}
            {paymentMode && (
              <div className="payment-mode"><strong>Payment mode: </strong>{paymentMode}</div>
            )}
          </div>
        </div>
      </div>

      <div className="invoice-bill-section">
        {clientName && (
          <div>
            <strong>Bill To:</strong>
            <p>{clientName}</p>
          </div>
        )}

        {companyName && (
          <div>
            <strong>From:</strong>
            <p>{companyName}</p>
          </div>
        )}
      </div>

      <table className="invoice-table-pdf">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>
                {currencySymbol} {item.price}
              </td>
              <td>
                {currencySymbol} {(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="payment-total">
        <div className="">
          {paymentTerms && (
            <div className="payment-terms-pdf">
              <strong>Payment Terms:</strong> <span>{paymentTerms}</span>
            </div>
          )}
        </div>
        <div className="invoice-subtotal">
          <span>Sub Total</span>
          <span>
            {currencySymbol}{" "}
            {total != null
              ? Number(total.toString().replace(/[^0-9.]/g, "")).toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )
              : "-"}
          </span>
        </div>
      </div>

      {notes && (
        <div className="invoice-note">
          <strong>Note: </strong>
          <strong>{notes}</strong>
          <div className="note-line" />
          {/* <div className="note-line" /> */}
        </div>
      )}

      <div className="invoice-thankyou">Thank You!</div>
    </div>
  );
};

export default PDFInvoiceLayout;
