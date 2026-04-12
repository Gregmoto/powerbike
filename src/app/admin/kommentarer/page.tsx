"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
  article: { title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/comments")
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function approve(id: string) {
    await fetch("/api/admin/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: true }),
    });
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, approved: true } : c));
  }

  async function reject(id: string) {
    await fetch("/api/admin/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: false }),
    });
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, approved: false } : c));
  }

  async function remove(id: string) {
    if (!confirm("Radera kommentaren?")) return;
    await fetch("/api/admin/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = comments.filter((c) => {
    if (filter === "pending") return !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const pendingCount = comments.filter((c) => !c.approved).length;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Kommentarer</h1>
          {pendingCount > 0 && (
            <p className="text-orange-400 text-sm mt-1">{pendingCount} inväntar granskning</p>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Alla" : f === "pending" ? "Väntar" : "Godkända"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-500">Laddar...</p>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-500">Inga kommentarer.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className={`bg-zinc-900 border rounded-xl p-5 ${c.approved ? "border-zinc-800" : "border-orange-500/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-semibold text-sm">{c.name}</span>
                    <span className="text-zinc-600 text-xs">{c.email}</span>
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="text-zinc-600 text-xs">
                      {new Date(c.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                    {!c.approved && (
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">Väntar</span>
                    )}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-2">{c.content}</p>
                  <Link href={`/artiklar/${c.article.slug}`} className="text-zinc-500 text-xs hover:text-orange-400 transition">
                    → {c.article.title}
                  </Link>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!c.approved ? (
                    <button
                      onClick={() => approve(c.id)}
                      className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Godkänn
                    </button>
                  ) : (
                    <button
                      onClick={() => reject(c.id)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Dölj
                    </button>
                  )}
                  <button
                    onClick={() => remove(c.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    Radera
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
