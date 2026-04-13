"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category, Article } from "@/types";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  article?: Article & { category: Category; tags?: { tag: Tag }[] };
}

type AiLoadingState = "draft" | "tags" | "summary" | null;

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
  const [publishAt, setPublishAt] = useState("");
  const [summary, setSummary] = useState((article as Record<string, unknown> & typeof article)?.summary as string ?? "");

  // Tags
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags?.map((t) => t.tag.id) ?? []
  );
  const [newTagName, setNewTagName] = useState("");

  // AI
  const [aiLoading, setAiLoading] = useState<AiLoadingState>(null);

  useEffect(() => {
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableTags(data);
      })
      .catch(() => {});
  }, []);

  // SEO calculations
  const titleLen = title.length;
  const titleScore = titleLen >= 50 && titleLen <= 60 ? 100 : titleLen > 0 ? Math.max(0, 100 - Math.abs(55 - titleLen) * 3) : 0;
  const excerptLen = excerpt.length;
  const excerptScore = excerptLen >= 120 && excerptLen <= 160 ? 100 : excerptLen > 0 ? Math.max(0, 100 - Math.abs(140 - excerptLen) * 1.5) : 0;
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  const h2Count = (content.match(/<h2/gi) || []).length + (content.match(/<h3/gi) || []).length;
  const linkCount = (content.match(/<a /gi) || []).length;
  const wordScore = Math.min(100, (wordCount / 800) * 100);
  const overallScore = Math.round((titleScore + excerptScore + wordScore) / 3);

  function scoreColor(score: number) {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  function scoreTextColor(score: number) {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      excerpt,
      content,
      categoryId,
      imageUrl,
      imageAlt,
      status,
      featured,
      publishAt: publishAt || null,
      summary: summary || null,
      tagIds: selectedTagIds,
    };

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

  async function handleGenerateDraft() {
    if (!title) return;
    setAiLoading("draft");
    const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "";
    const res = await fetch("/api/admin/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category: categoryName }),
    });
    const data = await res.json();
    if (data.content) setContent(data.content);
    setAiLoading(null);
  }

  async function handleAutoTag() {
    if (!content) return;
    setAiLoading("tags");
    const res = await fetch("/api/admin/ai/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (data.tags) {
      setAvailableTags((prev) => {
        const existing = new Map(prev.map((t) => [t.id, t]));
        data.tags.forEach((t: Tag) => existing.set(t.id, t));
        return Array.from(existing.values());
      });
      setSelectedTagIds(data.tags.map((t: Tag) => t.id));
    }
    setAiLoading(null);
  }

  async function handleGenerateSummary() {
    if (!content || !article?.id) return;
    setAiLoading("summary");
    const res = await fetch("/api/admin/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: article.id, title, content }),
    });
    const data = await res.json();
    if (data.summary) setSummary(data.summary);
    setAiLoading(null);
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    const slug = newTagName
      .toLowerCase()
      .replace(/[åä]/g, "a")
      .replace(/[ö]/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName.trim(), slug }),
    }).catch(() => null);
    if (res?.ok) {
      const tag = await res.json();
      setAvailableTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagName("");
    } else {
      // Reload tags in case it already existed
      fetch("/api/admin/tags")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setAvailableTags(data); });
      setNewTagName("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
      {/* Vänster kolumn — huvudinnehåll */}
      <div className="col-span-2 space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Titel * <span className="text-zinc-600">({titleLen}/60)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="Artikelns titel..."
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Ingress <span className="text-zinc-600">({excerptLen}/160)</span>
            </label>
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

        {/* SEO-analys */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">📊 SEO-analys</h3>
            <span className={`text-2xl font-bold ${scoreTextColor(overallScore)}`}>{overallScore}/100</span>
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Titel ({titleLen}/60 tecken)</span>
                <span className={scoreTextColor(titleScore)}>{Math.round(titleScore)}p</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className={`${scoreColor(titleScore)} h-1.5 rounded-full transition-all`} style={{ width: `${titleScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Ingress ({excerptLen}/160 tecken)</span>
                <span className={scoreTextColor(excerptScore)}>{Math.round(excerptScore)}p</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className={`${scoreColor(excerptScore)} h-1.5 rounded-full transition-all`} style={{ width: `${excerptScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Ordantal</span>
                <span className={wordCount >= 300 ? "text-green-400" : "text-yellow-400"}>{wordCount} ord</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className={`${scoreColor(wordScore)} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(100, wordScore)}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
              <span className="text-zinc-400">H2/H3-rubriker</span>
              <span className={h2Count >= 2 ? "text-green-400" : "text-yellow-400"}>{h2Count} st</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Interna länkar</span>
              <span className={linkCount >= 1 ? "text-green-400" : "text-zinc-500"}>{linkCount} st</span>
            </div>
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
        {/* Publicera */}
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

        {/* Schemaläggning */}
        {status === "DRAFT" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <h3 className="text-white font-medium">⏰ Schemaläggning</h3>
            <p className="text-xs text-zinc-500">Lämna tom = publicera manuellt</p>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            />
            {publishAt && (
              <p className="text-xs text-orange-400">
                Schemalagd: {new Date(publishAt).toLocaleString("sv-SE")}
              </p>
            )}
          </div>
        )}

        {/* Kategori */}
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

        {/* Taggar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-medium">Taggar</h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {availableTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={(e) => {
                    setSelectedTagIds((prev) =>
                      e.target.checked ? [...prev, tag.id] : prev.filter((id) => id !== tag.id)
                    );
                  }}
                  className="accent-orange-500"
                />
                <span className="text-sm text-zinc-300">#{tag.name}</span>
              </label>
            ))}
            {availableTags.length === 0 && (
              <p className="text-xs text-zinc-600">Inga taggar ännu.</p>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); } }}
              placeholder="Ny tagg..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleCreateTag}
              className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg px-3 py-1.5 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* AI-verktyg */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-medium">🤖 AI-verktyg</h3>
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={!title || !!aiLoading}
            className="w-full text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg py-2 transition flex items-center justify-center gap-2"
          >
            {aiLoading === "draft" ? "Genererar..." : "✨ Generera utkast"}
          </button>
          <button
            type="button"
            onClick={handleAutoTag}
            disabled={!content || !!aiLoading}
            className="w-full text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg py-2 transition"
          >
            {aiLoading === "tags" ? "Taggar..." : "🏷 Auto-tagga"}
          </button>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={!content || !article?.id || !!aiLoading}
            className="w-full text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg py-2 transition"
          >
            {aiLoading === "summary" ? "Genererar..." : "📝 Generera sammanfattning"}
          </button>
          {!article?.id && (
            <p className="text-xs text-zinc-500">Spara artikeln först för att generera sammanfattning</p>
          )}
          {summary && (
            <div className="text-xs text-zinc-400 bg-zinc-800 rounded-lg p-3 whitespace-pre-line">{summary}</div>
          )}
        </div>
      </div>
    </form>
  );
}
