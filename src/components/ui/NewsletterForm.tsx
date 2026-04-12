"use client";

import { useState } from "react";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Något gick fel");
    }
  }

  if (status === "success") {
    return <p className="text-green-400 text-sm">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${compact ? "" : "max-w-md"}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="din@epost.se"
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Prenumerera"}
      </button>
    </form>
  );
}
