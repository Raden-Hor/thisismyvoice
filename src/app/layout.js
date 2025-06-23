import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "This is my voice at KSHRD",
  description: "Raden's portfolio from Korean Software HRD Center (KSHRD). Showcasing projects and skills developed at HRD Center, Cambodia's leading software development training institute.",
  keywords: "Raden, HRD Center, HRD, hrd, kshrd, KSHRD, Korean Software HRD Center, portfolio, software development, Cambodia, programming",
  authors: [{ name: "Raden - Korean Software HRD Center Graduate" }],
  openGraph: {
    title: "Raden - Korean Software HRD Center Portfolio | KSHRD Graduate",
    description: "Explore Raden's portfolio from Korean Software HRD Center (KSHRD). Featuring projects and expertise in software development from Cambodia's premier HRD training program.",
    images: [
      {
        url: "/images/raden-kshrd-portfolio.jpg",
        alt: "Raden's portfolio from Korean Software HRD Center (KSHRD) - Software development projects and skills showcase",
      },
    ],
    type: "website",
    siteName: "Raden Portfolio - KSHRD",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raden - Korean Software HRD Center Portfolio | KSHRD",
    description: "Portfolio showcasing software development projects from Korean Software HRD Center (KSHRD) graduate Raden.",
    images: ["/images/raden-kshrd-portfolio.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="Raden's portfolio from Korean Software HRD Center (KSHRD). Showcasing projects and skills developed at HRD Center, Cambodia's leading software development training institute."
        />
        <meta
          name="keywords"
          content="Raden, HRD Center, HRD, hrd, kshrd, KSHRD, Korean Software HRD Center, portfolio, software development, Cambodia, programming"
        />
        <meta
          name="author"
          content="Raden - Korean Software HRD Center Graduate"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
