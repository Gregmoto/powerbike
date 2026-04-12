"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/motorcyklar", label: "Motorcyklar" },
  { href: "/bilar", label: "Bilar" },
  { href: "/utrustning", label: "Utrustning" },
  { href: "/tips-rad", label: "Tips & Råd" },
  { href: "/events", label: "Events" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className="text-2xl font-black text-white tracking-tight uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            POWER<span className="text-orange-500">BIKE</span>
          </span>
          <span className="text-zinc-500 text-[9px] tracking-[0.2em] uppercase font-medium">
            Inspiration inom MC-världen
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "text-orange-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form action="/sok" className="flex items-center gap-2" onSubmit={() => setSearchOpen(false)}>
              <input
                autoFocus
                name="q"
                placeholder="Sök artiklar..."
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 w-52 transition"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-zinc-500 hover:text-white transition text-lg leading-none">
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-zinc-400 hover:text-white p-2 transition"
              aria-label="Sök"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          <Link
            href="/butik"
            className="hidden md:inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Butik
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-zinc-400 hover:text-white p-2 transition"
            aria-label="Meny"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 animate-fade-in">
          <div className="px-4 py-3 space-y-0.5">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active ? "text-orange-400 bg-orange-500/10" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/butik"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-orange-400"
            >
              Butik
            </Link>
          </div>
          {/* Mobilsökning */}
          <div className="px-4 pb-4">
            <form action="/sok">
              <input
                name="q"
                placeholder="Sök artiklar..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
