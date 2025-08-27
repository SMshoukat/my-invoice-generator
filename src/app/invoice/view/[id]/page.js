// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter, useParams } from "next/navigation";
// import PDFInvoiceLayout from "@/components/PdfInvoice/PDFInvoiceLayout";

// export default function InvoiceViewPage() {
//   const { id } = useParams();
//   const { token } = useAuth();
//   const router = useRouter();

//   const [invoice, setInvoice] = useState(null);
//   const [editableInvoice, setEditableInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       setErrorMsg("You must be logged in to view this invoice.");
//       setLoading(false);
//       return;
//     }

//     const fetchInvoice = async () => {
//       try {
//         const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(
//             `Failed to fetch invoice. Status: ${res.status}, Message: ${text}`
//           );
//         }

//         const data = await res.json();
//         setInvoice(data);
//         setEditableInvoice(data);
//         setErrorMsg(null);
//       } catch (error) {
//         setErrorMsg("Failed to load invoice. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInvoice();
//   }, [id, token]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setEditableInvoice((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(editableInvoice),
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to save invoice");
//       }

//       const updatedInvoice = await res.json();
//       setInvoice(updatedInvoice);
//       setEditableInvoice(updatedInvoice);
//       setIsEditing(false);
//       setErrorMsg(null);
//     } catch (error) {
//       setErrorMsg("Failed to save invoice. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <p className="loading-msg">Loading invoice...</p>;
//   if (errorMsg) return <p className="error-msg">{errorMsg}</p>;
//   if (!invoice) return <p className="error-msg">Invoice not found.</p>;

//   return (
//     <main
//       className="invoice-view-container"
//       style={{
//         maxWidth: 700,
//         margin: "auto",
//         padding: 20,
//         fontFamily: "Arial, sans-serif",
//       }}
//     >
//       {!isEditing && (
//         <>
//           <PDFInvoiceLayout invoice={invoice} />
//           <button
//             onClick={() => setIsEditing(true)}
//             style={{
//               marginTop: 20,
//               padding: "10px 20px",
//               backgroundColor: "#0066ff",
//               color: "white",
//               border: "none",
//               borderRadius: 5,
//               cursor: "pointer",
//               fontWeight: "bold",
//               fontSize: 16,
//             }}
//           >
//             Edit Invoice
//           </button>
//         </>
//       )}

//       {isEditing && (
//         <div
//           style={{
//             marginTop: 20,
//             padding: 20,
//             border: "1px solid #ddd",
//             borderRadius: 8,
//             backgroundColor: "#f9f9f9",
//           }}
//         >
//           <h2 style={{ marginBottom: 15 }}>Edit Invoice</h2>

//           <label style={{ display: "block", marginBottom: 10 }}>
//             Client Name:
//             <input
//               name="clientName"
//               value={editableInvoice.clientName || ""}
//               onChange={handleChange}
//               style={{
//                 width: "100%",
//                 padding: 8,
//                 marginTop: 5,
//                 borderRadius: 4,
//                 border: "1px solid #ccc",
//                 fontSize: 16,
//               }}
//             />
//           </label>

//           <label style={{ display: "block", marginBottom: 10 }}>
//             Company Name:
//             <input
//               name="companyName"
//               value={editableInvoice.companyName || ""}
//               onChange={handleChange}
//               style={{
//                 width: "100%",
//                 padding: 8,
//                 marginTop: 5,
//                 borderRadius: 4,
//                 border: "1px solid #ccc",
//                 fontSize: 16,
//               }}
//             />
//           </label>

//           <label style={{ display: "block", marginBottom: 10 }}>
//             Issue Date:
//             <input
//               type="date"
//               name="date"
//               value={
//                 editableInvoice.date ? editableInvoice.date.split("T")[0] : ""
//               }
//               onChange={handleChange}
//               style={{
//                 width: "100%",
//                 padding: 8,
//                 marginTop: 5,
//                 borderRadius: 4,
//                 border: "1px solid #ccc",
//                 fontSize: 16,
//               }}
//             />
//           </label>

//           {/* Add more fields as needed */}

//           <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
//             <button
//               onClick={handleSave}
//               disabled={saving}
//               style={{
//                 flex: 1,
//                 padding: "10px 0",
//                 backgroundColor: "#28a745",
//                 color: "white",
//                 border: "none",
//                 borderRadius: 5,
//                 cursor: saving ? "not-allowed" : "pointer",
//                 fontWeight: "bold",
//                 fontSize: 16,
//               }}
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>

//             <button
//               onClick={() => {
//                 setIsEditing(false);
//                 setEditableInvoice(invoice);
//                 setErrorMsg(null);
//               }}
//               disabled={saving}
//               style={{
//                 flex: 1,
//                 padding: "10px 0",
//                 backgroundColor: "#dc3545",
//                 color: "white",
//                 border: "none",
//                 borderRadius: 5,
//                 cursor: saving ? "not-allowed" : "pointer",
//                 fontWeight: "bold",
//                 fontSize: 16,
//               }}
//             >
//               Cancel
//             </button>
//           </div>

//           {errorMsg && (
//             <p style={{ color: "red", marginTop: 15, fontWeight: "bold" }}>
//               {errorMsg}
//             </p>
//           )}
//         </div>
//       )}
//     </main>
//   );
// }

"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PDFInvoiceLayout from "@/components/PdfInvoice/PDFInvoiceLayout";

export default function InvoiceViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return <p>Loading Invoice...</p>;
  }

  if (!invoice) {
    return <p>Invoice not found.</p>;
  }

  const handleEdit = () => {
    // Save invoice data to localStorage so the invoice page can load it for editing
    localStorage.setItem("editInvoiceData", JSON.stringify(invoice));

    // Redirect to invoice generating page in edit mode
    router.push(`/invoice?page=edit&id=${id}`);
  };

  return (
    <div style={{ padding: "20px" }} className="position-rel">
      {/* PDF Preview */}
      <PDFInvoiceLayout invoice={invoice} />

      {/* Edit Button */}
      <div style={{ marginTop: "20px" }} className="position-abs">
        <button
          onClick={handleEdit}
          style={{
            background: "#0070f3",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Edit Invoice
        </button>
      </div>
    </div>
  );
}
