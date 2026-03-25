import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "¿Puedo comprar piso en España? Calculadora por comunidad autónoma",
  description:
    "Calcula si puedes permitirte una hipoteca en tu comunidad autónoma con datos oficiales del INE. Precio por m², esfuerzo salarial y cuota mensual.",
  keywords:
    "hipoteca, vivienda España, precio piso, accesibilidad vivienda, INE",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>",
  },
  openGraph: {
    title: "¿Puedo comprar piso en España?",
    description:
      "Calculadora de accesibilidad a la vivienda con datos del INE.",
    url: "https://tu-url.vercel.app",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
