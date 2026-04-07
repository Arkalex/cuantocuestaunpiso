import { redirect } from "next/navigation";

// Mapping: URL slug → canonical CCAA name used in the app
const SLUG_TO_CCAA = {
  andalucia: "Andalucía",
  aragon: "Aragón",
  asturias: "Asturias",
  baleares: "Baleares",
  canarias: "Canarias",
  cantabria: "Cantabria",
  "castilla-la-mancha": "Castilla-La Mancha",
  "castilla-y-leon": "Castilla y León",
  cataluna: "Cataluña",
  "comunitat-valenciana": "C. Valenciana",
  extremadura: "Extremadura",
  galicia: "Galicia",
  "la-rioja": "La Rioja",
  madrid: "Madrid",
  murcia: "Murcia",
  navarra: "Navarra",
  "pais-vasco": "País Vasco",
  ceuta: "Ceuta",
  melilla: "Melilla",
};

export function generateStaticParams() {
  return Object.keys(SLUG_TO_CCAA).map((slug) => ({ ccaa: slug }));
}

export default function CcaaPage({ params }) {
  const ccaaName = SLUG_TO_CCAA[params.ccaa];

  if (!ccaaName) {
    // Unknown slug → homepage
    redirect("/");
  }

  redirect(`/?ccaa=${encodeURIComponent(ccaaName)}`);
}
