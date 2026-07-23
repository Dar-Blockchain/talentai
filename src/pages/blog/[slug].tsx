import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { useTranslation } from "react-i18next";
import LandingPageLayout from "@/modules/home/shared/components/LandingPageLayout";
import { usePublicBlogPostQuery } from "@/modules/home/blog/queries";
import { fetchPublicBlogPostBySlugServer, fetchAdminBlogPostPreviewServer } from "@/modules/home/blog/api/serverFetch";
import { PublicBlogPost } from "@/modules/home/blog/types";
import { resolveUploadUrl } from "@/utils/resolveUploadUrl";
import { pickLocalized } from "@/utils/pickLocalized";
import { useLanguage } from "@/hooks/useLanguage";
import { SITE_URL, OG_IMAGE, LOGO_URL } from "@/modules/shared/constants";
import { ArrowLeft, Newspaper, Eye } from "lucide-react";

/** Backfills any relative "/uploads/..." src left over from posts saved before
 * uploads were stored as absolute URLs — new posts already store absolute URLs. */
const resolveContentImages = (html: string) =>
  html.replace(/src="(\/uploads\/[^"]+)"/g, (_m, path) => `src="${resolveUploadUrl(path)}"`);

/** Strips tags for a plain-text meta description fallback when no excerpt is set. */
const excerptFromHtml = (html: string, max = 160) => {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

const formatDate = (d: string, locale: string) => {
  try { return new Date(d).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return ""; }
};

const contentClass = [
  "text-[15px] text-slate-700 leading-relaxed",
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-slate-900",
  "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-slate-900",
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-slate-900",
  "[&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-teal-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-4",
  "[&_img]:my-5 [&_img]:rounded-xl [&_img]:max-w-full",
  "[&_a]:text-teal-600 [&_a]:underline",
].join(" ");

interface BlogDetailPageProps {
  initialPost: PublicBlogPost;
  isPreview: boolean;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ initialPost, isPreview }) => {
  const { t } = useTranslation("home");
  const { currentLang } = useLanguage();
  const { data: post } = usePublicBlogPostQuery(initialPost.slug, initialPost, !isPreview);
  const current = post ?? initialPost;

  const title = pickLocalized(currentLang, current.title_en, current.title_fr);
  const excerpt = pickLocalized(currentLang, current.excerpt_en, current.excerpt_fr);
  const content = pickLocalized(currentLang, current.content_en, current.content_fr);
  const coverImage = pickLocalized(currentLang, current.coverImage_en, current.coverImage_fr);

  const canonical = `${SITE_URL}/blog/${current.slug}`;
  const pageTitle = `${title} | TalentAI Blog`;
  const description = excerpt || excerptFromHtml(content);
  const image = coverImage ? resolveUploadUrl(coverImage) : OG_IMAGE;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image,
    datePublished: current.publishedAt,
    dateModified: current.publishedAt,
    inLanguage: currentLang,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: "TalentAI" },
    publisher: {
      "@type": "Organization",
      name: "TalentAI",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content={isPreview ? "noindex, nofollow" : "index, follow"} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="TalentAI" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:locale" content={currentLang === "fr" ? "fr_FR" : "en_US"} />
        <meta property="article:published_time" content={current.publishedAt} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </Head>

      <LandingPageLayout>
        {isPreview && (
          <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-amber-400 text-amber-950 text-[12.5px] font-bold py-2 px-4 text-center">
            <Eye size={14} />
            {current.status === "published" ? "Preview — this post is live" : "Draft preview — only visible to you"}
          </div>
        )}

        <section
          className="relative overflow-hidden border-b border-black/[0.06] py-6 md:py-7"
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
          <div className="max-w-[760px] mx-auto px-4 md:px-8">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 pl-2.5 pr-4 py-1.5 text-[12.5px] font-bold text-gray-600 shadow-sm hover:border-primary/30 hover:text-primary transition-colors"
            >
              <span className="flex items-center justify-center size-6 rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
                <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              </span>
              {t("blog.back_to_blog")}
            </Link>
          </div>
        </section>

        <div className="max-w-[760px] mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-16 md:pb-24">
          <article>
            <span className="text-[11px] font-medium text-teal-600 uppercase tracking-wide">{formatDate(current.publishedAt, currentLang)}</span>
            <h1 className="mt-2 text-[1.8rem] md:text-[2.2rem] font-bold tracking-tight text-slate-900 leading-tight">{title}</h1>

            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveUploadUrl(coverImage)} alt={title} className="w-full h-auto rounded-2xl mt-8" />
            )}

            <div className={contentClass} dangerouslySetInnerHTML={{ __html: resolveContentImages(content) }} />
          </article>
        </div>
      </LandingPageLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BlogDetailPageProps> = async ({ params, query, req }) => {
  const slug = params?.slug as string;

  if (query.preview === "1") {
    const previewPost = await fetchAdminBlogPostPreviewServer(slug, req.headers.cookie);
    if (previewPost) return { props: { initialPost: previewPost, isPreview: true } };
    // Not an admin, or post doesn't exist — fall through to the normal public lookup.
  }

  const initialPost = await fetchPublicBlogPostBySlugServer(slug);
  if (!initialPost) return { notFound: true };
  return { props: { initialPost, isPreview: false } };
};

export default BlogDetailPage;
