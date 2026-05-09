import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "朝バナナ散歩",
  description: "朝20分、人生を整える。歩く。食べる。記録する。朝の小さな習慣で、心と体のリズムをつくる。",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F59E0B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="朝バナナ散歩" />
      </head>
      <body className="bg-amber-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
