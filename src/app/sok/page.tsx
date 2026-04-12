import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ArticleCard from "@/components/articles/ArticleCard";

export const metadata: Metadata = { title: "Sök" };

interface Props { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const articles = query.length >= 2
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 20,
        include: { category: true },
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-white text-3xl font-black mb-8">Sök</h1>

      <form action="/sok" className="mb-10">
        <div className="flex gap-3">
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Sök artiklar..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition text-lg"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Sök
          </button>
        </div>
      </form>

      {query.length >= 2 ? (
        <>
          <p className="text-zinc-400 text-sm mb-6">
            {articles.length} {articles.length === 1 ? "träff" : "träffar"} för &quot;{query}&quot;
          </p>
          {articles.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-zinc-400">Inga artiklar hittades. Prova ett annat sökord.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.map((a) => <ArticleCard key={a.id} article={a} size="medium" />)}
            </div>
          )}
        </>
      ) : query.length > 0 ? (
        <p className="text-zinc-500 text-sm">Ange minst 2 tecken för att söka.</p>
      ) : null}
    </div>
  );
}
