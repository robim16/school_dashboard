import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "School Dashboard | Futuristic Learning",
  description: "Next generation school management system with real-time analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen antialiased`}>
        {children}
        <Toaster richColors closeButton theme="dark" position="top-right" />
      </body>
    </html>
  );
}
