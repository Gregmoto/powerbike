import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/layout/CategoryForm";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Kategorier</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs text-zinc-500 px-5 py-3 font-medium">Namn</th>
                <th className="text-left text-xs text-zinc-500 px-5 py-3 font-medium">Slug</th>
                <th className="text-left text-xs text-zinc-500 px-5 py-3 font-medium">Artiklar</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-zinc-800/50">
                  <td className="px-5 py-3 flex items-center gap-2">
                    {cat.color && (
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: cat.color }} />
                    )}
                    <span className="text-white text-sm">{cat.name}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{cat.slug}</td>
                  <td className="px-5 py-3 text-xs text-zinc-400">{cat._count.articles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CategoryForm />
      </div>
    </div>
  );
}
