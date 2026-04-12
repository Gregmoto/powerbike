"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⬡" },
  { href: "/admin/artiklar", label: "Artiklar", icon: "📄" },
  { href: "/admin/kategorier", label: "Kategorier", icon: "🏷" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/prenumeranter", label: "Prenumeranter", icon: "✉️" },
  { href: "/admin/kommentarer", label: "Kommentarer", icon: "💬" },
  { href: "/admin/affiliate", label: "Affiliate-annonser", icon: "💰" },
];

interface Props {
  user?: { name?: string | null; email?: string | null };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-800">
        <h1 className="text-xl font-black text-white tracking-tight">
          POWER<span className="text-orange-500">BIKE</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-0.5">Admin-panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-800">
        <p className="text-zinc-400 text-xs truncate mb-2">{user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-left text-xs text-zinc-500 hover:text-red-400 transition px-1"
        >
          Logga ut
        </button>
      </div>
    </aside>
  );
}
