"use client";
import { useEffect, useState } from "react";
// import "../../globals.css"; // You can extract modal styles here or keep using global css

export default function InvoiceFormModal({
  mode = "add", // "add" or "edit"
  initialData = {},
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    clientName: "",
    companyName: "",
    total: "",
    logo: "", // ✅ Add this
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        invoiceNumber: initialData.invoiceNumber || "",
        clientName: initialData.clientName || "",
        companyName: initialData.companyName || "",
        total: initialData.total || "",
      });
    }
  }, [initialData, mode]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData); // send data back to parent
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{mode === "edit" ? "Edit Invoice" : "Add Invoice"}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice #</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input
              type="text"
              name="companyName" // ✅ FIXED
              value={formData.companyName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Total Amount</label>
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit">{mode === "edit" ? "Update" : "Add"}</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
