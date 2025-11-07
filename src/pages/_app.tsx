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
import { isCurrentTokenExpired, handleTokenExpiration, isTokenExpired, getToken, validateAndSyncToken, isCookieExpired } from "@/utils/tokenUtils";

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

  // Clean up nested signin URLs in returnUrl query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const pathname = window.location.pathname;
    if (pathname === '/signin' || pathname.startsWith('/signin/')) {
      // Check if returnUrl in query params points to signin (nested loop)
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      
      if (returnUrl && (returnUrl === '/signin' || returnUrl.startsWith('/signin'))) {
        // Clean up the URL by removing the nested returnUrl
        const cleanUrl = '/signin';
        if (window.location.href !== cleanUrl) {
          console.warn('🔒 Cleaning up nested signin URL in returnUrl');
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    }
  }, []);

  // Periodic check for cookie expiration and token sync (non-intrusive)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't check if already on signin page
    const currentPathname = window.location.pathname;
    if (currentPathname === '/signin' || currentPathname.startsWith('/signin/')) {
      return;
    }

    // Don't run periodic checks on dashboard pages - let API calls handle authentication
    // Dashboard pages are protected by CandidateOnly/CompanyOnly/AdminOnly components
    if (currentPathname.startsWith('/dashboard/')) {
      return;
    }

    // Set up periodic check every 60 seconds (less frequent, non-intrusive)
    const interval = setInterval(() => {
      // Don't check if already on signin page or dashboard
      const pathname = window.location.pathname;
      if (pathname === '/signin' || pathname.startsWith('/signin/') || pathname.startsWith('/dashboard/')) {
        return;
      }

      // Only sync tokens, don't check for cookie expiration or redirect
      // Cookie expiration is handled by components to prevent loops
      const cookieToken = Cookies.get('api_token');
      const localToken = localStorage.getItem('api_token');
      
      // Sync localStorage with cookie if cookie exists
      if (cookieToken && !localToken) {
        localStorage.setItem('api_token', cookieToken);
      }
      
      // If cookie exists but localStorage doesn't match, sync
      if (cookieToken && localToken && cookieToken !== localToken) {
        localStorage.setItem('api_token', cookieToken);
      }
      
      // Note: We don't clear localStorage if cookie is missing here
      // Components will handle cookie expiration detection and redirect
    }, 60000); // Check every 60 seconds (less frequent)

    return () => clearInterval(interval);
  }, []);

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
      const currentPathname = window.location.pathname;
      if (isApiCall(url) && currentPathname !== '/signin' && !currentPathname.startsWith('/signin/')) {
        const token = getToken();
        
        // Only check JWT expiration, not cookie expiration (cookie might be missing but token valid)
        // If token exists but is expired (JWT), clear it and redirect
        if (token && isTokenExpired(token)) {
          if (!isHandling401) {
            isHandling401 = true;
            console.warn('🔒 Global: Token expired (JWT) before API call', url);
            handleTokenExpiration();
          }
          // Return a rejected promise to prevent the API call
          return Promise.reject(new Error('Token expired'));
        }
        
        // Don't check cookie expiration in fetch interceptor - let components handle it
        // Just sync tokens if cookie exists
        const cookieToken = Cookies.get('api_token');
        const localToken = localStorage.getItem('api_token');
        
        // Sync localStorage with cookie if cookie exists
        if (cookieToken && !localToken) {
          localStorage.setItem('api_token', cookieToken);
        }
        
        // If both exist but are different, prefer cookie
        if (cookieToken && localToken && cookieToken !== localToken) {
          localStorage.setItem('api_token', cookieToken);
        }
      }
      
      const response = await originalFetch.apply(this, args);
      
      // Handle 401 Unauthorized responses (only for API calls)
      if (response.status === 401) {
        const pathname = window.location.pathname;
        if (isApiCall(url) && !isHandling401 && pathname !== '/signin' && !pathname.startsWith('/signin/')) {
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
