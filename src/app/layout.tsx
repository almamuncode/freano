import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import Footer from "@/components/Footer";
import ToastViewport from "@/components/ToastViewport";
import OfflineTransactionSync from "@/components/OfflineTransactionSync";

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
    icon: [{ url: "/icons/icon.png?v=2", sizes: "81x81", type: "image/png" }],
    shortcut: "/icons/icon.png?v=2",
    apple: "/icons/icon.png?v=2",
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
          <ToastViewport />
          <OfflineTransactionSync />
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
