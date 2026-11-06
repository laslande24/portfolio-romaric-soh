import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";

// Bricolage Grotesque: variable, with an optical-size axis so letterforms
// tighten for the 72px headline and open up for 15px body text.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const fontVars = `${bricolage.variable} ${geistMono.variable}`;
