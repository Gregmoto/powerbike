import Link from "next/link";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-2xl font-black text-white tracking-tight mb-2">
              POWER<span className="text-orange-500">BIKE</span>
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Din källa för inspiration inom MC-världen. Nyheter, tester, utrustning och events sedan 2021.
            </p>
            <div className="mt-5">
              <p className="text-zinc-300 text-sm font-medium mb-2">Prenumerera på nyhetsbrev</p>
              <NewsletterForm compact />
            </div>
          </div>

          {/* Kategorier */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Kategorier</h3>
            <ul className="space-y-2">
              {[
                { href: "/motorcyklar", label: "Motorcyklar" },
                { href: "/bilar", label: "Bilar" },
                { href: "/utrustning", label: "Utrustning" },
                { href: "/tips-rad", label: "Tips & Råd" },
                { href: "/events", label: "Events" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-zinc-400 hover:text-orange-400 text-sm transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Om oss */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Om oss</h3>
            <ul className="space-y-2">
              {[
                { href: "/om-oss", label: "Om Powerbike" },
                { href: "/kontakt", label: "Kontakta oss" },
                { href: "/annonsera", label: "Annonsera" },
                { href: "/admin", label: "Admin" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-zinc-400 hover:text-orange-400 text-sm transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Powerbike. Alla rättigheter förbehållna.</p>
          <p className="text-zinc-600 text-xs">Inspiration inom MC-världen sedan 2021</p>
        </div>
      </div>
    </footer>
  );
}
