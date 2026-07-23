import type { GetServerSideProps } from "next";
import { SITE_URL } from "@/modules/shared/constants";

function buildSitemap(posts: { slug: string; publishedAt: string }[]): string {
  const urls = posts.map((post) => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

/** Dynamically generated sitemap covering every published blog post — the
 * static public/sitemap.xml only lists fixed pages, so new posts need their
 * own generated feed to stay discoverable by search engines. */
const SitemapBlog = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  let allPosts: { slug: string; publishedAt: string }[] = [];

  try {
    let page = 1;
    const limit = 100;
    while (true) {
      const response = await fetch(`${apiBase}/blog/public?page=${page}&limit=${limit}`);
      if (!response.ok) break;
      const json = await response.json();
      allPosts = allPosts.concat(json.data ?? []);
      if (page >= (json.totalPages ?? 1)) break;
      page += 1;
    }
  } catch {
    allPosts = [];
  }

  res.setHeader("Content-Type", "text/xml");
  res.write(buildSitemap(allPosts));
  res.end();

  return { props: {} };
};

export default SitemapBlog;
