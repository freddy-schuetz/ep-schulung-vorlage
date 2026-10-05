import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frontend-Starter der Schulung",
  description: "Next.js mit n8n-Webhook (Muster A) und optionalem KI-Chat (Muster C)",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
