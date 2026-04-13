import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [
    viewsAgg,
    publishedCount,
    subscriberCount,
    commentCount,
    totalReaders,
    recentArticles,
    topArticles,
  ] = await Promise.all([
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.subscriber.count({ where: { active: true } }),
    prisma.comment.count({ where: { approved: false } }),
    prisma.reader.count(),
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { category: true, author: true },
    }),
    prisma.article.findMany({
      take: 5,
      orderBy: { views: "desc" },
      include: { category: true },
    }),
  ]);

  const totalViews = viewsAgg._sum.views ?? 0;

  const stats = [
    { label: "Totala visningar", value: totalViews.toLocaleString("sv-SE"), icon: "👁", color: "text-blue-400" },
    { label: "Publicerade artiklar", value: publishedCount, icon: "📄", color: "text-green-400" },
    { label: "Läsarmedlemmar", value: totalReaders, icon: "👤", color: "text-orange-400" },
    { label: "Kommentarer att granska", value: commentCount, icon: "💬", color: "text-red-400" },
    { label: "Prenumeranter", value: subscriberCount, icon: "✉️", color: "text-purple-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-zinc-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Populäraste artiklar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Populäraste artiklar</h2>
            <Link href="/admin/statistik" className="text-sm text-orange-400 hover:text-orange-300 transition">
              Se alla →
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Titel</th>
                <th className="text-right text-xs text-zinc-500 px-6 py-3 font-medium">Visningar</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((a, i) => (
                <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-3">
                    <span className="text-zinc-600 text-xs mr-2">{i + 1}.</span>
                    <Link href={`/admin/artiklar/${a.id}`} className="text-white text-sm hover:text-orange-400 transition">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-right text-orange-400 font-bold text-sm">
                    {a.views.toLocaleString("sv-SE")}
                  </td>
                </tr>
              ))}
              {topArticles.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-6 text-center text-zinc-500 text-sm">Inga visningar ännu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Senaste artiklar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Senaste artiklar</h2>
            <Link href="/admin/artiklar/ny" className="text-sm text-orange-400 hover:text-orange-300 transition">
              + Ny artikel
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Titel</th>
                <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Status</th>
                <th className="text-right text-xs text-zinc-500 px-6 py-3 font-medium">Visningar</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    Inga artiklar ännu.{" "}
                    <Link href="/admin/artiklar/ny" className="text-orange-400 hover:underline">
                      Skapa din första!
                    </Link>
                  </td>
                </tr>
              ) : (
                recentArticles.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-3">
                      <Link href={`/admin/artiklar/${a.id}`} className="text-white text-sm hover:text-orange-400 transition">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        a.status === "PUBLISHED" ? "bg-green-900/40 text-green-400" :
                        a.status === "DRAFT" ? "bg-zinc-800 text-zinc-400" :
                        "bg-red-900/40 text-red-400"
                      }`}>
                        {a.status === "PUBLISHED" ? "Publicerad" : a.status === "DRAFT" ? "Utkast" : "Arkiverad"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-zinc-400">
                      {a.views.toLocaleString("sv-SE")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
