import { Big_Shoulders, Hanken_Grotesk } from "next/font/google";

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

export const fontVars = `${bigShoulders.variable} ${hanken.variable}`;
