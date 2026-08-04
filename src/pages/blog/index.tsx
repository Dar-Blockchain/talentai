import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import { useTranslation } from "react-i18next";
import LandingPageLayout from "@/modules/home/shared/components/LandingPageLayout";
import { usePublicBlogPostsQuery } from "@/modules/home/blog/queries";
import { fetchPublicBlogPostsServer } from "@/modules/home/blog/api/serverFetch";
import { PublicBlogListResponse } from "@/modules/home/blog/types";
import { resolveUploadUrl } from "@/utils/resolveUploadUrl";
import { pickLocalized } from "@/utils/pickLocalized";
import { useLanguage } from "@/hooks/useLanguage";
import { SITE_URL, OG_IMAGE } from "@/modules/shared/constants";
import { Newspaper, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

const CANONICAL = `${SITE_URL}/blog/`;

const formatDate = (d: string, locale: string) => {
  try { return new Date(d).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return ""; }
};

interface BlogIndexPageProps {
  initialData: PublicBlogListResponse | null;
}

const BlogIndexPage: React.FC<BlogIndexPageProps> = ({ initialData }) => {
  const { t } = useTranslation("home");
  const { currentLang } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePublicBlogPostsQuery(page, initialData ?? undefined);
  const posts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const pageTitle = t("blog.meta_title");
  const pageDescription = t("blog.meta_description");

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: CANONICAL,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${post.slug}/`,
        name: pickLocalized(currentLang, post.title_en, post.title_fr),
      })),
    },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={CANONICAL} />
        <meta name="robots" content="index, follow" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:site_name" content="TalentAI" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OG_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      </Head>

      <LandingPageLayout>
        {/* Hero */}
        <section
          className="relative overflow-hidden pt-12 pb-10 md:pt-16 md:pb-12"
          style={{
            backgroundImage: `
              linear-gradient(0deg, #F2F4F7, #F2F4F7),
              linear-gradient(90deg, rgba(13,148,136,0.08) 1px, transparent 1px),
              linear-gradient(180deg, rgba(13,148,136,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="max-w-[880px] mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-1.5 mb-6 shadow-sm">
              <Newspaper className="size-3.5 text-primary" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1px]">{t("blog.overline")}</span>
            </div>
            <h1 className="text-balance font-extrabold text-[26px] sm:text-[34px] md:text-[42px] leading-[1.15] tracking-[-0.5px] md:tracking-[-1px] text-gray-900">
              {t("blog.headline")} <span className="italic text-gray-600">{t("blog.headline_accent")}</span>
            </h1>
          </div>
        </section>

        <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 pb-14 md:pt-8 md:pb-16">
          {isLoading && posts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-100 h-72 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Newspaper size={32} />
              <p className="text-[14px]">{t("blog.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {posts.map((post) => {
                const title = pickLocalized(currentLang, post.title_en, post.title_fr);
                const excerpt = pickLocalized(currentLang, post.excerpt_en, post.excerpt_fr);
                const coverImage = pickLocalized(currentLang, post.coverImage_en, post.coverImage_fr);
                return (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl bg-white border border-black/[0.07] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-primary/25 hover:shadow-[0_14px_34px_-8px_rgba(13,148,136,0.18)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={resolveUploadUrl(coverImage)}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-primary/5 to-emerald-50">
                          <Newspaper size={28} />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10.5px] font-bold text-primary uppercase tracking-[0.6px] shadow-sm">
                        {formatDate(post.publishedAt, currentLang)}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col p-5 md:p-6">
                      <h2 className="text-[16.5px] font-bold text-gray-900 leading-snug line-clamp-2 tracking-[-0.2px]">{title}</h2>
                      {excerpt && <p className="mt-2.5 text-[13px] text-gray-500 leading-[1.65] line-clamp-3 flex-1">{excerpt}</p>}
                      <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold text-primary">
                        {t("blog.read_article")}
                        <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[13px] text-slate-500">{t("blog.page_of", { page, totalPages })}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </LandingPageLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BlogIndexPageProps> = async () => {
  const initialData = await fetchPublicBlogPostsServer(1, 9);
  return { props: { initialData } };
};

export default BlogIndexPage;
