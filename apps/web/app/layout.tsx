import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { ClientInit } from "@/modules/dashboard/ui/components/client-init";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@workspace/ui/components/sonner";
import "@workspace/ui/globals.css";
import { Provider as JotaiProvider } from "jotai";
const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
        <JotaiProvider>
          <ClerkProvider>
            <Providers>
              <ClientInit/>
              <Toaster />
             
              <AuthGuard>{children}</AuthGuard>
            </Providers>
          </ClerkProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
