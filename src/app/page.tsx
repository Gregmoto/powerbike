import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/articles/ArticleCard";
import AffiliateCard from "@/components/ads/AffiliateCard";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredArticles, trendingArticles, upcomingEvents, inlineAds] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 4,
      include: { category: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 6,
      include: { category: true },
    }),
    prisma.event.findMany({
      where: { status: "UPCOMING", startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
    prisma.affiliateAd.findMany({
      where: { active: true, position: "INLINE" },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
  ]);

  const [heroArticle, ...sideArticles] = featuredArticles;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Grid */}
      {featuredArticles.length > 0 ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-14">
          <div className="lg:col-span-2 h-full">
            {heroArticle && <ArticleCard article={heroArticle} size="large" />}
          </div>
          <div className="flex flex-col gap-4">
            {sideArticles.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} size="medium" />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-14 rounded-2xl bg-zinc-900 border border-zinc-800 p-16 text-center">
          <p className="text-5xl mb-4">🏍</p>
          <h2 className="text-white text-2xl font-bold mb-2">Inga artiklar ännu</h2>
          <p className="text-zinc-400 mb-6">Publika artiklar visas här när de publiceras via admin-panelen.</p>
          <Link href="/admin/artiklar/ny" className="inline-flex bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">
            Skapa första artikeln →
          </Link>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-14">
          {trendingArticles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold uppercase tracking-wider border-l-4 border-orange-500 pl-3">
                  Trendigt
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {trendingArticles.map((a, i) => (
                  <ArticleCard key={a.id} article={a} size="medium" />
                ))}
                {inlineAds[0] && (
                  <div className="sm:col-span-2">
                    <AffiliateCard {...inlineAds[0]} inline />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {upcomingEvents.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm border-l-4 border-orange-500 pl-3 mb-4">
                Kommande Events
              </h3>
              <div className="space-y-4">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="flex gap-3 items-start">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5 text-center min-w-[48px]">
                      <p className="text-orange-400 text-xs font-bold">
                        {new Date(ev.startDate).toLocaleDateString("sv-SE", { month: "short" }).toUpperCase()}
                      </p>
                      <p className="text-white text-lg font-black leading-none">
                        {new Date(ev.startDate).getDate()}
                      </p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-snug">{ev.title}</p>
                      {ev.location && <p className="text-zinc-500 text-xs mt-0.5">{ev.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/events" className="block text-center text-xs text-orange-400 hover:text-orange-300 mt-5 transition">
                Alla events →
              </Link>
            </div>
          )}

          {/* Newsletter form dold tillfälligt */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-bold uppercase tracking-wider text-sm border-l-4 border-orange-500 pl-3 mb-4">
              Kategorier
            </h3>
            <div className="space-y-1">
              {[
                { href: "/motorcyklar", label: "Motorcyklar", color: "#ef4444" },
                { href: "/bilar", label: "Bilar", color: "#3b82f6" },
                { href: "/utrustning", label: "Utrustning", color: "#f59e0b" },
                { href: "/tips-rad", label: "Tips & Råd", color: "#10b981" },
              ].map((cat) => (
                <Link key={cat.href} href={cat.href} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition group">
                  <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  <span className="text-zinc-300 text-sm group-hover:text-white transition">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
