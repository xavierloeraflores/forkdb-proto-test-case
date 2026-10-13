import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks | ForkDB",
  description: "Manage tasks with due dates, priorities, completion, and categories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="workspace">
          <header className="page-header">
            <span className="eyebrow">FORKDB / MERGED DEMOS</span>
            <h1>Tasks</h1>
            <p>Due dates, priorities, completion, and categories in one task list.</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
