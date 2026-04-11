"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Article } from "@/types";

interface Props {
  categories: Category[];
  article?: Article & { category: Category };
}

export default function ArticleForm({ categories, article }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(article?.imageAlt ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(article?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(article?.featured ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { title, excerpt, content, categoryId, imageUrl, imageAlt, status, featured };

    const res = await fetch(
      article ? `/api/admin/articles/${article.id}` : "/api/admin/articles",
      {
        method: article ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Något gick fel");
      setLoading(false);
      return;
    }

    router.push("/admin/artiklar");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
      {/* Vänster kolumn — huvudinnehåll */}
      <div className="col-span-2 space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Titel *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="Artikelns titel..."
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Ingress</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition resize-none"
              placeholder="Kort sammanfattning..."
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Innehåll *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={18}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition resize-none font-mono text-sm"
              placeholder="Skriv artikeln här..."
            />
          </div>
        </div>

        {/* Bild */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-medium">Omslagsbild</h3>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Bild-URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Alt-text</label>
            <input
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="Beskriv bilden..."
            />
          </div>
          {imageUrl && (
            <img src={imageUrl} alt={imageAlt} className="w-full h-40 object-cover rounded-lg opacity-80" />
          )}
        </div>
      </div>

      {/* Höger kolumn — inställningar */}
      <div className="space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-medium mb-2">Publicera</h3>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
            >
              <option value="DRAFT">Utkast</option>
              <option value="PUBLISHED">Publicerad</option>
              <option value="ARCHIVED">Arkiverad</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-orange-500"
            />
            <span className="text-sm text-zinc-400">Visa som utvald</span>
          </label>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition text-sm"
            >
              {loading ? "Sparar..." : article ? "Uppdatera" : "Spara"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition"
            >
              Avbryt
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Kategori *</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={categoryId === cat.id}
                  onChange={() => setCategoryId(cat.id)}
                  className="accent-orange-500"
                  required
                />
                <span className="text-sm text-zinc-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
