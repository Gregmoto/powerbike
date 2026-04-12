import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/articles/ArticleCard";

export const revalidate = 60;

interface Props { params: Promise<{ kategori: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const category = await prisma.category.findUnique({ where: { slug: kategori } });
  if (!category) return {};
  return { title: category.name, description: `Artiklar om ${category.name.toLowerCase()}` };
}

export default async function CategoryPage({ params }: Props) {
  const { kategori } = await params;

  const category = await prisma.category.findUnique({ where: { slug: kategori } });
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ background: category.color ?? "#ef4444", color: "#fff" }}
        >
          Kategori
        </span>
        <h1 className="text-white text-4xl font-black">{category.name}</h1>
        <p className="text-zinc-400 mt-2">{articles.length} artiklar</p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
          <p className="text-zinc-400">Inga artiklar publicerade i denna kategori ännu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => <ArticleCard key={a.id} article={a} size="medium" />)}
        </div>
      )}
    </div>
  );
}
