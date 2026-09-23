import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"]
});

import { APP_CONFIG } from "@/constants/config";
import { AbilityProvider } from "@/components/AbilityProvider";
import QueryProvider from "@/components/QueryProvider";
import { SessionProvider } from "@/contexts/SessionContext";

export const metadata: Metadata = {
  title: `${APP_CONFIG.institution.name} ${APP_CONFIG.institution.hubName} | School Management System`,
  description: "Advanced Institutional Governance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(outfit.variable, plusJakarta.variable)} suppressHydrationWarning>
      <body className={cn(plusJakarta.className, "bg-[#FBFBFC] text-slate-900 antialiased font-sans")} suppressHydrationWarning>
        <QueryProvider>
          <SessionProvider>
            <AbilityProvider>
              <Toaster position="top-center" />
              <div className="flex min-h-screen relative">
                <Sidebar />
                {/* 🚀 Main Content Wrapper with Sidebar Offset */}
                <div className="flex-1 flex flex-col min-h-screen  transition-all duration-300">
                <Header />
                <main className="flex-1 overflow-y-auto no-scrollbar">
                  {children}
                </main>
              </div>
            </div>
          </AbilityProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
