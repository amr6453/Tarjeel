import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "صالون تَرجِيل VIP | المركز الفاخر للعناية والتجميل",
  description: "تجربة عناية استثنائية وبوابة حجز رقمية وإدارة متكاملة لصالونات التجميل والعناية بالرياض.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-cairo antialiased selection:bg-tarjeel-200 selection:text-tarjeel-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}


