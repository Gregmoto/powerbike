"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ef4444");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setMessage("Kategori skapad!");
      router.refresh();
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-white font-semibold mb-5">Ny kategori</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Namn</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
            placeholder="t.ex. Roadtrips"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Färg (badge)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-zinc-400 text-sm">{color}</span>
          </div>
        </div>
        {message && <p className="text-green-400 text-sm">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition"
        >
          {loading ? "Skapar..." : "Skapa kategori"}
        </button>
      </form>
    </div>
  );
}
