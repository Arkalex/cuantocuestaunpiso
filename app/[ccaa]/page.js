import Link from "next/link";
import { calculateMetrics, SURFACE_SQM } from "@/lib/calculateMetrics";

// ---------------------------------------------------------------------------
// Datos estáticos pre-calculados desde provincias.json (media por CCAA)
// y salarios.json (INE EAES 2023). Se actualizan con cada deploy.
// ---------------------------------------------------------------------------
const CCAA_DATA = {
  andalucia: {
    name: "Andalucía",
    pricePerSqm: 1661,
    avgSalary: 25052,
    provinces: ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"],
  },
  aragon: {
    name: "Aragón",
    pricePerSqm: 1395,
    avgSalary: 26822,
    provinces: ["Huesca", "Teruel", "Zaragoza"],
  },
  asturias: {
    name: "Asturias",
    pricePerSqm: 1668,
    avgSalary: 27917,
    provinces: ["Asturias"],
  },
  baleares: {
    name: "Baleares",
    pricePerSqm: 3810,
    avgSalary: 27537,
    provinces: ["Baleares"],
  },
  canarias: {
    name: "Canarias",
    pricePerSqm: 2146,
    avgSalary: 24034,
    provinces: ["Palmas (Las)", "Santa Cruz de Tenerife"],
  },
  cantabria: {
    name: "Cantabria",
    pricePerSqm: 1985,
    avgSalary: 26569,
    provinces: ["Cantabria"],
  },
  "castilla-la-mancha": {
    name: "Castilla-La Mancha",
    pricePerSqm: 1116,
    avgSalary: 24886,
    provinces: ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"],
  },
  "castilla-y-leon": {
    name: "Castilla y León",
    pricePerSqm: 1193,
    avgSalary: 25227,
    provinces: ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"],
  },
  cataluna: {
    name: "Cataluña",
    pricePerSqm: 2027,
    avgSalary: 29979,
    provinces: ["Barcelona", "Girona", "Lleida", "Tarragona"],
  },
  "comunitat-valenciana": {
    name: "C. Valenciana",
    pricePerSqm: 1701,
    avgSalary: 25632,
    provinces: ["Alicante/Alacant", "Castellón/Castelló", "Valencia/València"],
  },
  extremadura: {
    name: "Extremadura",
    pricePerSqm: 930,
    avgSalary: 23684,
    provinces: ["Badajoz", "Cáceres"],
  },
  galicia: {
    name: "Galicia",
    pricePerSqm: 1375,
    avgSalary: 25279,
    provinces: ["Coruña (A)", "Lugo", "Ourense", "Pontevedra"],
  },
  "la-rioja": {
    name: "La Rioja",
    pricePerSqm: 1367,
    avgSalary: 26319,
    provinces: ["La Rioja"],
  },
  madrid: {
    name: "Madrid",
    pricePerSqm: 3902,
    avgSalary: 32220,
    provinces: ["Madrid"],
  },
  murcia: {
    name: "Murcia",
    pricePerSqm: 1264,
    avgSalary: 25330,
    provinces: ["Murcia"],
  },
  navarra: {
    name: "Navarra",
    pricePerSqm: 1852,
    avgSalary: 31200,
    provinces: ["Navarra"],
  },
  "pais-vasco": {
    name: "País Vasco",
    pricePerSqm: 2888,
    avgSalary: 33505,
    provinces: ["Araba/Alava", "Gipuzkoa", "Bizkaia"],
  },
  ceuta: {
    name: "Ceuta",
    pricePerSqm: 2148,
    avgSalary: 28050,
    provinces: ["Ceuta"],
  },
  melilla: {
    name: "Melilla",
    pricePerSqm: 2082,
    avgSalary: 28050,
    provinces: ["Melilla"],
  },
};

export function generateStaticParams() {
  return Object.keys(CCAA_DATA).map((slug) => ({ ccaa: slug }));
}

