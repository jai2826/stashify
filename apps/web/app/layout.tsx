import { Geist, Geist_Mono } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { Toaster } from "@workspace/ui/components/sonner";
import { Provider as JotaiProvider } from "jotai";
import { UploadDialog } from "@workspace/ui/modules/upload-dialog";
import { CreateFolderDialog } from "@workspace/ui/modules/create-folder-dialog";
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
              <Toaster />
             
              <AuthGuard>{children}</AuthGuard>
            </Providers>
          </ClerkProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
