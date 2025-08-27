"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/Admin/AdminLayout";
import InvoiceFormModal from "@/components/Admin/InvoiceFormModal";
import PDFInvoiceLayout from "@/components/PdfInvoice/PDFInvoiceLayout";
import "./invoices.css";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [company, setCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [showPDFModal, setShowPDFModal] = useState(false);

  // ✅ 1. Load companies (distinct list)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/invoice-companies",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        // ✅ Expecting: { companies: ["Company A", "Company B", ...] }
        if (Array.isArray(data.companies)) {
          const filtered = data.companies.filter((c) => c && c.trim() !== "");
          setCompanies(filtered);
        } else {
          console.warn("⚠️ Unexpected company list structure:", data);
        }
      } catch (err) {
        console.error("Error fetching companies", err);
      }
    };
    fetchCompanies();
  }, []);

  // ✅ 2. Load invoices based on selected company
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        let url = `http://localhost:5000/api/admin/invoices`;
        if (company) {
          url += `?company=${encodeURIComponent(company)}`;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error("Error fetching invoices", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [company]);

  // ✅ 3. Save handler
  const handleSave = async (formData) => {
    try {
      const url = editMode
        ? `http://localhost:5000/api/admin/invoices/${selectedInvoice._id}`
        : `http://localhost:5000/api/admin/invoices`;
      const method = editMode ? "PUT" : "POST";

      const payload = {
        ...formData,
        companyName: formData.companyName?.trim(),
      };

      if (editMode && selectedInvoice?.user?._id) {
        payload.user = selectedInvoice.user._id;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok || res.status === 201) {
        alert(editMode ? "Invoice updated" : "Invoice added");
        setShowModal(false);
        setSelectedInvoice(null);
        setEditMode(false);

        // Refresh invoices after save
        const updatedRes = await fetch(
          `http://localhost:5000/api/admin/invoices${
            company ? `?company=${encodeURIComponent(company)}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedData = await updatedRes.json();
        setInvoices(updatedData.invoices || []);
      } else {
        alert(result.error || "Error saving invoice");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save invoice");
    }
  };

  // ✅ 4. Delete invoice
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/invoices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Invoice deleted");
        setInvoices((prev) => prev.filter((i) => i._id !== id));
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <AdminLayout>
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Admin Invoices</h2>

          <div className="filter-section">
            <label>Select Company: </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          <table className="invoice-table">
            <thead className="invoice-table-header">
              <tr>
                <th>Logo</th>
                <th>Invoice #</th>
                <th>User</th>
                <th>Client</th>
                <th>Company</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr className="invoice-table-row" key={inv._id}>
                  <td>
                    {inv.logo ? (
                      <img
                        src={inv.logo}
                        alt="Logo"
                        style={{ width: "50px", height: "auto" }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="invoice-table-cell">{inv.invoiceNumber}</td>
                  <td className="invoice-table-cell">
                    {inv.user?.name || inv.user?.email || "—"}
                  </td>
                  <td className="invoice-table-cell">{inv.clientName}</td>
                  <td className="invoice-table-cell">{inv.companyName}</td>
                  <td className="invoice-table-cell">
                    {inv.currency}{" "}
                    {inv.total != null
                      ? Number(
                          inv.total.toString().replace(/[^0-9.]/g, "")
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"}
                  </td>

                  <td className="invoice-table-cell">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="invoice-table-cell">
                    {/* <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowPDFModal(true);
                      }}
                    >
                      🔍
                    </button> */}
                    {/* <div className="btn-wrapper"> */}
                    <a
                      href={`/admin/invoices/${inv._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      🔍
                    </a>
                    {/* </div> */}

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(inv._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PDF Modal */}
      {showPDFModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content pdf-modal">
            <div className="clos-btn">
              <button
                className="lux-delete"
                onClick={() => setShowPDFModal(false)}
              >
                ⨉
              </button>
            </div>
            <PDFInvoiceLayout invoice={selectedInvoice} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <InvoiceFormModal
          mode="edit"
          initialData={selectedInvoice}
          onClose={() => {
            setShowModal(false);
            setSelectedInvoice(null);
            setEditMode(false);
          }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
