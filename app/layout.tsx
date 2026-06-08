// @ts-ignore
import "./globals.css";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";
import QueryProvider from "./providers/query-provider";
import { Toaster } from "sonner";
import Script from 'next/script';


// Mulish: Global variable font (default via font-sans)
const mulish = Mulish({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mulish",
  display: "swap",
});

// Momo Trust Display: Local font (override when needed)
const momoTrustDisplay = localFont({
  src: "./fonts/MomoTrustDisplay-Regular.ttf", // Must be in app/fonts/
  variable: "--font-momo-trust-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LiquidsAIO",
  description: "LiquidsAIO",
  icons: {
    icon: '/images/auth/logo.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${mulish.variable} ${momoTrustDisplay.variable} font-mulish antialiased`}>
        <Script
          // src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}
          // strategy="afterInteractive"
        />
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" richColors closeButton />   {/* ← Add this */}
      </body>
    </html>
  );
}