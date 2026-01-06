import "@/styles/globals.css";
import "@/styles/walletconnect-override.css";
import type { AppProps } from "next/app";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "../store/store";
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
  const profile = useSelector((state: RootState) => state.profile.profile);
  const userId = profile?.userId?._id;
  const { checkingAuth } = useAuthCheck();

  useEffect(() => {
    const token = localStorage.getItem("api_token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("api_token");
      Cookies.remove("api_token");
    }
  }, []);

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Head>
          <title>TalentAI</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
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
    </Provider>
  );
}

function MuiToastWrapper() {
  const { open, toastOptions, closeToast } = useToast();
  return (
    <MuiToast
      open={open}
      message={toastOptions.message}
      severity={toastOptions.severity}
      onClose={closeToast}
    />
  );
}
