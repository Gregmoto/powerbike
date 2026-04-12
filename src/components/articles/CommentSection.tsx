"use client";

import { useEffect, useState } from "react";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Props {
  articleId: string;
}

export default function CommentSection({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/articles/${articleId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [articleId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message);
        setName("");
        setEmail("");
        setContent("");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Något gick fel, försök igen.");
    }
  }

  return (
    <section className="mt-12 border-t border-zinc-800 pt-10">
      <h2 className="text-white text-xl font-bold uppercase tracking-wider border-l-4 border-orange-500 pl-3 mb-6">
        Kommentarer {comments.length > 0 && <span className="text-zinc-500 font-normal text-base ml-2">({comments.length})</span>}
      </h2>

      {/* Kommentarslista */}
      {comments.length > 0 ? (
        <div className="space-y-5 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm">
                  {c.name[0].toUpperCase()}
                </div>
                <span className="text-white font-semibold text-sm">{c.name}</span>
                <span className="text-zinc-600 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 text-sm mb-8">Inga kommentarer än — bli först!</p>
      )}

      {/* Formulär */}
      {status === "done" ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-green-400 text-sm">
          {message}
        </div>
      ) : (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold text-sm">Lämna en kommentar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ditt namn *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
            />
            <input
              type="email"
              placeholder="E-post (visas ej) *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
          <textarea
            placeholder="Din kommentar... *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            maxLength={1000}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition resize-none"
          />
          {status === "error" && (
            <p className="text-red-400 text-xs">{message}</p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-zinc-600 text-xs">Kommentarer granskas innan publicering.</p>
            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition"
            >
              {status === "sending" ? "Skickar..." : "Skicka kommentar"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
