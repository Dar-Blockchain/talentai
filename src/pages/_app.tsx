import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";
import Head from "next/head";
import ScrollToTop from "@/components/ScrollToTop";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00FF9D", // Bright mint green
    },
    secondary: {
      main: "rgba(41, 210, 145, 0.83)", // Soft translucent green
    },
    background: {
      default: "white", // Consider switching to a dark color if using dark mode
      //   paper: 'white',
    },
  },
});

// Wrapper component to handle token storage and global 401 handling
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      // Store the API token in a cookie and localStorage
      Cookies.set("api_token", session.accessToken, {
        expires: 30, // 30 days
        sameSite: "lax",
      });
      localStorage.setItem("api_token", session.accessToken);
    }
  }, [session]);

  // Global fetch interceptor to handle 401 responses
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Flag to prevent multiple redirects
    let isHandling401 = false;

    // Store original fetch
    const originalFetch = window.fetch;

    // Override fetch to intercept 401 responses
    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args);
      
      // Handle 401 Unauthorized responses (only for API calls)
      if (response.status === 401) {
        const url = args[0] as string;
        const isApiCall = url && (
          url.includes(process.env.NEXT_PUBLIC_API_BASE_URL || '') ||
          url.startsWith('/api/') ||
          url.includes('api')
        );

        if (isApiCall && !isHandling401 && window.location.pathname !== '/signin') {
          isHandling401 = true;
          console.warn('🔒 Global: Received 401 Unauthorized - Token expired or invalid');
          
          // Clear tokens
          localStorage.removeItem('api_token');
          Cookies.remove('api_token');
          
          // Redirect to login with current path as returnUrl
          const currentPath = window.location.pathname + window.location.search;
          const loginUrl = `/signin${currentPath !== '/signin' ? `?returnUrl=${encodeURIComponent(currentPath)}` : ''}`;
          
          // Use setTimeout to prevent immediate redirect loops
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 100);
        }
      }
      
      return response;
    };

    // Cleanup: restore original fetch
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
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/favicon.ico" />
            <link rel="shortcut icon" href="/favicon.ico" />
          </Head>
          <AuthWrapper>
            <Component {...pageProps} />
            <ScrollToTop />
          </AuthWrapper>
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
}
