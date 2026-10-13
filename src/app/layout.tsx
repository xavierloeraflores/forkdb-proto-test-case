import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Completion fork | ForkDB",
  description: "Check off tasks in an independent ForkDB database.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="workspace">
          <header className="page-header">
            <span className="eyebrow">FORKDB DEMO / 03</span>
            <h1>Completion fork</h1>
            <p>One task at a time. Check off your progress in this independent copy.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
