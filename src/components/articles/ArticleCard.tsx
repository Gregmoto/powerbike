import Link from "next/link";
import Image from "next/image";
import type { Article, Category } from "@/types";

interface Props {
  article: Article & { category: Category };
  size?: "large" | "medium" | "small";
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="inline-block text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded"
      style={{ background: category.color ?? "#ef4444", color: "#fff", fontFamily: "var(--font-display)" }}
    >
      {category.name}
    </span>
  );
}

export default function ArticleCard({ article, size = "medium" }: Props) {
  const href = `/artiklar/${article.slug}`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  /* ── LARGE ── */
  if (size === "large") {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-2xl h-full min-h-[320px] ring-1 ring-zinc-800 hover:ring-orange-500/40 transition-all duration-300">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt ?? article.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            priority
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-6xl opacity-20">🏍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <CategoryBadge category={article.category} />
          <h2
            className="text-white text-2xl md:text-4xl font-black leading-tight mt-3 mb-2 group-hover:text-orange-400 transition-colors uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-zinc-300 text-sm line-clamp-2 hidden md:block">{article.excerpt}</p>
          )}
          {date && <p className="text-zinc-400 text-xs mt-3">{date}</p>}
        </div>
      </Link>
    );
  }

  /* ── SMALL ── */
  if (size === "small") {
    return (
      <Link href={href} className="group flex gap-3 items-start py-2">
        <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 ring-1 ring-zinc-700 group-hover:ring-orange-500/40 transition">
          {article.imageUrl ? (
            <Image src={article.imageUrl} alt={article.imageAlt ?? article.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🏍</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: article.category.color ?? "#f97316", fontFamily: "var(--font-display)" }}>
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

  /* ── MEDIUM (default) ── */
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt ?? article.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">🏍</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3">
          <CategoryBadge category={article.category} />
        </span>
      </div>
      <div className="p-4">
        <h3
          className="text-white font-black text-lg leading-tight group-hover:text-orange-400 transition-colors line-clamp-2 uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-zinc-400 text-sm mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          {date && <p className="text-zinc-500 text-xs">{date}</p>}
          <span className="text-orange-500 text-xs font-semibold group-hover:translate-x-1 transition-transform">Läs mer →</span>
        </div>
      </div>
    </Link>
  );
}