export function generateMetadata({ params }) {
  const data = CCAA_DATA[params.ccaa];
  if (!data) return {};
  const metrics = calculateMetrics(data.pricePerSqm, data.avgSalary, "resale");
  return {
    title: `¿Puedo comprarme un piso en ${data.name}? · cuantocuestaunpiso.es`,
    description: `El precio medio de la vivienda en ${data.name} es ${data.pricePerSqm.toLocaleString("es-ES")} €/m². Con el salario medio (${data.avgSalary.toLocaleString("es-ES")} €), necesitas ${metrics.yearsOfSalary} años de salario para comprar un piso de 70 m².`,
    alternates: {
      canonical: `https://www.cuantocuestaunpiso.es/${params.ccaa}`,
    },
    openGraph: {
      title: `Vivienda en ${data.name}: ${data.pricePerSqm.toLocaleString("es-ES")} €/m²`,
      description: `¿Puedes permitirte vivir en ${data.name}? Calculadora con datos oficiales del INE y Ministerio de Vivienda.`,
      url: `https://www.cuantocuestaunpiso.es/${params.ccaa}`,
    },
  };
}

export default function CcaaPage({ params }) {
  const data = CCAA_DATA[params.ccaa];
  if (!data) return null;

  const metrics = calculateMetrics(data.pricePerSqm, data.avgSalary, "resale");
  const statusColor =
    metrics.status === "ok"
      ? { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
      : metrics.status === "warning"
        ? { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
        : { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };

  const totalPrice = data.pricePerSqm * SURFACE_SQM;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Inicio
        </Link>
        <span className="mx-2">·</span>
        <span className="text-gray-600">{data.name}</span>
      </nav>

      {/* Title */}
      <h1 className="text-3xl font-medium text-gray-900 mb-2">
        ¿Puedo comprarme un piso en{" "}
        <span className="text-blue-600">{data.name}</span>?
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Con el salario medio de {data.name} ({data.avgSalary.toLocaleString("es-ES")} € brutos anuales
        según el INE) y el precio actual de la vivienda.
      </p>

      {/* Verdict card */}
      <div className={`rounded-2xl border p-6 mb-8 ${statusColor.bg} ${statusColor.border}`}>
        <p className={`text-xs font-medium mb-1 ${statusColor.text}`}>
          Veredicto con salario medio de {data.name}
        </p>
        <p className={`text-4xl font-medium mb-2 ${statusColor.text}`}>
          {metrics.label}
        </p>
        <p className="text-sm text-gray-600">
          Una hipoteca de 70 m² en {data.name} representa el{" "}
          <strong>{metrics.salaryPct}% del salario neto</strong>. El umbral recomendado es el 30%.
        </p>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Precio medio m²</p>
          <p className="text-3xl font-medium text-gray-900">
            {data.pricePerSqm.toLocaleString("es-ES")} €
          </p>
          <p className="text-xs text-gray-400 mt-1">Fuente: Ministerio de Vivienda · T4 2025</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Precio total 70 m²</p>
          <p className="text-3xl font-medium text-gray-900">
            {totalPrice.toLocaleString("es-ES")} €
          </p>
          <p className="text-xs text-gray-400 mt-1">Entrada mínima: {Math.round(totalPrice * 0.2).toLocaleString("es-ES")} €</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Cuota mensual</p>
          <p className="text-3xl font-medium text-gray-900">
            {metrics.monthlyPayment.toLocaleString("es-ES")} €
          </p>
          <p className="text-xs text-gray-400 mt-1">30 años · 3,5% TAE · 80% financiado</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Años de salario</p>
          <p className={`text-3xl font-medium ${statusColor.text}`}>
            {metrics.yearsOfSalary}
          </p>
          <p className="text-xs text-gray-400 mt-1">para comprar 70 m²</p>
        </div>
      </div>

      {/* Provinces */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Provincias de {data.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.provinces.map((p) => (
            <span
              key={p}
              className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          ¿Tienes un salario distinto al medio? Calcula tu situación exacta.
        </p>
        <Link
          href={`/?ccaa=${encodeURIComponent(data.name)}`}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Calcular con mi salario
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Precio de la vivienda en ${data.name}: ${data.pricePerSqm.toLocaleString("es-ES")} €/m²`,
            description: `Análisis de accesibilidad a la vivienda en ${data.name} con datos del INE y Ministerio de Vivienda.`,
            url: `https://www.cuantocuestaunpiso.es/${params.ccaa}`,
            publisher: {
              "@type": "Organization",
              name: "cuantocuestaunpiso.es",
              url: "https://www.cuantocuestaunpiso.es",
            },
          }),
        }}
      />
    </div>
  );
}
