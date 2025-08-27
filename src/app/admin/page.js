"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "./admin.css";
import AdminLayout from "@/components/Admin/AdminLayout";

export default function AdminDashboard() {
  const { isAdmin, loading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push("/unauthorized");
    }
  }, [loading, user, isAdmin]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔐 Token after redirect:", token);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ Failed to fetch stats:", err.message);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (loading || !isAdmin)
    return (
      <div className="admin-loader">
        <p>Checking admin access...</p>
      </div>
    );

  return (
    <AdminLayout>
      <div className="admin-container">
        <h1 className="admin-title">🛠️ Admin Dashboard</h1>

        {stats ? (
          <div className="admin-cards">
            <div className="admin-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
            <div className="admin-card">
              <h3>Total Invoices</h3>
              <p>{stats.totalInvoices}</p>
            </div>
            {/* <div className="admin-card">
              <h3>Total Revenue</h3>
              <p>${stats.totalRevenue.toFixed(2)}</p>
            </div> */}
          </div>
        ) : (
          <div className="admin-loader">
            <p>Loading stats...</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
