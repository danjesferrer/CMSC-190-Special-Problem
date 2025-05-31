import "./globals.css";
import type { Metadata } from "next";
import { FileProvider, NextThemeProvider, ReduxProvider } from "@/provider";

export const metadata: Metadata = {
  title: "SAKAHAN",
  description: "A Web-GIS Application with Dynamic Data Management for Crop Suitability Mapping in the Philippine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NextThemeProvider>
          <ReduxProvider>
            <FileProvider>{children}</FileProvider>
          </ReduxProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
