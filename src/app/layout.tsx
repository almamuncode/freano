import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Freano — Money Management for Freelancers",
  description: "Track your income, expenses, family and personal costs — all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Freano",
  },
  applicationName: "Freano",
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <Providers>
          <ServiceWorkerRegister />
          <InstallPrompt />
          <Navbar />
          <main className="app-reveal mx-auto min-h-[calc(100vh-4.5rem)] max-w-5xl px-4 py-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}