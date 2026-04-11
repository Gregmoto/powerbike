import { prisma } from "@/lib/prisma";
import Link from "next/link";

const eventTypeLabels: Record<string, string> = {
  RACE: "Tävling",
  EXHIBITION: "Utställning",
  MOTO_MEET: "Träff",
  TRACK_DAY: "Banadag",
  OTHER: "Övrigt",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startDate: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <Link
          href="/admin/events/ny"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Nytt event
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Titel</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Typ</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Plats</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Datum</th>
              <th className="text-left text-xs text-zinc-500 px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  Inga events ännu.{" "}
                  <Link href="/admin/events/ny" className="text-orange-400 hover:underline">
                    Skapa ditt första!
                  </Link>
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={ev.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white text-sm">{ev.title}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{eventTypeLabels[ev.eventType]}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">{ev.location ?? "—"}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {new Date(ev.startDate).toLocaleDateString("sv-SE")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      ev.status === "UPCOMING" ? "bg-green-900/40 text-green-400" :
                      ev.status === "ONGOING" ? "bg-blue-900/40 text-blue-400" :
                      ev.status === "CANCELLED" ? "bg-red-900/40 text-red-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {ev.status === "UPCOMING" ? "Kommande" :
                       ev.status === "ONGOING" ? "Pågår" :
                       ev.status === "CANCELLED" ? "Inställt" : "Avslutat"}
                    </span>
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
