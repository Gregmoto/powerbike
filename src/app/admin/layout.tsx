import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AdminSidebar user={session.user} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
