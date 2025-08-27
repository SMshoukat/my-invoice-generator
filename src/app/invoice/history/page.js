"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { renderToStaticMarkup } from "react-dom/server";

// Lazy-load html2pdf.js for better performance
const loadHtml2Pdf = () => import("html2pdf.js");

import PDFInvoiceLayout from "@/components/PdfInvoice/PDFInvoiceLayout";

export default function InvoiceHistoryPage() {
  const { token, logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg("You must be logged in to view invoices.");
      return;
    }

    const fetchInvoices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Failed to fetch invoices. Status: ${res.status}, Message: ${text}`
          );
        }

        const data = await res.json();

        // Expecting data.invoices array per your backend response
        setInvoices(Array.isArray(data) ? data : data.invoices || []);
        setErrorMsg(null);
      } catch (error) {
        setErrorMsg("Failed to load invoices. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete invoice");

      setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
    } catch {
      alert("Failed to delete invoice");
    }
  };

  const handleDownloadPDF = async (invoice) => {
    const html2pdf = (await loadHtml2Pdf()).default;

    const htmlString = renderToStaticMarkup(
      <PDFInvoiceLayout
        invoiceInfo={invoice}
        items={invoice.items}
        currency={invoice.currency}
        total={invoice.total}
        logo={invoice.logo}
      />
    );

    const opt = {
      margin: 0.5,
      filename: `${invoice.invoiceNumber || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(htmlString).save();
  };

  const handleView = (invoice) => {
    // Temporary: just alert JSON; replace with modal or page later
    alert(JSON.stringify(invoice, null, 2));
  };

  return (
    <>
      <header className="navbar">
        <div className="container">
          <Link href="/" className="logo-link">
            <h1 className="logo">InvoiceGen</h1>
          </Link>

          <button className="menu-toggle" onClick={toggleMenu}>
            ☰
          </button>

          <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            <Link href="#features">Features</Link>
            <Link href="/invoice">Generate</Link>
            <Link href="/contact-us">Contact</Link>

            {token ? (
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            ) : (
              <Link href="/login">
                <button className="login-btn">Login</button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 custom-table-container">
          <h1 className="text-3xl font-semibold text-blue-600 mb-6 his-head">
            📑 Your Invoice History
          </h1>

          {loading ? (
            <p className="text-gray-500 font-semibold">Loading invoices...</p>
          ) : errorMsg ? (
            <p className="text-red-600 font-semibold">{errorMsg}</p>
          ) : invoices.length === 0 ? (
            <p className="no-invoices-found">No invoices found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse custom-table text-sm overflow-hidden">
                <thead className="custom-table-head">
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Due</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, idx) => (
                    <tr key={invoice._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{invoice.clientName || invoice.client || "N/A"}</td>
                      <td>{invoice.invoiceNumber || "N/A"}</td>
                      <td>
                        <span className="badge">{invoice.date || "-"}</span>
                      </td>
                      <td>
                        <span className="badge badge-due">
                          {invoice.dueDate || "-"}
                        </span>
                      </td>
                      <td className="amount">
                        {invoice.currency || ""}{" "}
                        {invoice.total != null
                          ? Number(invoice.total).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "-"}
                      </td>

                      <td>
                        <Link href={`/invoice/view/${invoice._id}`}>
                          <button className="view-btn">View</button>
                        </Link>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(invoice._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="download-pdf-btn"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          📄 Export PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
