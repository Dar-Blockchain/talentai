import { useEffect } from "react";
import { useRouter } from "next/router";

const InterviewHrRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { query } = router;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v) params.set(k, Array.isArray(v) ? v[0] : v);
    });
    const qs = params.toString();
    router.replace(`/candidate/interview/hr${qs ? `?${qs}` : ""}`);
  }, [router.isReady]);

  return null;
};

export default InterviewHrRedirect;
