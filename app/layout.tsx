import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";

export const metadata: Metadata = {
  title: {
    template: "%s | Nexus OS",
    default: "Nexus OS — Insurance & PE Intelligence Platform",
  },
  description:
    "Nexus OS bridges insurance brokerage and private equity with AI-powered contract analysis, M&A due diligence scanning, and HNWI wealth management.",
  keywords: ["insurance", "private equity", "M&A", "due diligence", "premium discrepancy", "HNWI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-frost antialiased">
        <Sidebar />
        <TopBar />
        <main
          className="min-h-screen"
          style={{
            marginLeft: "var(--sidebar-width)",
            paddingTop: "var(--topbar-height)",
          }}
        >
          <div className="p-6 animate-fade-in">{children}</div>
        </main>
      </body>
    </html>
  );
}
