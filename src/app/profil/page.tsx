"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ArticleCard from "@/components/articles/ArticleCard";

interface Reader { id: string; name: string; email: string }
interface Article {
  id: string; title: string; slug: string; excerpt?: string;
  imageUrl?: string; imageAlt?: string; publishedAt?: string;
  category: { id: string; name: string; slug: string; color?: string; createdAt: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const [reader, setReader] = useState<Reader | null>(null);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reader/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data) { router.push("/logga-in"); return; }
        setReader(data);
        return fetch("/api/reader/bookmarks").then((r) => r.json());
      })
      .then((data) => { if (data) setBookmarks(data); })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/reader/login", { method: "DELETE" });
    router.push("/");
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-zinc-500">Laddar...</p></div>;
  if (!reader) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-xl">
            {reader.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-white text-2xl font-black">{reader.name}</h1>
            <p className="text-zinc-500 text-sm">{reader.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-zinc-500 hover:text-red-400 text-sm transition"
        >
          Logga ut
        </button>
      </div>

      {/* Bokmärken */}
      <section>
        <h2 className="text-white text-xl font-bold uppercase tracking-wider border-l-4 border-orange-500 pl-3 mb-6">
          Sparade artiklar
          {bookmarks.length > 0 && <span className="text-zinc-500 font-normal text-base ml-2">({bookmarks.length})</span>}
        </h2>

        {bookmarks.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
            <p className="text-zinc-500 mb-4">Du har inga sparade artiklar ännu.</p>
            <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm transition">
              Utforska artiklar →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((article) => (
              <ArticleCard key={article.id} article={{ ...article, featured: false, sponsored: false, views: 0, status: "PUBLISHED", content: "", authorId: "", categoryId: article.category.id, updatedAt: new Date().toISOString() } as never} size="medium" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
