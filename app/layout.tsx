import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://studio-suelen-vaes.sandrocagliari1979.chatgpt.site"),
  title: {
    default: "Studio Suelen Vaes | Mega Hair em Bento Gonçalves",
    template: "%s | Studio Suelen Vaes",
  },
  description:
    "Studio de beleza em Bento Gonçalves com especialização em mega hair e uma experiência dedicada à beleza e à autoestima.",
  keywords: [
    "mega hair Bento Gonçalves",
    "Studio Suelen Vaes",
    "salão de beleza Bento Gonçalves",
    "beleza e autoestima",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Studio Suelen Vaes | Sua transformação começa aqui",
    description: "Especialização em mega hair e beleza em Bento Gonçalves/RS.",
    type: "website",
    locale: "pt_BR",
    siteName: "Studio Suelen Vaes",
  },
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
