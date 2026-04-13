import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StatistikPage() {
  const [viewsAgg, topArticles, draftCount, publishedCount, archivedCount, pendingComments, totalReaders, categories] =
    await Promise.all([
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.findMany({
        take: 10,
        orderBy: { views: "desc" },
        include: { category: true },
      }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "ARCHIVED" } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.reader.count(),
      prisma.category.findMany({
        include: { _count: { select: { articles: true } } },
        orderBy: { articles: { _count: "desc" } },
      }),
    ]);

  const totalViews = viewsAgg._sum.views ?? 0;
  const totalArticles = draftCount + publishedCount + archivedCount;

  const statCards = [
    { label: "Totala visningar", value: totalViews.toLocaleString("sv-SE"), icon: "👁", color: "text-blue-400" },
    { label: "Publicerade artiklar", value: publishedCount, icon: "📄", color: "text-green-400" },
    { label: "Läsarmedlemmar", value: totalReaders, icon: "👤", color: "text-orange-400" },
    { label: "Kommentarer att granska", value: pendingComments, icon: "💬", color: "text-red-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Statistik</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-zinc-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Artiklar per status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Artiklar per status</h2>
          <div className="space-y-3">
            {[
              { label: "Publicerade", count: publishedCount, color: "bg-green-500" },
              { label: "Utkast", count: draftCount, color: "bg-zinc-500" },
              { label: "Arkiverade", count: archivedCount, color: "bg-red-500" },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all`}
                    style={{ width: totalArticles > 0 ? `${(count / totalArticles) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kategorier */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Kategorier</h2>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-300 text-sm">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{
                        width: categories[0]?._count.articles > 0
                          ? `${(cat._count.articles / categories[0]._count.articles) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <span className="text-zinc-400 text-sm w-6 text-right">{cat._count.articles}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Populäraste artiklar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-white font-semibold">Populäraste artiklar</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">#</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Titel</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Kategori</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Status</th>
              <th className="text-right text-xs text-zinc-500 px-6 py-3 font-medium">Visningar</th>
            </tr>
          </thead>
          <tbody>
            {topArticles.map((a, i) => (
              <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                <td className="px-6 py-4 text-zinc-500 text-sm">{i + 1}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/artiklar/${a.id}`} className="text-white text-sm hover:text-orange-400 transition">
                    {a.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-xs text-zinc-400">{a.category.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === "PUBLISHED" ? "bg-green-900/40 text-green-400" :
                    a.status === "DRAFT" ? "bg-zinc-800 text-zinc-400" : "bg-red-900/40 text-red-400"
                  }`}>
                    {a.status === "PUBLISHED" ? "Publicerad" : a.status === "DRAFT" ? "Utkast" : "Arkiverad"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-orange-400 font-bold text-sm">
                  {a.views.toLocaleString("sv-SE")}
                </td>
              </tr>
            ))}
            {topArticles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-sm">Inga artiklar ännu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
