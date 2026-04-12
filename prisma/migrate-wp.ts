/**
 * WordPress → Neon DB migration
 * Hämtar alla artiklar från powerbike.nu WP REST API och importerar till Neon.
 *
 * Kör: npx tsx prisma/migrate-wp.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const WP_BASE = "https://powerbike.nu/wp-json/wp/v2";
const WP_AUTH = "ck_563a84dfaf4ea88f45f81557fe43b30a2feffda3:cs_eabc9ec4abf30393a6ec8e4528ce82a63f1c602f";
const AUTH_HEADER = "Basic " + Buffer.from(WP_AUTH).toString("base64");

// Mappning WP kategori-ID → vår slug i Neon
const CATEGORY_MAP: Record<number, string> = {
  83:  "bilar",
  84:  "motorcyklar",
  171: "motorcyklar", // MotoGP → Motorcyklar
  1:   "tips-rad",
  120: "utrustning",
};

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { Authorization: AUTH_HEADER } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getImageUrl(mediaId: number): Promise<string | null> {
  if (!mediaId) return null;
  try {
    const media = await fetchJson(`${WP_BASE}/media/${mediaId}?_fields=source_url,media_details`);
    // Försök hämta 1000px-version, annars original
    return (
      media?.media_details?.sizes?.full?.source_url ||
      media?.media_details?.sizes?.large?.source_url ||
      media?.source_url ||
      null
    );
  } catch {
    return null;
  }
}

async function main() {
  console.log("🏍  Powerbike WP → Neon Migration\n");

  // 1. Hämta kategorier från Neon
  const neonCategories = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(neonCategories.map((c) => [c.slug, c]));
  console.log(`✅ Hittade ${neonCategories.length} kategorier i Neon:`, neonCategories.map((c) => c.name).join(", "));

  // Se till att MotoGP-kategori finns (skapar om den saknas)
  let motogpCategory = neonCategories.find((c) => c.slug === "motogp");
  if (!motogpCategory) {
    motogpCategory = await prisma.category.upsert({
      where: { slug: "motogp" },
      update: {},
      create: { name: "MotoGP", slug: "motogp", color: "#e11d48" },
    });
    console.log("✅ Skapade MotoGP-kategori");
  }

  // Uppdatera CATEGORY_MAP att inkludera MotoGP separat
  const FULL_CATEGORY_MAP: Record<number, string> = {
    83:  "bilar",
    84:  "motorcyklar",
    171: "motogp",
    1:   "tips-rad",
    120: "utrustning",
  };

  // 2. Hämta admin-användare
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) throw new Error("Ingen admin-användare hittades. Kör seed först.");
  console.log(`✅ Använder author: ${adminUser.email}\n`);

  // 3. Hämta alla WP-artiklar (max 100 per sida)
  console.log("📥 Hämtar artiklar från WordPress...");
  const posts: any[] = await fetchJson(
    `${WP_BASE}/posts?per_page=100&status=publish&_fields=id,date,slug,status,title,excerpt,content,featured_media,categories`
  );
  console.log(`📄 Hittade ${posts.length} publicerade artiklar\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      // Mappa WP-kategori → Neon kategori
      const wpCatId = post.categories?.[0] ?? 84;
      const neonSlug = FULL_CATEGORY_MAP[wpCatId] ?? "motorcyklar";

      // Hämta kategori från Neon (inkl. nyss skapad MotoGP)
      let neonCat = categoryBySlug[neonSlug];
      if (!neonCat) {
        neonCat = await prisma.category.findUnique({ where: { slug: neonSlug } }) ?? neonCategories[0];
      }

      // Hämta featured image
      const imageUrl = post.featured_media ? await getImageUrl(post.featured_media) : null;

      // Rensa excerpt
      const excerpt = stripHtml(post.excerpt?.rendered ?? "").replace(/\[…\]$/, "").trim();

      // Kolla om artikeln redan finns (via slug)
      const existing = await prisma.article.findUnique({ where: { slug: post.slug } });
      if (existing) {
        console.log(`⏭  Hoppar över (finns redan): ${post.title.rendered}`);
        skipped++;
        continue;
      }

      await prisma.article.create({
        data: {
          title: post.title.rendered
            .replace(/&amp;/g, "&")
            .replace(/&#038;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"'),
          slug: post.slug,
          excerpt: excerpt.length > 300 ? excerpt.slice(0, 297) + "..." : excerpt,
          content: post.content.rendered, // behåller HTML
          imageUrl,
          status: "PUBLISHED",
          featured: false,
          publishedAt: new Date(post.date),
          authorId: adminUser.id,
          categoryId: neonCat.id,
        },
      });

      console.log(`✅ [${neonCat.name}] ${post.title.rendered.slice(0, 70)}`);
      imported++;

      // Liten paus för att inte överbelasta WP API
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`❌ Fel på artikel "${post.title?.rendered}":`, err);
      errors++;
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Importerade:  ${imported}`);
  console.log(`⏭  Redan fanns: ${skipped}`);
  console.log(`❌ Fel:          ${errors}`);
  console.log(`${"─".repeat(50)}`);
  console.log("\n🏁 Migration klar!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
