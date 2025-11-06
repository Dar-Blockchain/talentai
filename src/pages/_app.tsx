import "@/styles/globals.css";
import "@/styles/walletconnect-override.css";
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
import { isCurrentTokenExpired, handleTokenExpiration, isTokenExpired, getToken } from "@/utils/tokenUtils";

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

    // Helper function to check if URL is an API call
    const isApiCall = (url: string | Request | URL): boolean => {
      if (!url) return false;
      let urlString: string;
      if (typeof url === 'string') {
        urlString = url;
      } else if (url instanceof URL) {
        urlString = url.href;
      } else {
        urlString = url.url;
      }
      
      // Check for API base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      if (apiBaseUrl && urlString.includes(apiBaseUrl)) return true;
      
      // Check for common API patterns
      if (urlString.startsWith('/api/')) return true;
      
      // Check for IP addresses with ports (like http://172.23.17.170:5000)
      const ipPortPattern = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}:\d+/;
      if (ipPortPattern.test(urlString)) return true;
      
      // Check for localhost with port
      if (urlString.includes('localhost:') || urlString.includes('127.0.0.1:')) return true;
      
      // Check if URL contains 'api' and is not a Next.js internal route
      if (urlString.includes('/api/') && !urlString.startsWith('/_next/')) return true;
      
      return false;
    };

    // Override fetch to check token expiration and intercept 401 responses
    window.fetch = async function(...args) {
      const url = args[0];
      
      // Check token expiration before making API calls
      if (isApiCall(url) && window.location.pathname !== '/signin') {
        const token = getToken();
        
        // If token exists but is expired, clear it and redirect
        if (token && isTokenExpired(token)) {
          if (!isHandling401) {
            isHandling401 = true;
            console.warn('🔒 Global: Token expired before API call', url);
            handleTokenExpiration();
          }
          // Return a rejected promise to prevent the API call
          return Promise.reject(new Error('Token expired'));
        }
      }
      
      const response = await originalFetch.apply(this, args);
      
      // Handle 401 Unauthorized responses (only for API calls)
      if (response.status === 401) {
        if (isApiCall(url) && !isHandling401 && window.location.pathname !== '/signin') {
          isHandling401 = true;
          console.warn('🔒 Global: Received 401 Unauthorized - Token expired or invalid', url);
          handleTokenExpiration();
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
