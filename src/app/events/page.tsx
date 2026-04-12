import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;
export const metadata: Metadata = { title: "Events", description: "MC-events, tävlingar, träffar och banagar i Sverige" };

const typeLabels: Record<string, string> = {
  RACE: "Tävling", EXHIBITION: "Utställning", MOTO_MEET: "MC-Träff", TRACK_DAY: "Banadag", OTHER: "Övrigt",
};
const typeColors: Record<string, string> = {
  RACE: "#ef4444", EXHIBITION: "#8b5cf6", MOTO_MEET: "#3b82f6", TRACK_DAY: "#f59e0b", OTHER: "#6b7280",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
  });

  const upcoming = events.filter((e) => e.status !== "PAST" && e.status !== "CANCELLED");
  const past = events.filter((e) => e.status === "PAST" || e.status === "CANCELLED");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-white text-4xl font-black mb-2">Events</h1>
        <p className="text-zinc-400">MC-events, tävlingar, träffar och banagar</p>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-zinc-400">Inga events inlagda ännu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.map((ev) => (
            <div key={ev.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex gap-5 items-start transition">
              {/* Datum */}
              <div className="bg-zinc-800 rounded-xl px-4 py-3 text-center min-w-[64px] flex-shrink-0">
                <p className="text-orange-400 text-xs font-bold uppercase">
                  {new Date(ev.startDate).toLocaleDateString("sv-SE", { month: "short" })}
                </p>
                <p className="text-white text-2xl font-black leading-none">
                  {new Date(ev.startDate).getDate()}
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{ background: typeColors[ev.eventType] + "22", color: typeColors[ev.eventType] }}
                  >
                    {typeLabels[ev.eventType]}
                  </span>
                  {ev.status === "ONGOING" && (
                    <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">Pågår nu</span>
                  )}
                </div>
                <h2 className="text-white font-bold text-lg leading-snug">{ev.title}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-zinc-400">
                  {ev.location && <span>📍 {ev.location}</span>}
                  <span>
                    {new Date(ev.startDate).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}
                    {ev.endDate && ` – ${new Date(ev.endDate).toLocaleDateString("sv-SE", { day: "numeric", month: "long" })}`}
                  </span>
                </div>
                {ev.description && <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{ev.description}</p>}
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-orange-400 hover:text-orange-300 transition">
                    Mer info →
                  </a>
                )}
              </div>
            </div>
          ))}

          {past.length > 0 && (
            <>
              <h2 className="text-zinc-500 text-sm font-semibold uppercase tracking-wider pt-6">Tidigare events</h2>
              {past.map((ev) => (
                <div key={ev.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 flex gap-5 items-start opacity-60">
                  <div className="bg-zinc-800 rounded-xl px-4 py-3 text-center min-w-[64px] flex-shrink-0">
                    <p className="text-zinc-500 text-xs font-bold uppercase">
                      {new Date(ev.startDate).toLocaleDateString("sv-SE", { month: "short" })}
                    </p>
                    <p className="text-zinc-400 text-2xl font-black leading-none">
                      {new Date(ev.startDate).getDate()}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-zinc-400 font-bold">{ev.title}</h2>
                    {ev.location && <p className="text-zinc-500 text-sm mt-1">📍 {ev.location}</p>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
