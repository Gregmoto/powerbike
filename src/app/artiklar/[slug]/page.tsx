import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import ArticleCard from "@/components/articles/ArticleCard";

export const revalidate = 60;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug }, include: { category: true } });
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category.name,
      images: article.imageUrl ? [{ url: article.imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, author: true, tags: { include: { tag: true } } },
  });

  if (!article) notFound();

  // Räkna upp visningar
  await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });

  // Relaterade artiklar
  const related = await prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: article.categoryId, id: { not: article.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.imageUrl ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.author?.name ?? "Powerbike" },
    publisher: {
      "@type": "Organization",
      name: "Powerbike",
      logo: { "@type": "ImageObject", url: "https://powerbike.nu/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://powerbike.nu/artiklar/${article.slug}` },
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Artikel */}
        <article className="lg:col-span-2">
          {/* Kategori-badge */}
          <div className="mb-4">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: article.category.color ?? "#ef4444", color: "#fff" }}
            >
              {article.category.name}
            </span>
          </div>

          <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-zinc-300 text-lg leading-relaxed mb-6 border-l-4 border-orange-500 pl-4">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-8">
            {article.author?.name && <span>Av {article.author.name}</span>}
            {date && <><span>·</span><time>{date}</time></>}
            <span>·</span><span>{article.views} visningar</span>
          </div>

          {article.imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt ?? article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Innehåll */}
          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-orange-400 prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Taggar */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-zinc-800">
              {article.tags.map(({ tag }) => (
                <span key={tag.id} className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="bg-gradient-to-br from-orange-500/10 to-zinc-900 border border-orange-500/20 rounded-xl p-5 sticky top-20">
            <h3 className="text-white font-bold text-sm mb-3">Håll dig uppdaterad</h3>
            <p className="text-zinc-400 text-xs mb-4">Prenumerera på vårt nyhetsbrev.</p>
            <a
              href="/"
              className="block text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Prenumerera
            </a>
          </div>
        </aside>
      </div>

      {/* Relaterade artiklar */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-zinc-800 pt-10">
          <h2 className="text-white text-xl font-bold uppercase tracking-wider border-l-4 border-orange-500 pl-3 mb-6">
            Relaterade artiklar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((a) => <ArticleCard key={a.id} article={a} size="medium" />)}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
