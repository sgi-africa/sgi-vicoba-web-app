import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: "SGI Africa",
  description: "SGI Africa Web Application",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
          />
        </SessionProvider>
      </body>
    </html>
  );
}
