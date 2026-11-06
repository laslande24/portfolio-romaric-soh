import { Big_Shoulders, Geist_Mono, Hanken_Grotesk } from "next/font/google";

// Big Shoulders: condensed poster face for the giant titles. Variable weight
// (the tour thins it out as the camera leaves) and an optical-size axis that
// reaches its display cut at 72.
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
  display: "swap",
});

// Hanken Grotesk: the reading face, variable weight.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

// ponytail: mono stays for the case studies and CV meta until phase D retypes them.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const fontVars = `${bigShoulders.variable} ${hanken.variable} ${geistMono.variable}`;
