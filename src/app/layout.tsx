import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Categories fork | ForkDB",
  description: "Organize tasks by category in an isolated ForkDB database.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="workspace">
          <header className="page-header">
            <span className="eyebrow">FORKDB / CATEGORIES</span>
            <h1>Categories fork</h1>
            <p>Give every task a place. Your categories are saved in this fork.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
