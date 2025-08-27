"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/Admin/AdminLayout";
import "./users.css";

export default function AdminUsersPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/unauthorized");
    }
  }, [isAdmin, loading]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/users?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error loading users:", err.message);
      }
    };

    if (isAdmin) fetchUsers();
  }, [page, isAdmin]);

  if (loading || !isAdmin) return <p>Checking admin access...</p>;

  return (
    <AdminLayout>
        <h1 className="admin-title">👤 User Management</h1>
      <div className="admin-dashboard">

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
      </div>
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          ◀ Previous
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={page === idx + 1 ? "active" : ""}
            onClick={() => setPage(idx + 1)}
            disabled={page === idx + 1}
          >
            {idx + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next ▶
        </button>
      </div>
    </AdminLayout>
  );
}
