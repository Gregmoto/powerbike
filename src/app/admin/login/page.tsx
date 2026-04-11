"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Fel e-post eller lösenord");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            POWER<span className="text-orange-500">BIKE</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-8 space-y-5 border border-zinc-800">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">E-post</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              placeholder="admin@powerbike.nu"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Lösenord</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      </div>
    </div>
  );
}
