import "@/styles/globals.css";
import "@/i18n/config"; // initialise i18next before anything renders
import "@/lib/dayjs";   // extend dayjs plugins globally
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, persistor, RootState } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, Backdrop, Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useRouter } from "next/router";
import Head from "next/head";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { Poppins } from "next/font/google";
import MuiToast from "@/components/ui/Toast";
import { useToast, ToastProvider } from "@/hooks/useToast";
import { NotificationProvider } from "@/modules/notifications/shared/context";
import { AuthProvider, useAuthState, useAuthActions } from "@/modules/auth/shared/context/AuthContext";
import { clearConnectedUser, getMyProfile } from "@/store/slices/userSlice";
import { getToken } from '@/modules/auth/shared/utils/token';
import { setToastHandler } from "@/utils/toastEmitter";
import { setSessionExpiredHandler } from "@/utils/storeEmitter";
import { useTranslation } from "react-i18next";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { normalizeLangCode, MANUAL_LANG_KEY } from "@/hooks/useLanguage";

// ─── Authenticated-only bridges (dynamic) ────────────────────────────────────
// These components import Socket.IO + chat-specific Redux, none of which belongs
// in the auth-page bundle. With next/dynamic + ssr:false they become separate
// async chunks and are only fetched when isAuthenticated is true.
const TeamChatRealtimeBridge = dynamic(
  () => import("@/modules/chat/team-chat/components/TeamChatRealtimeBridge"),
  { ssr: false },
);
const CandidateChatRealtimeBridge = dynamic(
  () => import("@/modules/chat/candidate-chat/components/CandidateChatRealtimeBridge"),
  { ssr: false },
);
const ChatUnreadSyncBridge = dynamic(
  () => import("@/modules/chat/shared/components/ChatUnreadSyncBridge"),
  { ssr: false },
);

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

// ─── MUI theme bridge ─────────────────────────────────────────────────────────
// next-themes injects a blocking inline script that applies the correct class to
// <html> before React hydrates, so resolvedTheme is accurate on the first browser
// render. No "mounted" guard needed — that pattern added an extra paint cycle.
function MuiThemeSync({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary:    { main: "#6AD39C" },
      secondary:  { main: "#BD85FF" },
      background: {
        default: isDark ? "#0B1120" : "#FDFEFE",
        paper:   isDark ? "#0F1829" : "#FFFFFF",
      },
    },
    typography: { fontFamily: "Poppins, sans-serif" },
  }), [isDark]);

  return <MuiThemeProvider theme={muiTheme}><CssBaseline />{children}</MuiThemeProvider>;
}

// ─── Language sync ────────────────────────────────────────────────────────────
// Uses useAuthState() — re-renders when isAuthenticated changes (correct), but
// NOT when logout actions or other auth state flips occur. Selector is granular:
// only userId + language are subscribed so profile/planLimits updates are ignored.
function DbLanguageSync() {
  const userId   = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const language = useSelector(
    (state: RootState) => (state.user.connectedUser.user as any)?.language as string | undefined,
  );
  const { isAuthenticated } = useAuthState();
  const { i18n }            = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) {
      if (typeof window !== "undefined") localStorage.removeItem(MANUAL_LANG_KEY);
      i18n.changeLanguage("en");
      return;
    }

    const dbLang = normalizeLangCode(language);
    if (dbLang) {
      if (typeof window !== "undefined") localStorage.removeItem(MANUAL_LANG_KEY);
      i18n.changeLanguage(dbLang);
      return;
    }

    const manualLang =
      typeof window !== "undefined"
        ? normalizeLangCode(localStorage.getItem(MANUAL_LANG_KEY))
        : null;
    i18n.changeLanguage(manualLang ?? "en");
  }, [isAuthenticated, userId, language]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// ─── Auth orchestration ───────────────────────────────────────────────────────
