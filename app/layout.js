import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/Header";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "¿Puedo comprarme un piso en España? Calculadora con datos del INE",
  description:
    "Calcula si puedes permitirte comprar un piso en tu comunidad autónoma, provincia o municipio. Precio por m², cuota de hipoteca y esfuerzo salarial con datos oficiales del INE y Ministerio de Vivienda.",
  keywords:
    "puedo comprarme un piso, calculadora hipoteca españa, precio vivienda por comunidad, esfuerzo salarial vivienda, accesibilidad vivienda españa",
  openGraph: {
    title: "¿Puedo comprarme un piso en España?",
    description:
      "Calcula si puedes permitirte una hipoteca en tu comunidad autónoma con datos oficiales del INE.",
    url: "https://www.cuantocuestaunpiso.es",
    siteName: "cuantocuestaunpiso.es",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Puedo comprarme un piso en España?",
    description:
      "Calculadora de accesibilidad a la vivienda con datos del INE y Ministerio de Vivienda.",
  },
  alternates: {
    canonical: "https://www.cuantocuestaunpiso.es",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Header />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "cuantocuestaunpiso.es",
              description:
                "Calculadora de accesibilidad a la vivienda en España con datos del INE y Ministerio de Vivienda",
              url: "https://www.cuantocuestaunpiso.es",
              applicationCategory: "FinanceApplication",
              inLanguage: "es",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
            }),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
