import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/mock-auth";
import { AppHeader } from "@/components/AppHeader";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Шаблоны фото — MVP",
  description: "Генерация изображений по шаблонам из ваших фото",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AuthProvider>
          <AppHeader />
          <main className="pt-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
