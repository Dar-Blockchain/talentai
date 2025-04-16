import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { SessionProvider } from "next-auth/react";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#02E2FF',
        },
        secondary: {
            main: '#00FFC3',
        },
        background: {
            default: '#00072D',
            paper: 'rgba(255, 255, 255, 0.1)',
        },
    },
});

// Wrapper component to handle token storage
function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.accessToken) {
            // Store the API token in a cookie and localStorage
            Cookies.set('api_token', session.accessToken, {
                expires: 30, // 30 days
                sameSite: 'lax'
            });
            localStorage.setItem('api_token', session.accessToken);
        }
    }, [session]);

    return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider session={pageProps.session}>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AuthWrapper>
                        <Component {...pageProps} />
                    </AuthWrapper>
                </ThemeProvider>
            </Provider>
        </SessionProvider>
    );
}
