"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./AdminLayout.css"; // You'll create this CSS

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>Dashboard</h2>
        <nav>
          <ul>
            <li className={pathname === "/admin" ? "active" : ""}>
              <Link href="/admin">📊 Stats</Link>
            </li>
            <li className={pathname === "/admin/users" ? "active" : ""}>
              <Link href="/admin/users">👥 Users</Link>
            </li>
            <li className={pathname === "/admin/invoices" ? "active" : ""}>
              <Link href="/admin/invoices">🧾 Invoices</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
