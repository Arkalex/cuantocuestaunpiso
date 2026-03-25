import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Accesibilidad a la vivienda en España",
  description:
    "¿Puedes permitirte vivir en España? Basado en datos abiertos del INE.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
