"use client";

import { useParams } from "next/navigation";

export default function AgentPage() {
  const { id } = useParams();

  return (
    <main className="container py-16 lg:px-80">
      <p>Agent page...</p>
    </main>
  );
}
