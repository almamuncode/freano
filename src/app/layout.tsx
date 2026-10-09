import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import Footer from "@/components/Footer";
import ToastViewport from "@/components/ToastViewport";

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
    icon: [{ url: "/icons/freano-app.png?v=3", sizes: "263x263", type: "image/png" }],
    shortcut: "/icons/freano-app.png?v=3",
    apple: "/icons/freano-app.png?v=3",
  },
};

export const viewport: Viewport = {
  themeColor: "#5428df",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <Providers>
          <ToastViewport />
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
