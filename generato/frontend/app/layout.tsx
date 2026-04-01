import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generato",
  description: "Generato pairs a cinematic AI landing page with a fast DAG editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
