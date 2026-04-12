import Link from "next/link";
import Image from "next/image";
import type { Article, Category } from "@/types";

interface Props {
  article: Article & { category: Category };
  size?: "large" | "medium" | "small";
}

export default function ArticleCard({ article, size = "medium" }: Props) {
  const href = `/artiklar/${article.slug}`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })
    : "";

  if (size === "large") {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-2xl aspect-[16/9]">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt ?? article.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
            priority
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-1 rounded mb-3"
            style={{ background: article.category.color ?? "#ef4444", color: "#fff" }}
          >
            {article.category.name}
          </span>
          <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight group-hover:text-orange-400 transition">
            {article.title}
          </h2>
          {date && <p className="text-zinc-400 text-xs mt-2">{date}</p>}
        </div>
      </Link>
    );
  }

  if (size === "small") {
    return (
      <Link href={href} className="group flex gap-3 items-start">
        <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
          {article.imageUrl && (
            <Image src={article.imageUrl} alt={article.imageAlt ?? article.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: article.category.color ?? "#f97316" }}>
            {article.category.name}
          </span>
          <h3 className="text-white text-sm font-semibold leading-snug mt-0.5 group-hover:text-orange-400 transition line-clamp-2">
            {article.title}
          </h3>
          {date && <p className="text-zinc-500 text-xs mt-1">{date}</p>}
        </div>
      </Link>
    );
  }

  // Medium (default)
  return (
    <Link href={href} className="group block overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {article.imageUrl && (
          <Image src={article.imageUrl} alt={article.imageAlt ?? article.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
        )}
        <span
          className="absolute top-3 left-3 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
          style={{ background: article.category.color ?? "#ef4444", color: "#fff" }}
        >
          {article.category.name}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold leading-snug group-hover:text-orange-400 transition line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
        )}
        {date && <p className="text-zinc-500 text-xs mt-3">{date}</p>}
      </div>
    </Link>
  );
}
