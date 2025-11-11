import "@/styles/globals.css";
import "@/styles/walletconnect-override.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import Cookies from "js-cookie";
import Head from "next/head";
import ScrollToTop from "@/components/ScrollToTop";
import {
  handleTokenExpiration,
  isTokenExpired,
  getToken,
} from "@/utils/tokenUtils";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00FF9D",
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
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      Cookies.set("api_token", session.accessToken, {
        expires: 30,
        sameSite: "lax",
      });
      localStorage.setItem("api_token", session.accessToken);
    }
  }, [session]);

  // 🔁 Periodic token sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      const cookieToken = Cookies.get("api_token");
      const localToken = localStorage.getItem("api_token");

      if (cookieToken && !localToken) localStorage.setItem("api_token", cookieToken);
      if (cookieToken && localToken && cookieToken !== localToken)
        localStorage.setItem("api_token", cookieToken);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 🔒 Global fetch interceptor
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isHandling401 = false;
    const originalFetch = window.fetch;

    const isApiCall = (url: string | Request | URL): boolean => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const urlStr =
        typeof url === "string"
          ? url
          : url instanceof URL
          ? url.href
          : url.url;
      return (
        urlStr.includes(apiBase) ||
        urlStr.startsWith("/api/") ||
        /^https?:\/\/(\d{1,3}\.){3}\d{1,3}:\d+/.test(urlStr) ||
        urlStr.includes("localhost:")
      );
    };

    window.fetch = async function (...args) {
      const url = args[0];
      const pathname = window.location.pathname;

      if (isApiCall(url) && !pathname.startsWith("/signin")) {
        const token = getToken();
        if (token && isTokenExpired(token)) {
          if (!isHandling401) {
            isHandling401 = true;
            console.warn("🔒 Token expired before API call:", url);
            handleTokenExpiration();
          }
          return Promise.reject(new Error("Token expired"));
        }

        const cookieToken = Cookies.get("api_token");
        const localToken = localStorage.getItem("api_token");
        if (cookieToken && !localToken)
          localStorage.setItem("api_token", cookieToken);
        if (cookieToken && localToken && cookieToken !== localToken)
          localStorage.setItem("api_token", cookieToken);
      }

      const response = await originalFetch.apply(this, args);
      if (
        response.status === 401 &&
        isApiCall(url) &&
        !isHandling401 &&
        !window.location.pathname.startsWith("/signin")
      ) {
        isHandling401 = true;
        console.warn("🔒 Received 401 Unauthorized:", url);
        handleTokenExpiration();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Head>
            <title>TalentAI</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className={poppins.variable}>
            <AuthWrapper>
              <Component {...pageProps} />
              <ScrollToTop />
            </AuthWrapper>
          </main>
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
}
