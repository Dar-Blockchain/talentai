import "@/styles/globals.css";
import "@/i18n/config"; // initialise i18next before anything renders
import "@/lib/dayjs";   // extend dayjs plugins globally
import type { AppProps } from "next/app";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, persistor, RootState } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, createTheme, CssBaseline, Dialog, DialogContent, Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { Poppins } from "next/font/google";
import MuiToast from "@/components/ui/Toast";
import { useToast, ToastProvider } from "@/hooks/useToast";
import { NotificationProvider } from "@/contexts/NotificationContext";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { isLoggingOutCheck, clearAuth, logout } from "@/store/slices/authSlice";
import { clearConnectedUser } from "@/store/slices/userSlice";
import { setToastHandler } from "@/utils/toastEmitter";
import { setSessionExpiredHandler } from "@/utils/storeEmitter";
import { useTranslation } from "react-i18next";
import { normalizeLangCode, MANUAL_LANG_KEY } from "@/hooks/useLanguage";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "rgba(77, 217, 163, 1)",
    },
    secondary: {
      main: "rgba(41, 210, 145, 0.83)",
    },
    background: {
      default: "white",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

function DbLanguageSync() {
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!user) return;
    // language is stored on the User document, not the Profile
    const raw = (user as any)?.language;
    const dbLang = normalizeLangCode(raw);
    if (!dbLang) return;
    // Always apply the account's saved language — clear any pre-login guest selection
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MANUAL_LANG_KEY);
    }
    i18n.changeLanguage(dbLang);
  }, [(user as any)?.language, (user as any)?._id]);
  return null;
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch<typeof store.dispatch>();
  const router = useRouter();
  const { t } = useTranslation('auth');

  const userId = user?._id;
  const isLoggingOut = useSelector(isLoggingOutCheck);

  // Force logout when middleware detected an invalid/role-less token
  useEffect(() => {
    if (router.query.force_logout !== "1") return;
    dispatch(logout()).finally(() => {
      persistor.purge();
      router.replace("/signin");
    });
  }, [router.query.force_logout]);

  // Keep auth state in sync across tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasLocalToken = () => {
      const token = localStorage.getItem("api_token") || localStorage.getItem("token");
      return !!token;
    };

    const syncAuthFromStorage = () => {
      if (!hasLocalToken() && isAuthenticated) {
        dispatch(clearAuth());
        dispatch(clearConnectedUser());
      }
    };

    const onStorage = (event: StorageEvent) => {
      // localStorage.clear() from another tab sets key to null.
      if (!event.key || event.key === "api_token" || event.key === "token" || event.key === "persist:root") {
        syncAuthFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncAuthFromStorage);
    document.addEventListener("visibilitychange", syncAuthFromStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncAuthFromStorage);
      document.removeEventListener("visibilitychange", syncAuthFromStorage);
    };
  }, [dispatch, isAuthenticated]);

  return (
    <NotificationProvider userId={userId}>
      <DbLanguageSync />
      {children}
      <Dialog
        open={isLoggingOut}
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 4,
            py: 3.5,
            minWidth: 260,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}>
          <CircularProgress size={36} thickness={4} sx={{ color: "#0D9488" }} />
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
              {t('logout.signing_out')}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
              {t('logout.please_wait')}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </NotificationProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Head>
            <title>TalentAI | AI Recruitment Platform — Hire 75% Faster with Conversational AI Agents</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <meta name="description" content="TalentAI automates your entire hiring pipeline with AI agents that conduct natural video interviews, score candidates objectively, and issue blockchain-verified credentials. Cut 42-day hiring cycles to under 10 days. AI interviews from $8 each. Plans from $99/mo." />
            <meta property="og:title" content="TalentAI — AI Agents That Interview Candidates For You" />
            <meta property="og:description" content="Automate screening, interviews, and evaluation with conversational AI. Reduce hiring time by 75%. Trusted by NVIDIA Inception & built on Hedera." />
            <meta property="og:type" content="website" />
            <link rel="icon" href="/favicon.ico" />
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
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

function MuiToastWrapper() {
  const { open, toastOptions, closeToast, showToast } = useToast();

  useEffect(() => {
    setToastHandler(showToast);
  }, [showToast]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      store.dispatch(clearAuth());
      store.dispatch(clearConnectedUser());
      persistor.purge();
    });
  }, []);

  return (
    <MuiToast
      open={open}
      message={toastOptions.message}
      severity={toastOptions.severity}
      onClose={closeToast}
    />
  );
}
