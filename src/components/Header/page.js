"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { token, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="navbar">
      <div className="container">
        {/* Logo */}
        <Link href="/" className="logo-link">
          <h1 className="logo">InvoiceGen</h1>
        </Link>

        {/* Hamburger Menu Button */}
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>

        {/* Navigation Links */}
        <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link href="#features">Features</Link>
          <Link href="/invoice">Generate</Link>
          <Link href="/invoice/history">History</Link>
          <Link href="/contact-us">Contact</Link>

          {/* Show Admin Dashboard for admin users */}
          {user?.role === "admin" && (
            <Link href="/admin">
              <button className="admin-btn">Admin Dashboard</button>
            </Link>
          )}

          {/* Auth Buttons */}
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
  );
}
