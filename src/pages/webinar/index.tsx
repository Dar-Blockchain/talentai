import Head from "next/head";
import { useRouter } from "next/router";
import LandingPageLayout from "@/modules/home/shared/components/LandingPageLayout";
import WebinarSection from "@/modules/home/company/components/WebinarSection";
import { SITE_URL, OG_IMAGE } from "@/modules/shared/constants";

const CANONICAL = `${SITE_URL}/webinar`;

const WebinarPage: React.FC = () => {
  const router = useRouter();
  const previewId = router.isReady ? (router.query.id as string | undefined) : undefined;
  const routerReady = router.isReady;

  return (
    <>
      <Head>
        <title>Talent AI — Webinaire gratuit : L'IA en recrutement</title>
        <meta
          name="description"
          content="Rejoignez notre webinaire gratuit et découvrez comment l'IA transforme le recrutement. Session live de 60 minutes avec cas concrets et Q&A en direct."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content="Talent AI — Webinaire gratuit : L'IA en recrutement" />
        <meta property="og:description" content="Session live gratuite de 60 min. Cas concrets, Q&A en direct. Inscrivez-vous maintenant." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talent AI — Webinaire gratuit : L'IA en recrutement" />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>

      <LandingPageLayout>
        <div className="bg-[#F2F4F7] min-h-[80vh] flex items-center">
          <div className="w-full">
            <WebinarSection previewId={previewId} routerReady={routerReady} />
          </div>
        </div>
      </LandingPageLayout>
    </>
  );
};

export default WebinarPage;
