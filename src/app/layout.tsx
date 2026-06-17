import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const vtcDuBois = localFont({
  src: [
    {
      path: "../../public/fonts/VTCDuBoisTrial-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/VTCDuBoisTrial-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/VTCDuBoisTrial-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vtc",
  display: "swap",
});

const bookingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-booking",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jordan Photo Share",
  description: "Private client galleries for documentary photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${vtcDuBois.variable} ${bookingFont.variable} h-full`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0&display=swap"
        />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
