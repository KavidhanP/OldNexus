"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/landing";

  if (isLanding) {
    return <div className="min-h-screen bg-[#050507]">{children}</div>;
  }

  return (
    <main
      className="min-h-screen"
      style={{
        marginLeft: "var(--sidebar-width)",
        paddingTop: "var(--topbar-height)",
      }}
    >
      <div className="p-6 animate-fade-in">{children}</div>
    </main>
  );
}
