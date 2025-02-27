import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tuntihinnat Suomessa | Pörssisähkö",
  description: "Seuraa nykyisiä ja tulevia sähkön tuntihintoja Suomessa. Löydä halvimmat tunnit käyttää sähköä ja suunnittele käyttösi säästääksesi rahaa.",
  keywords: "sähkön hinnat, Suomi, tuntihinnat, energiakustannukset, pörssisähkö",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
