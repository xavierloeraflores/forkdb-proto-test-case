import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Due dates fork | ForkDB",
  description: "Plan your tasks with editable due dates.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="workspace">
          <header className="page-header">
            <span className="eyebrow">FORKDB / 01</span>
            <h1>Due dates fork</h1>
            <p>Give every task its day. Set a deadline, adjust your plans, keep moving.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
