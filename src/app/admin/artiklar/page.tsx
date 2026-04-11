import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Artiklar</h1>
        <Link
          href="/admin/artiklar/ny"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Ny artikel
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Titel</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Kategori</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Status</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Visningar</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Datum</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Inga artiklar ännu.{" "}
                  <Link href="/admin/artiklar/ny" className="text-orange-400 hover:underline">
                    Skapa din första!
                  </Link>
                </td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-white text-sm truncate">{a.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">/artiklar/{a.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{a.category.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      a.status === "PUBLISHED" ? "bg-green-900/40 text-green-400" :
                      a.status === "DRAFT" ? "bg-zinc-800 text-zinc-400" :
                      "bg-red-900/40 text-red-400"
                    }`}>
                      {a.status === "PUBLISHED" ? "Publicerad" : a.status === "DRAFT" ? "Utkast" : "Arkiverad"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{a.views}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(a.createdAt).toLocaleDateString("sv-SE")}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/artiklar/${a.id}`}
                      className="text-xs text-orange-400 hover:text-orange-300 transition"
                    >
                      Redigera
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
