"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("OTHER");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, location, startDate, endDate, eventType, url, imageUrl }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Något gick fel");
      setLoading(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Titel *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
            placeholder="t.ex. Sweden Rock MC-Träff 2026" />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Typ</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition">
            <option value="RACE">Tävling</option>
            <option value="EXHIBITION">Utställning</option>
            <option value="MOTO_MEET">MC-Träff</option>
            <option value="TRACK_DAY">Banadag</option>
            <option value="OTHER">Övrigt</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Plats</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
            placeholder="t.ex. Solvalla, Stockholm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Startdatum *</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Slutdatum</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Beskrivning</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition resize-none"
            placeholder="Beskriv eventet..." />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Länk (extern sida)</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
            placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Bild-URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
            placeholder="https://..." />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg px-6 py-2.5 transition">
            {loading ? "Sparar..." : "Skapa event"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition">
            Avbryt
          </button>
        </div>
      </div>
    </form>
  );
}
