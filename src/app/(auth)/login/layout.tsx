import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Login - ProjectDark",
  description: "Login to your ProjectDark account",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 