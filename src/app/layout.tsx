import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carematch",
  description:
    "Mediatore relazionale intelligente per l'incontro tra persone con disabilità e badanti.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}

