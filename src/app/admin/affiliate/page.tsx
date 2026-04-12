"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  buttonText: string;
  url: string;
  position: "SIDEBAR" | "INLINE";
  active: boolean;
}

const empty = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
  buttonText: "Köp här",
  url: "",
  position: "SIDEBAR" as const,
  active: true,
};

export default function AffiliateAdminPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/admin/affiliate").then((r) => r.json()).then(setAds);
  }, []);

  function startEdit(ad: Ad) {
    setForm({
      title: ad.title,
      description: ad.description ?? "",
      imageUrl: ad.imageUrl ?? "",
      price: ad.price ?? "",
      buttonText: ad.buttonText,
      url: ad.url,
      position: ad.position,
      active: ad.active,
    });
    setEditId(ad.id);
    setShowForm(true);
  }

  function reset() {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      price: form.price || null,
    };
    if (editId) {
      const res = await fetch(`/api/admin/affiliate/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setAds((prev) => prev.map((a) => a.id === editId ? updated : a));
    } else {
      const res = await fetch("/api/admin/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setAds((prev) => [created, ...prev]);
    }
    setSaving(false);
    reset();
  }

  async function remove(id: string) {
    if (!confirm("Radera annonsen?")) return;
    await fetch(`/api/admin/affiliate/${id}`, { method: "DELETE" });
    setAds((prev) => prev.filter((a) => a.id !== id));
  }

  async function toggleActive(ad: Ad) {
    const res = await fetch(`/api/admin/affiliate/${ad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !ad.active }),
    });
    const updated = await res.json();
    setAds((prev) => prev.map((a) => a.id === ad.id ? updated : a));
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">Affiliate-annonser</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
          >
            + Ny annons
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-white font-semibold">{editId ? "Redigera annons" : "Ny annons"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Titel *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Pris (t.ex. "1 299 kr")</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Beskrivning</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Bild-URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Affiliate-URL *</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Knapptext</label>
              <input
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Placering</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value as "SIDEBAR" | "INLINE" })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="SIDEBAR">Sidebar</option>
                <option value="INLINE">Inline (mellan artiklar)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-lg transition">
              {saving ? "Sparar..." : editId ? "Spara ändringar" : "Skapa annons"}
            </button>
            <button type="button" onClick={reset} className="text-zinc-400 hover:text-white text-sm transition">
              Avbryt
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {ads.length === 0 && <p className="text-zinc-500 text-sm">Inga annonser ännu.</p>}
        {ads.map((ad) => (
          <div key={ad.id} className={`bg-zinc-900 border rounded-xl p-4 flex gap-4 items-start ${ad.active ? "border-zinc-800" : "border-zinc-800 opacity-50"}`}>
            {ad.imageUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-white font-semibold text-sm">{ad.title}</span>
                {ad.price && <span className="text-orange-400 text-sm font-bold">{ad.price}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${ad.position === "SIDEBAR" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                  {ad.position === "SIDEBAR" ? "Sidebar" : "Inline"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ad.active ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-500"}`}>
                  {ad.active ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              {ad.description && <p className="text-zinc-500 text-xs truncate">{ad.description}</p>}
              <p className="text-zinc-600 text-xs mt-0.5 truncate">{ad.url}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => toggleActive(ad)} className="text-xs text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg transition">
                {ad.active ? "Inaktivera" : "Aktivera"}
              </button>
              <button onClick={() => startEdit(ad)} className="text-xs text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg transition">
                Redigera
              </button>
              <button onClick={() => remove(ad.id)} className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition">
                Radera
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
