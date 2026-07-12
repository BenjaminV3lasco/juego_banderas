import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "MundoQuiz — Juegos de banderas",
  description: "Pon a prueba cuánto sabes del mundo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('mundoquiz_theme')==='dark'?'dark':'light'}catch{}` }} /></head><body className={poppins.className}>{children}</body></html>;
}
