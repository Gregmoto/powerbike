import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/articles/ArticleForm";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Ny artikel</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
