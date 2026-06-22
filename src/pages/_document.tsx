import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0D9488" />
        <link rel="icon" href="/images/home/favico.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
