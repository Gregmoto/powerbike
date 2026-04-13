"use client";

import { useState, useEffect } from "react";

interface HeadlineTest {
  id: string;
  articleId: string;
  titleB: string;
  viewsA: number;
  viewsB: number;
  winner: string | null;
  active: boolean;
  createdAt: string;
  article: { title: string; slug: string };
}

interface Article {
  id: string;
  title: string;
}

export default function AbTesterPage() {
  const [tests, setTests] = useState<HeadlineTest[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleId, setArticleId] = useState("");
  const [titleB, setTitleB] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadTests() {
    const res = await fetch("/api/admin/ab-tests");
    if (res.ok) setTests(await res.json());
    setLoading(false);
  }

  async function loadArticles() {
    const res = await fetch("/api/admin/articles");
    if (res.ok) {
      const data = await res.json();
      setArticles(data.map((a: Article) => ({ id: a.id, title: a.title })));
    }
  }

  useEffect(() => {
    loadTests();
    loadArticles();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!articleId || !titleB) return;
    setCreating(true);
    const res = await fetch("/api/admin/ab-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, titleB }),
    });
    if (res.ok) {
      setArticleId("");
      setTitleB("");
      await loadTests();
    }
    setCreating(false);
  }

  async function setWinner(id: string, winner: string) {
    await fetch(`/api/admin/ab-tests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner, active: false }),
    });
    await loadTests();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/ab-tests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    await loadTests();
  }

  async function deleteTest(id: string) {
    if (!confirm("Ta bort detta A/B-test?")) return;
    await fetch(`/api/admin/ab-tests/${id}`, { method: "DELETE" });
    await loadTests();
  }

  function winRate(views: number, total: number) {
    if (total === 0) return "0";
    return ((views / total) * 100).toFixed(1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">A/B-tester på rubriker</h1>

      {/* Skapa nytt test */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Skapa nytt test</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Artikel</label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Välj artikel...</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Variant B (rubrik)</label>
            <input
              value={titleB}
              onChange={(e) => setTitleB(e.target.value)}
              required
              placeholder="Alternativ rubrik..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-semibold transition"
            >
              {creating ? "Skapar..." : "Skapa test"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista tester */}
      {loading ? (
        <p className="text-zinc-400">Laddar...</p>
      ) : tests.length === 0 ? (
        <p className="text-zinc-500 text-sm">Inga A/B-tester ännu.</p>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const total = test.viewsA + test.viewsB;
            return (
              <div key={test.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-zinc-400 text-xs mb-1">{test.article.title}</p>
                    {test.winner && (
                      <span className="inline-block text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full mb-2">
                        Vinnare: {test.winner}
                      </span>
                    )}
                    {!test.winner && test.active && (
                      <span className="inline-block text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full mb-2">Aktivt</span>
                    )}
                    {!test.active && !test.winner && (
                      <span className="inline-block text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full mb-2">Pausat</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTest(test.id)}
                    className="text-zinc-600 hover:text-red-400 text-xs transition"
                  >
                    Ta bort
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`rounded-lg p-4 border ${test.winner === "A" ? "border-green-500/50 bg-green-900/10" : "border-zinc-700 bg-zinc-800/50"}`}>
                    <p className="text-xs text-zinc-500 mb-1">Variant A (original)</p>
                    <p className="text-white text-sm font-medium mb-2">{test.article.title}</p>
                    <p className="text-2xl font-bold text-orange-400">{winRate(test.viewsA, total)}%</p>
                    <p className="text-xs text-zinc-500 mt-1">{test.viewsA} visningar</p>
                  </div>
                  <div className={`rounded-lg p-4 border ${test.winner === "B" ? "border-green-500/50 bg-green-900/10" : "border-zinc-700 bg-zinc-800/50"}`}>
                    <p className="text-xs text-zinc-500 mb-1">Variant B</p>
                    <p className="text-white text-sm font-medium mb-2">{test.titleB}</p>
                    <p className="text-2xl font-bold text-orange-400">{winRate(test.viewsB, total)}%</p>
                    <p className="text-xs text-zinc-500 mt-1">{test.viewsB} visningar</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!test.winner && (
                    <>
                      <button
                        onClick={() => setWinner(test.id, "A")}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg px-3 py-1.5 transition"
                      >
                        Välj A som vinnare
                      </button>
                      <button
                        onClick={() => setWinner(test.id, "B")}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg px-3 py-1.5 transition"
                      >
                        Välj B som vinnare
                      </button>
                      <button
                        onClick={() => toggleActive(test.id, !test.active)}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg px-3 py-1.5 transition"
                      >
                        {test.active ? "Pausa test" : "Återuppta test"}
                      </button>
                    </>
                  )}
                  <span className="text-xs text-zinc-600 self-center ml-auto">{total} totala visningar</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
