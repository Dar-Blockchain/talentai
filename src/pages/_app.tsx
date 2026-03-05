import "@/styles/globals.css";
import "@/styles/walletconnect-override.css";
import type { AppProps } from "next/app";
import { Provider, useSelector } from "react-redux";
import { store, persistor, RootState } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Head from "next/head";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { Poppins } from "next/font/google";
import MuiToast from "@/components/ui/Toast";
import { useToast, ToastProvider } from "@/hooks/useToast";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { isTokenExpired } from "@/utils/tokenUtils";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { isLoggingOutCheck, clearAuth } from "@/store/slices/authSlice";
import { clearConnectedUser } from "@/store/slices/userSlice";
import { setToastHandler } from "@/utils/toastEmitter";
import { setSessionExpiredHandler } from "@/utils/storeEmitter";

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

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.user.connectedUser);

  const userId = user?._id;
  const { checkingAuth } = useAuthCheck();
  const isLoggingOut = useSelector(isLoggingOutCheck);

  useEffect(() => {
    const token = localStorage.getItem("api_token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("api_token");
      localStorage.removeItem("token");
      Cookies.remove("api_token");
      Cookies.remove("token");
    }
  }, []);

  if(isLoggingOut) return <LoadingScreen title='Logging out, please wait...'/>

  if (checkingAuth) {
    return <LoadingScreen />;
  }

  return (
    <NotificationProvider userId={userId}>{children}</NotificationProvider>
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
