"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/reader/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/profil");
    } else {
      setStatus("error");
      setError(data.error);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Logga in
          </h1>
          <p className="text-zinc-400 text-sm mt-2">Välkommen tillbaka.</p>
        </div>

        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">E-post</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition"
            />
          </div>
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Lösenord</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition"
            />
          </div>
          {status === "error" && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {status === "loading" ? "Loggar in..." : "Logga in"}
          </button>
          <p className="text-center text-zinc-500 text-sm">
            Inget konto?{" "}
            <Link href="/bli-medlem" className="text-orange-400 hover:text-orange-300">Bli medlem gratis</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
