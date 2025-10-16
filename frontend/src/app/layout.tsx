import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexiSync - Document Summary Generator",
  description: "Generate summaries using AI and local LLM models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
