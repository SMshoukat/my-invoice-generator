import Head from "next/head";
import "./globals.css";
import Header from "@/components/Header/page";

export default function Home() {
  return (
    <>
      <Head>
        <title>Invoice Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <section className="hero">
        <div className="container">
          <h2>Create Invoices in Seconds</h2>
          <p>Fast, simple, and professional invoice generation — for free.</p>
          <a href="/invoice" className="btn-primary">
            Start Generating
          </a>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h3>Why Use InvoiceGen?</h3>
          <div className="feature-list">
            <div className="feature-card">
              <h4>⚡ Fast & Easy</h4>
              <p>No login required. Just fill and download.</p>
            </div>
            <div className="feature-card">
              <h4>📄 Export to PDF</h4>
              <p>Download clean, professional invoices instantly.</p>
            </div>
            <div className="feature-card">
              <h4>🎯 100% Free</h4>
              <p>Free forever. No hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} InvoiceGen. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
