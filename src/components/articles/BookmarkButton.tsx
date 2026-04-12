"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  articleId: string;
}

export default function BookmarkButton({ articleId }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/reader/me")
      .then((r) => r.json())
      .then((data) => {
        setLoggedIn(!!data);
        if (data) {
          // Kolla om artikeln är bokmärkt
          fetch("/api/reader/bookmarks")
            .then((r) => r.json())
            .then((articles) => {
              if (Array.isArray(articles)) {
                setBookmarked(articles.some((a: { id: string }) => a.id === articleId));
              }
            });
        }
      });
  }, [articleId]);

  async function toggle() {
    if (!loggedIn || loading) return;
    setLoading(true);
    const res = await fetch("/api/reader/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });
    const data = await res.json();
    setBookmarked(data.bookmarked);
    setLoading(false);
  }

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <Link
        href="/logga-in"
        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Spara
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-2 rounded-lg transition ${
        bookmarked
          ? "bg-orange-500/20 border-orange-500 text-orange-400"
          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
      }`}
    >
      <svg className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {bookmarked ? "Sparad" : "Spara"}
    </button>
  );
}
