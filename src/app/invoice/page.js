"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import "../globals.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header/page";
import PDFInvoiceLayout from "@/components/PdfInvoice/PDFInvoiceLayout";
import { renderToStaticMarkup } from "react-dom/server";

export default function InvoicePage() {
  const { token, logout, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔧 API base (env fallback)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 👇 Edit mode support
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");
  const isEditMode = Boolean(invoiceId);

  // 📦 Data
  const [invoices, setInvoices] = useState([]);
  const [paymentMode, setPaymentMode] = useState("");
 // history (if needed elsewhere)
  const [items, setItems] = useState([
    { description: "", quantity: 0, price: 0 },
  ]);
  const [invoiceInfo, setInvoiceInfo] = useState({
    companyName: "",
    clientName: "",
    invoiceNumber: "",
    date: "",
    dueDate: "",
    notes: "",
    paymentTerms: "",
    paymentMode: "",
  });
  const [currency, setCurrency] = useState("USD");
  const [logo, setLogo] = useState("");

  // 💸 Discount state
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState("percent"); // "percent" | "amount"
  const [discountValue, setDiscountValue] = useState(0);

  const router = useRouter();
  const printRef = useRef();

  // 📥 Load existing invoice when editing
  useEffect(() => {
    const loadForEdit = async () => {
      try {
        if (!isEditMode || !token) return;
        const res = await fetch(`${API_BASE}/api/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        setInvoiceInfo({
          companyName: data.companyName || "",
          clientName: data.clientName || "",
          invoiceNumber: data.invoiceNumber || "",
          date: data.date || "",
          dueDate: data.dueDate || "",
          notes: data.notes || "",
          paymentTerms: data.paymentTerms || "",
          paymentMode: data.paymentMode || "",
          
        });
        setCurrency(data.currency || "USD");
        setItems(Array.isArray(data.items) ? data.items : []);
        setLogo(data.logo || "");

        // If the invoice being edited has discount fields, hydrate them
        if (
          data.discountType &&
          (data.discountValue || data.discountValue === 0)
        ) {
          setShowDiscount(true);
          setDiscountType(
            data.discountType === "amount" ? "amount" : "percent"
          );
          setDiscountValue(Number(data.discountValue) || 0);
        } else {
          setShowDiscount(false);
          setDiscountType("percent");
          setDiscountValue(0);
        }
      } catch (err) {
        console.error("Error loading invoice for edit:", err);
      }
    };
    loadForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, invoiceId, token, API_BASE]);

  // 🔐 Auth check
  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [token, loading, router]);

  // 💾 Load defaults from localStorage (skip if editing so we don't override fetched data)
  useEffect(() => {
    if (isEditMode) return; // avoid flicker/override when editing existing invoice

    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("invoiceData")
        : null;
    const savedLogo =
      typeof window !== "undefined"
        ? localStorage.getItem("invoiceLogo")
        : null;
    const savedDefault =
      typeof window !== "undefined"
        ? localStorage.getItem("defaultInvoiceInfo")
        : null;

    if (saved) {
      try {
        const {
          items: sItems,
          invoiceInfo: sInfo,
          currency: sCurrency,
        } = JSON.parse(saved);

        if (Array.isArray(sItems)) setItems(sItems);

        if (sInfo) {
          setInvoiceInfo({
            ...sInfo,
            paymentTerms: sInfo.paymentTerms || "",
            paymentMode: sInfo.paymentMode || "", // ✅ added
          });
        }

        if (sCurrency) setCurrency(sCurrency);
      } catch (e) {
        console.warn("Failed parsing saved invoiceData");
      }
    } else if (savedDefault) {
      try {
        const defaultInfo = JSON.parse(savedDefault);
        setInvoiceInfo((prev) => ({
          ...prev,
          ...defaultInfo,
          paymentMode: defaultInfo.paymentMode || "", // ✅ added
        }));
      } catch (e) {
        console.warn("Failed parsing defaultInvoiceInfo");
      }
    }

    if (savedLogo) setLogo(savedLogo);
  }, [isEditMode]);

  // 💽 Persist to localStorage (only for create mode)
  useEffect(() => {
    if (isEditMode) return;
    const payload = JSON.stringify({ items, invoiceInfo, currency });
    localStorage.setItem("invoiceData", payload);
  }, [items, invoiceInfo, currency, isEditMode]);

  useEffect(() => {
    if (!isEditMode && logo) localStorage.setItem("invoiceLogo", logo);
  }, [logo, isEditMode]);

  // 📜 Optionally fetch invoices list (kept from first file)
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvoices(data || []);
    } catch (err) {
      console.error("Error loading history", err);
    }
  };

  useEffect(() => {
    if (token) fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 🧮 Helpers
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const parsedValue =
      field === "quantity" || field === "price"
        ? parseFloat(value) || 0
        : value;
    newItems[index][field] = parsedValue;
    setItems(newItems);
  };

  const handleInvoiceChange = (field, value) => {
    setInvoiceInfo({ ...invoiceInfo, [field]: value });
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 0, price: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const getCurrencySymbol = () => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      PKR: "₨",
      INR: "₹",
      JPY: "¥",
      CNY: "¥",
      AUD: "A$",
      CAD: "C$",
    };
    return symbols[currency] || currency;
  };

  const formatMoney = (amount) =>
    `${getCurrencySymbol()} ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const computeSubtotal = () =>
    items.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
      0
    );

  const computeDiscountAmount = (subtotal) => {
    if (!showDiscount) return 0;
    const raw =
      discountType === "percent"
        ? ((Number(discountValue) || 0) / 100) * subtotal
        : Number(discountValue) || 0;
    return Math.max(0, Math.min(raw, subtotal));
  };

  const computeTotals = () => {
    const subtotal = computeSubtotal();
    const discountAmt = computeDiscountAmount(subtotal);
    const total = Math.max(0, subtotal - discountAmt);
    return { subtotal, discountAmt, total };
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      alert("Failed to read image. Please try a different one.");
    };
    reader.readAsDataURL(file);
  };

  const handleExportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const { subtotal, discountAmt, total } = computeTotals();

    const htmlString = renderToStaticMarkup(
      <PDFInvoiceLayout
        invoice={{
          logo,
          ...invoiceInfo,
          items,
          paymentMode,
          currency,
          total: formatMoney(total),
          subtotal: formatMoney(subtotal),
          discount: showDiscount ? formatMoney(discountAmt) : formatMoney(0),
          discountMeta: { showDiscount, discountType, discountValue },
        }}
      />
    );

    const opt = {
      margin: 0.5,
      filename: `${invoiceInfo.invoiceNumber || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(htmlString).save();
  };

  const handleSaveToDB = async () => {
    try {
      if (!token) {
        alert("⚠️ You are not logged in.");
        return;
      }

      const { subtotal, discountAmt, total } = computeTotals();

      const payload = {
        companyName: invoiceInfo.companyName?.trim(),
        clientName: invoiceInfo.clientName?.trim(),
        invoiceNumber: invoiceInfo.invoiceNumber?.trim(),
        date: invoiceInfo.date,
        dueDate: invoiceInfo.dueDate,
        notes: invoiceInfo.notes || "",
        paymentTerms: invoiceInfo.paymentTerms || "",
        paymentMode: invoiceInfo.paymentMode || "",
        currency: currency || "USD",
        items: items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmt.toFixed(2)),
        discountType: showDiscount ? discountType : null,
        discountValue: showDiscount ? Number(discountValue) : null,
        total: Number(total.toFixed(2)),
        logo: logo || "",
      };

      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `${API_BASE}/api/invoices/${invoiceId}`
        : `${API_BASE}/api/invoices`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || "Failed to save invoice");
      }

      alert(
        isEditMode
          ? "✅ Invoice updated successfully!"
          : "✅ Invoice saved successfully!"
      );

      // After save/update, go to history
      router.push("/invoice/history");
    } catch (error) {
      console.error("Error saving invoice:", error.message);
      alert(error.message || "Error saving invoice");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      alert("✅ Invoice deleted");
      await fetchInvoices();
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete invoice");
    }
  };

  // 🔁 Reset & ⭐ Default
  const handleReset = () => {
    setItems([{ description: "", quantity: 0, price: 0 }]);
    setInvoiceInfo({
      companyName: "",
      clientName: "",
      invoiceNumber: "",
      date: "",
      dueDate: "",
      notes: "",
      paymentTerms: "",
      paymentMode: "",
    });
    setCurrency("USD");
    setLogo("");
    setShowDiscount(false);
    setDiscountType("percent");
    setDiscountValue(0);
    localStorage.removeItem("invoiceData");
    localStorage.removeItem("invoiceLogo");
  };

  const handleSetDefault = () => {
    localStorage.setItem("defaultInvoiceInfo", JSON.stringify(invoiceInfo));
    alert("⭐ Default invoice info saved!");
  };

  if (checkingAuth)
    return (
      <div className="auth-loader">
        <div className="spinner" />
        <p>...</p>
      </div>
    );

  const { subtotal, discountAmt, total } = computeTotals();

  return (
    <>
      <Head>
        <title>{isEditMode ? "Edit Invoice" : "Invoice Generator"}</title>
      </Head>
      <Header />
      <div className="invoice-page">
        <h1 className="title">
          {isEditMode ? "✏️ Edit Invoice" : "🧾 Invoice"}
        </h1>

        <div className="invoice-container" ref={printRef}>
          <div className="logo-section print-show">
            {logo && <img src={logo} alt="Company Logo" className="logo-img" />}
            <div className="print-hide">
              <label className="upload-label">
                <span className="upload-text">+ Add Your Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
          </div>

          <div className="invoice-grid">
            <input
              type="text"
              placeholder="Who is this from?"
              value={invoiceInfo.companyName}
              onChange={(e) =>
                handleInvoiceChange("companyName", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Who is this to?"
              value={invoiceInfo.clientName}
              onChange={(e) =>
                handleInvoiceChange("clientName", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Invoice #"
              value={invoiceInfo.invoiceNumber}
              onChange={(e) =>
                handleInvoiceChange("invoiceNumber", e.target.value)
              }
            />
            <div className="date-fields">
              <div className="date-input">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={invoiceInfo.date}
                  onChange={(e) => handleInvoiceChange("date", e.target.value)}
                />
              </div>
              <div className="date-input">
                <label>Due Date</label>
                <input
                  type="date"
                  value={invoiceInfo.dueDate}
                  onChange={(e) =>
                    handleInvoiceChange("dueDate", e.target.value)
                  }
                />
              </div>

              {/* Currency + Payment Terms side-by-side */}
              <div
                className="currency-select"
                style={{ display: "flex", gap: 10 }}
              >
                <div style={{ flex: 1 }}>
                  <label>Currency</label>
                  <select
                    value={currency}
                    className="all-label "
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD – $</option>
                    <option value="EUR">EUR – €</option>
                    <option value="GBP">GBP – £</option>
                    <option value="PKR">PKR – ₨</option>
                    <option value="INR">INR – ₹</option>
                    <option value="JPY">JPY – ¥</option>
                    <option value="CNY">CNY – ¥</option>
                    <option value="AUD">AUD – A$</option>
                    <option value="CAD">CAD – C$</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label>Payment Terms</label>
                <input
                  type="text"
                  className="all-label "
                  placeholder="e.g. Net 15, Net 30"
                  value={invoiceInfo.paymentTerms}
                  onChange={(e) =>
                    handleInvoiceChange("paymentTerms", e.target.value)
                  }
                />
              </div>

              {/* New Payment Mode Dropdown */}
              <div style={{ flex: 1 }}>
                <label>Payment Mode</label>
                <select
                  value={invoiceInfo.paymentMode}
                  className="all-label "
                  onChange={(e) =>
                    handleInvoiceChange("paymentMode", e.target.value)
                  }
                >
                  <option value="">Select Payment Mode</option>
                  <option value="full">Full Payment</option>
                  <option value="partial">Partial</option>
                  <option value="advance">Advance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="items-section">
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity === 0 ? "" : item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price === 0 ? "" : item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", e.target.value)
                  }
                />
                <button onClick={() => removeItem(index)}>✕</button>
              </div>
            ))}
            <button className="add-btn" onClick={addItem}>
              + Add Item
            </button>
          </div>

          {/* Summary */}
          <div className="summary-block" style={{ marginTop: 20 }}>
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            {/* Discount row */}
            <div
              className="summary-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {showDiscount ? (
                  <>
                    <span>Discount</span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        style={{ width: 90, padding: 6 }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDiscountType((t) =>
                            t === "percent" ? "amount" : "percent"
                          )
                        }
                        title="Toggle % / Amount"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          cursor: "pointer",
                          background: "#fff",
                        }}
                      >
                        {discountType === "percent" ? "%" : getCurrencySymbol()}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDiscount(false);
                          setDiscountValue(0);
                          setDiscountType("percent");
                        }}
                        title="Remove Discount"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          cursor: "pointer",
                          background: "#fff",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDiscount(true)}
                    className="link-btn"
                    style={{
                      color: "#0e9f6e",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    + Discount
                  </button>
                )}
              </div>

              <span style={{ minWidth: 120, textAlign: "right" }}>
                {showDiscount
                  ? `- ${formatMoney(discountAmt)}`
                  : formatMoney(0)}
              </span>
            </div>

            <div
              className="summary-row total"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          <textarea
            placeholder="Additional Notes"
            value={invoiceInfo.notes}
            onChange={(e) => handleInvoiceChange("notes", e.target.value)}
            style={{ marginTop: 16 }}
          />

          <div
            className="action-buttons print-hide"
            style={{ display: "flex", gap: 10, marginTop: 16 }}
          >
            <button onClick={handleReset} className="reset-btn">
              🔄 Reset
            </button>
            <button onClick={handleSaveToDB} className="save-btn">
              {isEditMode ? "💾 Update" : "💾 Save"}
            </button>
            <button onClick={handleExportPDF}>📄 Export PDF</button>
            <button onClick={handleSetDefault} className="default-btn">
              ⭐ Set Default
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
