import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ArticleCard from "@/components/articles/ArticleCard";
import ReactionBar from "@/components/articles/ReactionBar";
import CommentSection from "@/components/articles/CommentSection";
import ShareButtons from "@/components/articles/ShareButtons";
import AffiliateCard from "@/components/ads/AffiliateCard";
import BookmarkButton from "@/components/articles/BookmarkButton";

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

  // Aktiva sidebar-annonser
  const sidebarAds = await prisma.affiliateAd.findMany({
    where: { active: true, position: "SIDEBAR" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Relaterade artiklar — prioritera artiklar med samma taggar, fallback på kategori
  const tagIds = article.tags.map((t) => t.tag.id);
  let related = tagIds.length > 0
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: article.id },
          tags: { some: { tagId: { in: tagIds } } },
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { category: true },
      })
    : [];

  // Fyll upp med kategori-artiklar om < 3 tagg-träffar
  if (related.length < 3) {
    const excludeIds = [article.id, ...related.map((r) => r.id)];
    const extra = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        categoryId: article.categoryId,
        id: { notIn: excludeIds },
      },
      take: 3 - related.length,
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
    related = [...related, ...extra];
  }

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

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: "https://powerbike.nu" },
      { "@type": "ListItem", position: 2, name: article.category.name, item: `https://powerbike.nu/${article.category.slug}` },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://powerbike.nu/artiklar/${article.slug}` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-300 transition">Hem</Link>
        <span>/</span>
        <Link href={`/${article.category.slug}`} className="hover:text-zinc-300 transition">{article.category.name}</Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[200px]">{article.title}</span>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Artikel */}
        <article className="lg:col-span-2">
          {/* Kategori-badge + sponsrat */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: article.category.color ?? "#ef4444", color: "#fff" }}
            >
              {article.category.name}
            </span>
            {article.sponsored && (
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-700 text-zinc-400 border border-zinc-600">
                Sponsrat
              </span>
            )}
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

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-zinc-800">
            <BookmarkButton articleId={article.id} />
            <ShareButtons title={article.title} slug={article.slug} />
          </div>
          <ReactionBar articleId={article.id} />
          <CommentSection articleId={article.id} />
        </article>

        {/* Sidebar */}
        {sidebarAds.length > 0 && (
          <aside className="space-y-4">
            <p className="text-zinc-600 text-xs uppercase tracking-widest">Annonser</p>
            {sidebarAds.map((ad) => (
              <AffiliateCard key={ad.id} {...ad} />
            ))}
          </aside>
        )}
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
