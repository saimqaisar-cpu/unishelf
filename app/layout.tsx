import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Prescribed Books Platform",
  description: "GCUF Prescribed Books Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full flex flex-col antialiased font-sans"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}