function AuthWrapper({ children }: { children: React.ReactNode }) {
  // Granular selector: only re-renders when the user identity object changes.
  // Previously selected the whole connectedUser slice — loading/profile/planLimits
  // updates all caused AuthWrapper to re-render and re-register event listeners.
  const user = useSelector((state: RootState) => state.user.connectedUser.user);

  // Wait for redux-persist to finish reading from localStorage before deciding
  // whether a profile fetch is needed. Without this guard, on a cold reload we
  // dispatch getMyProfile() immediately (user=null), then rehydration populates
  // user from localStorage — two fetches for identical data.
  const isRehydrated = useSelector((state: any) => Boolean(state._persist?.rehydrated));

  const dispatch = useDispatch<typeof store.dispatch>();
  const router   = useRouter();
  const { t }    = useTranslation("auth");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const userId = user?._id;

  // Split context subscriptions — AuthWrapper needs both halves but they're
  // now two separate hook calls so each subscription is minimal.
  const { isAuthenticated, isLoggingOut } = useAuthState();
  const { logout, clearAuth }             = useAuthActions();

  // Restore user profile after a hard reload. Only runs after rehydration so
  // that a persisted user (from localStorage) skips the network round-trip.
  useEffect(() => {
    if (!isRehydrated) return;
    if (user) return;
    if (!getToken()) return;
    dispatch(getMyProfile());
  }, [isRehydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Force logout when middleware detected an invalid / role-less token.
  useEffect(() => {
    if (router.query.force_logout !== "1") return;
    logout().finally(() => {
      persistor.purge();
      router.replace("/signin");
    });
  }, [router.query.force_logout]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep auth state in sync across browser tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAuthFromStorage = () => {
      if (!getToken() && isAuthenticated) {
        clearAuth();
        dispatch(clearConnectedUser());
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "persist:root") syncAuthFromStorage();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncAuthFromStorage);
    document.addEventListener("visibilitychange", syncAuthFromStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncAuthFromStorage);
      document.removeEventListener("visibilitychange", syncAuthFromStorage);
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NotificationProvider userId={userId}>
      {/*
        Chat bridges are dynamically imported and only rendered when authenticated.
        On auth pages (signin / otp) they are never rendered, so their chunks are
        never fetched — they do not appear in the auth-page JS bundle at all.
      */}
      {isAuthenticated && (
        <>
          <TeamChatRealtimeBridge />
          <CandidateChatRealtimeBridge />
          <ChatUnreadSyncBridge />
        </>
      )}
      <DbLanguageSync />
      {children}
      <Backdrop
        open={isLoggingOut}
        sx={{
          zIndex: 9999,
          flexDirection: "column",
          gap: 2.5,
          bgcolor: isDark ? "#0B1120" : "#FDFEFE",
        }}
      >
        <CircularProgress size={36} thickness={4} sx={{ color: "#0D9488" }} />
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "15px", color: isDark ? "#F9FAFB" : "#111827" }}>
            {t("logout.signing_out")}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
            {t("logout.please_wait")}
          </Typography>
        </Box>
      </Backdrop>
    </NotificationProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      {/*
        loading={null}: app renders immediately with empty Redux state.
        The isRehydrated guard in AuthWrapper prevents a double profile-fetch
        on cold reload.
      */}
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
        <ReactQueryProvider>
        <AuthProvider>
        <MuiThemeSync>
          <Head>
            <title>TalentAI | AI Recruitment Platform — Hire 75% Faster with Conversational AI Agents</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <meta name="description" content="TalentAI automates your entire hiring pipeline with AI agents that conduct natural video interviews, score candidates objectively, and deliver explainable evaluation reports. Cut 42-day hiring cycles to under 10 days. AI interviews from $8 each. Plans from $99/mo." />
            <meta property="og:title" content="TalentAI — AI Agents That Interview Candidates For You" />
            <meta property="og:description" content="Automate screening, interviews, and evaluation with conversational AI. Reduce hiring time by 75%. Trusted by NVIDIA Inception." />
            <meta property="og:type" content="website" />
            <link rel="icon" href="/images/home/favico.png" type="image/png" />
          </Head>
          <main className={poppins.variable}>
            <ToastProvider>
              <MuiToastWrapper />
              <AuthWrapper>
                <Component {...pageProps} />
                <ScrollToTop />
              </AuthWrapper>
            </ToastProvider>
          </main>
        </MuiThemeSync>
        </AuthProvider>
        </ReactQueryProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

// MuiToastWrapper only calls clearAuth — it never needs to know about
// isAuthenticated. Using useAuthActions() means it won't re-render on login.
function MuiToastWrapper() {
  const { open, toastOptions, closeToast, showToast } = useToast();
  const { clearAuth } = useAuthActions();

  useEffect(() => {
    setToastHandler(showToast);
  }, [showToast]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearAuth();
      store.dispatch(clearConnectedUser());
      persistor.purge();
    });
  }, [clearAuth]);

  return (
    <MuiToast
      open={open}
      message={toastOptions.message}
      severity={toastOptions.severity}
      onClose={closeToast}
    />
  );
}
