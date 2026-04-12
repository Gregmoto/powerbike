"use client";

import { useEffect, useState } from "react";

interface Props {
  articleId: string;
}

interface Counts {
  THUMBS_UP: number;
  FIRE: number;
}

export default function ReactionBar({ articleId }: Props) {
  const [counts, setCounts] = useState<Counts>({ THUMBS_UP: 0, FIRE: 0 });
  const [reacted, setReacted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${articleId}/reactions`)
      .then((r) => r.json())
      .then(setCounts)
      .catch(() => {});
  }, [articleId]);

  async function toggle(type: "THUMBS_UP" | "FIRE") {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setReacted((prev) => ({ ...prev, [type]: data.toggled }));
      setCounts((prev) => ({
        ...prev,
        [type]: prev[type] + (data.toggled ? 1 : -1),
      }));
    } finally {
      setLoading(false);
    }
  }

  const buttons = [
    { type: "THUMBS_UP" as const, emoji: "👍", label: "Bra artikel" },
    { type: "FIRE" as const, emoji: "🔥", label: "Het!" },
  ];

  return (
    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-800">
      <span className="text-zinc-500 text-sm">Vad tycker du?</span>
      {buttons.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => toggle(type)}
          disabled={loading}
          title={label}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
            reacted[type]
              ? "bg-orange-500/20 border-orange-500 text-orange-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <span className="text-base">{emoji}</span>
          <span>{counts[type]}</span>
        </button>
      ))}
    </div>
  );
}
