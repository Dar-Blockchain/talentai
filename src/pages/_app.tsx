import "@/styles/globals.css";
import "@/i18n/config"; // initialise i18next before anything renders
import "@/lib/dayjs";   // extend dayjs plugins globally
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import dynamic from "next/dynamic";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, persistor, RootState } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useRouter } from "next/router";
import Head from "next/head";
import ScrollToTop from "@/modules/shared/ui/ScrollToTop";
import LoadingScreen from "@/modules/shared/ui/LoadingScreen";
import { Poppins } from "next/font/google";
import MuiToast from "@/components/ui/Toast";
import { Toaster } from "@/modules/shared/ui/shadcn/sonner";
import { useToast, ToastProvider } from "@/hooks/useToast";
import { NotificationProvider } from "@/modules/notifications/shared/context";
import { AuthProvider, useAuthState, useAuthActions } from "@/modules/auth/shared/context/AuthContext";
import { getMyProfile } from "@/store/slices/userSlice";
import { getToken } from '@/modules/auth/shared/utils/token';
import { setToastHandler } from "@/utils/toastEmitter";
import { setSessionExpiredHandler } from "@/utils/storeEmitter";
import { useTranslation } from "react-i18next";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { normalizeLangCode, MANUAL_LANG_KEY } from "@/hooks/useLanguage";
import LogoutOverlay from "@/modules/shared/ui/LogoutOverlay";

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
  // Granular selector: only re-renders when the user id changes.
  // Previously selected the whole connectedUser slice — loading/profile/planLimits
  // updates all caused AuthWrapper to re-render and re-register event listeners.
  const userId = useSelector((state: RootState) => state.user.connectedUser.user?._id);

  // Wait for redux-persist to finish reading from localStorage before deciding
  // whether a profile fetch is needed. Without this guard, on a cold reload we
  // dispatch getMyProfile() immediately (user=null), then rehydration populates
  // user from localStorage — two fetches for identical data.
  const isRehydrated = useSelector((state: any) => Boolean(state._persist?.rehydrated));

  const dispatch = useDispatch<typeof store.dispatch>();
  const router   = useRouter();

  // Split context subscriptions — AuthWrapper needs both halves but they're
  // now two separate hook calls so each subscription is minimal.
  const { isAuthenticated, isLoggingOut } = useAuthState();
  const { logout, finishLoggingOut } = useAuthActions();

  // Expose for cross-tab sync closure below (avoids stale-closure issues with
  // the inline lambda capturing an outdated reference to these values).
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  // Dismiss the logout overlay only once the post-logout navigation has
  // actually landed, instead of a fixed timer. A fixed timer (the old
  // approach) hides the overlay before a slow/throttled connection finishes
  // the route change, exposing the already-cleared dashboard underneath for
  // a moment before the new page finally takes over.
  useEffect(() => {
    if (!isLoggingOut) return;
    const onSettled = () => finishLoggingOut();
    router.events.on("routeChangeComplete", onSettled);
    router.events.on("routeChangeError", onSettled);
    return () => {
      router.events.off("routeChangeComplete", onSettled);
      router.events.off("routeChangeError", onSettled);
    };
  }, [isLoggingOut, finishLoggingOut]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore user profile after a hard reload. Only runs after rehydration so
  // that a persisted user (from localStorage) skips the network round-trip.
  useEffect(() => {
    if (!isRehydrated) return;
    if (userId) return;
    if (!getToken()) return;
    dispatch(getMyProfile());
  }, [isRehydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Force logout when middleware detected an invalid / role-less token.
  // Guard: only trigger if actually authenticated — prevents a malicious
  // cross-site redirect (?force_logout=1) from logging out a visiting user.
  useEffect(() => {
    if (router.query.force_logout !== "1") return;
    if (isAuthenticated) {
      logout().finally(() => router.replace("/signin"));
    } else {
      router.replace("/signin");
    }
  }, [router.query.force_logout]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep auth state in sync across browser tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAuthFromStorage = () => {
      // Use ref so the closure always reads the latest isAuthenticated value.
      if (!getToken() && isAuthenticatedRef.current) {
        // Full cleanup: clears Redux, persistor, React Query cache, and auth state.
        // Previously only called clearAuth + clearConnectedUser, leaving stale
        // data in localStorage and the React Query cache after cross-tab logout.
        finishLoggingOut();
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
  }, [finishLoggingOut]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <LogoutOverlay open={isLoggingOut} />
    </NotificationProvider>
  );
}

// ─── Persistent-layout support (Next.js Pages Router pattern) ───────────────
// A page opts into a persistent shell by assigning `Page.getLayout`. Because
// `getLayout` is a stable function reference (e.g. `getDashboardLayout`,
// shared across every dashboard page), the element it returns has the same
// component type + tree position on every navigation, so React reconciles it
// in place instead of unmounting/remounting it — only the page content
// (`children`) swaps out. Pages without `getLayout` render unwrapped, exactly
// as before.
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// Stable reference so pages without `getLayout` don't get a fresh fallback
// function on every render — that broke the "same component type" check
// React relies on to reconcile the persistent layout in place.
const defaultGetLayout = (page: ReactElement) => page;

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? defaultGetLayout;

  return (
    <Provider store={store}>
      {/*
        loading={null}: app renders immediately with empty Redux state.
        The isRehydrated guard in AuthWrapper prevents a double profile-fetch
        on cold reload.
      */}
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
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
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className={poppins.variable}>
            <Toaster richColors />
            <ToastProvider>
              <MuiToastWrapper />
              <AuthWrapper>
                {getLayout(<Component {...pageProps} />)}
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

// MuiToastWrapper only calls logout — it never needs to know about
// isAuthenticated. Using useAuthActions() means it won't re-render on login.
function MuiToastWrapper() {
  const { open, toastOptions, closeToast, showToast } = useToast();
  const { logout } = useAuthActions();

  useEffect(() => {
    setToastHandler(showToast);
  }, [showToast]);

  useEffect(() => {
    // Route session-expiry through the same teardown as a manual logout
    // (cookie + redux + localStorage + persistor + query cache) instead of
    // a hand-rolled subset — this previously skipped clearTokens() and
    // queryClient.clear(), leaving a dead cookie and stale cached data behind.
    setSessionExpiredHandler(() => {
      logout();
    });
  }, [logout]);

  return (
    <MuiToast
      open={open}
      message={toastOptions.message}
      severity={toastOptions.severity}
      onClose={closeToast}
    />
  );
}
