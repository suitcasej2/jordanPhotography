import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.homeDescription,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.seo.siteName,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "photography",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES", "ca_ES"],
    url: siteUrl,
    siteName: siteConfig.seo.siteName,
    title: siteConfig.seo.homeTitle,
    description: siteConfig.seo.homeDescription,
    images: [
      {
        url: "/portfolio/hero.webp",
        width: 1920,
        height: 1080,
        alt: `${siteConfig.photographerName} — Documentary photography in ${siteConfig.location.city}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.homeTitle,
    description: siteConfig.seo.homeDescription,
    images: ["/portfolio/hero.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": `${siteConfig.location.countryCode}-CT`,
    "geo.placename": siteConfig.location.city,
    "geo.position": `${siteConfig.location.latitude};${siteConfig.location.longitude}`,
    ICBM: `${siteConfig.location.latitude}, ${siteConfig.location.longitude}`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
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
