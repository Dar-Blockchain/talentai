import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchInvitationDetails,
  respondToInvitation,
  selectMembers,
} from "@/store/slices/memberSlice";
import Cookies from "js-cookie";
import LoadingView from "@/components/features/invitation/LoadingView";
import InvalidInvitationView from "@/components/features/invitation/InvalidInvitationView";
import InvitationResponseView from "@/components/features/invitation/InvitationResponseView";
import InvitationCard from "@/components/features/invitation/InvitationCard";

const InvitationAcceptationPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { invitationId, token } = router.query;

  const {
    currentInvitation,
    fetchingInvitationDetails,
    respondingToInvitation,
    invitationResponse,
    error,
  } = useSelector(selectMembers);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.user.connectedUser.user);

  useEffect(() => {
    if (!router.isReady || !invitationId) return;
    const token = Cookies.get("api_token") || localStorage.getItem("api_token");
    if (!token && !isAuthenticated) {
      router.push(
        `/signin?returnUrl=${encodeURIComponent(window.location.href)}`,
      );
    }
  }, [router.isReady, isAuthenticated, router, invitationId]);

  useEffect(() => {
    if (invitationId && typeof invitationId === "string") {
      dispatch(fetchInvitationDetails(invitationId));
    }
  }, [invitationId, dispatch]);

  const handleAccept = async () => {
    if (!invitationId || typeof invitationId !== "string") return;
    try {
      await dispatch(
        respondToInvitation({ invitationId, action: "accept", token: typeof token === "string" ? token : undefined }),
      ).unwrap();
    } catch {
      /* handled by redux */
    }
  };

  const handleDecline = async () => {
    if (!invitationId || typeof invitationId !== "string") return;
    try {
      await dispatch(
        respondToInvitation({ invitationId, action: "reject", token: typeof token === "string" ? token : undefined }),
      ).unwrap();
    } catch {
      /* handled by redux */
    }
  };

  if (fetchingInvitationDetails) return <LoadingView />;

  const emailMismatch =
    currentInvitation &&
    user &&
    (currentInvitation as any).email &&
    user.email.toLowerCase() !== (currentInvitation as any).email.toLowerCase();

  if (error || !currentInvitation || emailMismatch) {
    const isWarning = Boolean(emailMismatch);
    const message = isWarning
      ? `Invitation sent to ${(currentInvitation as any).email}. You're signed in as ${user?.email}.`
      : error || "This invitation is no longer valid or has expired.";
    return (
      <InvalidInvitationView
        isWarning={isWarning}
        message={message}
        onAction={() => router.push(isWarning ? "/workspaces" : "/")}
      />
    );
  }

  if (invitationResponse) {
    const accepted = invitationResponse.action === "accept";
    const companyName =
      (currentInvitation as any).invitedBy?.name ||
      (currentInvitation as any).invitedBy?.username;
    return (
      <InvitationResponseView
        accepted={accepted}
        companyName={companyName}
        onDashboard={() => router.push("/workspaces")}
      />
    );
  }

  return (
    <InvitationCard
      invitation={currentInvitation}
      respondingToInvitation={respondingToInvitation}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
};

export default InvitationAcceptationPage;
