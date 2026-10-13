"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <section className="card error-state" role="alert">
      <h2>Couldn&apos;t load your tasks</h2>
      <p>Check the database connection and try again.</p>
      <button className="primary" onClick={() => startTransition(() => { router.refresh(); reset(); })}>Try again</button>
    </section>
  );
}
