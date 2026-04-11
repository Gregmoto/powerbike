import { prisma } from "@/lib/prisma";

export default async function SubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const active = subscribers.filter((s) => s.active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Prenumeranter</h1>
        <span className="text-zinc-400 text-sm">{active} aktiva av {subscribers.length} totalt</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">E-post</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Status</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Prenumererade</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                  Inga prenumeranter ännu.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id} className="border-b border-zinc-800/50">
                  <td className="px-6 py-4 text-white text-sm">{s.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      s.active ? "bg-green-900/40 text-green-400" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {s.active ? "Aktiv" : "Avprenumererad"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(s.createdAt).toLocaleDateString("sv-SE")}
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
