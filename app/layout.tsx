import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";
import AppLayoutWrapper from "@/components/shell/AppLayoutWrapper";
import { NexusProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: {
    template: "%s | Nexus OS",
    default: "UniqueYou — Shaping The Future of Work & Graduation",
  },
  description:
    "Discover a new era of education and career potential with AI-driven lead capture and 3D constellation intelligence.",
  keywords: ["landing page", "leads", "education", "3d cap", "future of work"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-frost antialiased" suppressHydrationWarning>
        <NexusProvider>
          <Sidebar />
          <TopBar />
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </NexusProvider>
      </body>
    </html>
  );
}
