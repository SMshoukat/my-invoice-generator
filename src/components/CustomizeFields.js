"use client";

import { useEffect, useState } from "react";

export default function CustomizeFields() {
  const [fields, setFields] = useState([
    { name: "clientName", label: "Client Name", defaultValue: "" },
    { name: "clientAddress", label: "Client Address", defaultValue: "" },
    { name: "clientEmail", label: "Client Email", defaultValue: "" },
    { name: "companyName", label: "Company Name", defaultValue: "" },
    { name: "invoiceNumber", label: "Invoice Number", defaultValue: "" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/field-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.fields) {
        setFields((prev) =>
          prev.map((f) => {
            const found = data.fields.find((df) => df.name === f.name);
            return found ? found : f;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function saveSettings() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/field-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fields }),
      });
      await res.json();
      alert("Settings saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function updateField(index, key, value) {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[index][key] = value;
      return newFields;
    });
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: 8 }}>
      <h3>Customize Invoice Fields</h3>
      {fields.map((field, i) => (
        <div key={field.name} style={{ marginBottom: "1rem" }}>
          <label>
            Field Name: <strong>{field.name}</strong>
          </label>
          <br />
          <input
            type="text"
            placeholder="Label"
            value={field.label}
            onChange={(e) => updateField(i, "label", e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <input
            type="text"
            placeholder="Default value"
            value={field.defaultValue}
            onChange={(e) => updateField(i, "defaultValue", e.target.value)}
          />
        </div>
      ))}
      <button onClick={saveSettings} disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
