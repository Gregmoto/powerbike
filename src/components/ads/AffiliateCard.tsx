import Image from "next/image";

interface Props {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: string | null;
  buttonText: string;
  url: string;
  inline?: boolean;
}

export default function AffiliateCard({ title, description, imageUrl, price, buttonText, url, inline }: Props) {
  const utmUrl = `${url}${url.includes("?") ? "&" : "?"}utm_source=powerbike&utm_medium=affiliate&utm_campaign=sidebar`;

  if (inline) {
    return (
      <a
        href={utmUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex gap-4 items-center bg-zinc-900 border border-zinc-700 hover:border-orange-500/50 rounded-xl p-4 transition-all"
      >
        {imageUrl && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
            <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition duration-300" unoptimized />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Annons</p>
          <h4 className="text-white font-bold text-sm leading-tight group-hover:text-orange-400 transition">{title}</h4>
          {description && <p className="text-zinc-400 text-xs mt-1 line-clamp-1">{description}</p>}
        </div>
        <div className="flex-shrink-0 text-right">
          {price && <p className="text-orange-400 font-black text-sm mb-1">{price}</p>}
          <span className="inline-block bg-orange-500 group-hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap">
            {buttonText}
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={utmUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block bg-zinc-900 border border-zinc-700 hover:border-orange-500/50 rounded-xl overflow-hidden transition-all"
    >
      {imageUrl && (
        <div className="relative aspect-video bg-zinc-800 overflow-hidden">
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition duration-300" unoptimized />
        </div>
      )}
      <div className="p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Annons</p>
        <h4 className="text-white font-bold text-sm leading-tight group-hover:text-orange-400 transition mb-1">{title}</h4>
        {description && <p className="text-zinc-400 text-xs leading-relaxed mb-3">{description}</p>}
        <div className="flex items-center justify-between">
          {price && <span className="text-orange-400 font-black text-base">{price}</span>}
          <span className="ml-auto inline-block bg-orange-500 group-hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
            {buttonText}
          </span>
        </div>
      </div>
    </a>
  );
}
