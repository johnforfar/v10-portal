import { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import "@/app/globals.css";
import { V10Sidebar } from "@/components/V10Sidebar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-black font-sans antialiased">
        {/* Global V10 Identity Strip (Appears on all Portal-rendered pages) */}
        <div className="fixed top-0 left-0 bottom-0 w-1 bg-blue-600 z-[9999] shadow-[0_0_20px_rgba(37,99,235,0.8)]" />
        
        <div className="relative flex min-h-screen">
          <V10Sidebar />
          <main className="flex-1 lg:pl-[234px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
