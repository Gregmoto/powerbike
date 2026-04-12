import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p
          className="text-[8rem] font-black text-zinc-800 leading-none select-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </p>
        <h1
          className="text-white text-3xl font-black uppercase -mt-4 mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sidan hittades inte
        </h1>
        <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Till startsidan
          </Link>
          <Link
            href="/sok"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-2.5 rounded-lg transition text-sm"
          >
            Sök artiklar
          </Link>
        </div>
      </div>
    </div>
  );
}
