import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks",
  description: "A simple shared to-do list.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="workspace">
          <header className="page-header">
            <span className="eyebrow">TO-DO LIST</span>
            <h1>Tasks</h1>
            <p>A little less to keep in your head.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
