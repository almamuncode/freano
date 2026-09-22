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
    icon: [
      { url: "/icons/icon-dark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-dark-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-dark-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111714",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <Providers>
          <ServiceWorkerRegister />
          <InstallPrompt />
          <Navbar />
          <main className="app-main app-reveal mx-auto min-h-[calc(100vh-4.5rem)] max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
