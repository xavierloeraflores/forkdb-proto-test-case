import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Priority fork | ForkDB",
  description: "Prioritize your tasks with Low, Medium, and High priority.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="workspace">
          <header className="page-header">
            <span className="eyebrow">FORKDB / PRIORITY</span>
            <h1>Priority fork</h1>
            <p>Choose what needs your attention first.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
