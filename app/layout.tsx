import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteMetadata } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteMetadata.name,
  description: siteMetadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--color-background)]" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-[var(--color-background)] text-[var(--color-foreground)]`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
                <SiteHeader />
                <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
                  {children}
                </main>
                <SiteFooter />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
