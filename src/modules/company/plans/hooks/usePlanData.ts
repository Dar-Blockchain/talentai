import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { usePlansQuery, useCombinedQuery, useVerifyPaymentMutation } from "../queries";
import { ORDERED_PLANS } from "../constants";
import type { ActiveSubMap, CombinedData, Snack } from "../types";

export function usePlanData(showSnack: Snack) {
  const router         = useRouter();
  const userPlanLimits = useSelector((state: any) => state.user?.connectedUser?.planLimits);

  const { data: plans = [], isLoading: plansLoading }          = usePlansQuery();
  const { data: combined, isLoading: combinedLoading }         = useCombinedQuery();
  const verifyPayment = useVerifyPaymentMutation();

  // Handle Stripe redirect back with ?status=success|cancel&session_id=...
  useEffect(() => {
    if (!router.isReady) return;
    const { status, session_id } = router.query;
    if (status === "success" && session_id) {
      verifyPayment.mutateAsync(session_id as string)
        .then(() => showSnack("Payment confirmed!", "success"))
        .catch((err: Error) => showSnack(err.message, "error"));
      router.replace("/company/plans", undefined, { shallow: true });
    } else if (status === "cancel") {
      showSnack("Payment cancelled.", "error");
      router.replace("/company/plans", undefined, { shallow: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const activeSubByPlanName = useMemo<ActiveSubMap>(() => {
    const map: ActiveSubMap = {};
    (combined as CombinedData | undefined)?.subscriptions
      ?.filter((s) => !!s.planName)
      .forEach((s) => { map[s.planName] = { id: s.id, autoRenew: s.autoRenew }; });
    return map;
  }, [combined]);

  const currentPlanName = useMemo<string | null>(() => {
    const fromProfile =
      userPlanLimits?.name ||
      userPlanLimits?.planName ||
      userPlanLimits?.plan?.name ||
      userPlanLimits?.planId?.name ||
      null;
    if (fromProfile && ORDERED_PLANS.includes(fromProfile)) return fromProfile;

    const names = Object.keys(activeSubByPlanName);
    if (names.length)
      return names.sort((a, b) => ORDERED_PLANS.indexOf(b) - ORDERED_PLANS.indexOf(a))[0];

    const typedCombined = combined as CombinedData | undefined;
    const valid = (typedCombined?.combined?.planNames ?? []).find((n) => ORDERED_PLANS.includes(n));
    if (valid) return valid;

    return userPlanLimits ? "Trial" : null;
  }, [activeSubByPlanName, userPlanLimits, combined]);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => ORDERED_PLANS.indexOf(a.name) - ORDERED_PLANS.indexOf(b.name)),
    [plans],
  );

  return {
    sortedPlans, plansLoading,
    combined: combined as CombinedData | undefined,
    combinedLoading,
    activeSubByPlanName, currentPlanName,
  };
}
