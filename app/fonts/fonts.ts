import { Mulish } from "next/font/google";
import localFont from "next/font/local";


// Mulish: Global variable font
export const mulish = Mulish({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-mulish",
  display: "swap",
});

// Momo Trust Display: Local font (available but not default)
export const momoTrustDisplay = localFont({
  src: "/MomoTrustDisplay-Regular.ttf", // File in app/fonts/
  variable: "--font-momo-trust-display",
  display: "swap",
});