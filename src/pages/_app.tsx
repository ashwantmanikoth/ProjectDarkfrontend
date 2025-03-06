// pages/_app.tsx

import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: any } }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;
