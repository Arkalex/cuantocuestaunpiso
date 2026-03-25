"use client";

import { useState } from "react";
import MetricCard from "./MetricCard";
import PriceChart from "./PriceChart";
import RegionTable from "./RegionTable";

const REGIONS = {
  Andalucía: { pricePerSqm: 1540, avgSalary: 22000 },
  Aragón: { pricePerSqm: 1680, avgSalary: 25000 },
  Asturias: { pricePerSqm: 1420, avgSalary: 24000 },
  Baleares: { pricePerSqm: 4100, avgSalary: 26000 },
  Canarias: { pricePerSqm: 2100, avgSalary: 23000 },
  Cantabria: { pricePerSqm: 1780, avgSalary: 24500 },
  "Castilla-La Mancha": { pricePerSqm: 980, avgSalary: 21000 },
  "Castilla y León": { pricePerSqm: 1150, avgSalary: 22500 },
  Cataluña: { pricePerSqm: 2980, avgSalary: 29500 },
  "C. Valenciana": { pricePerSqm: 1820, avgSalary: 24000 },
  Extremadura: { pricePerSqm: 890, avgSalary: 19500 },
  Galicia: { pricePerSqm: 1320, avgSalary: 23000 },
  "La Rioja": { pricePerSqm: 1240, avgSalary: 24000 },
  Madrid: { pricePerSqm: 3210, avgSalary: 32000 },
  Murcia: { pricePerSqm: 1180, avgSalary: 21500 },
  Navarra: { pricePerSqm: 1950, avgSalary: 28000 },
  "País Vasco": { pricePerSqm: 2760, avgSalary: 34000 },
  Ceuta: { pricePerSqm: 1100, avgSalary: 22000 },
  Melilla: { pricePerSqm: 1050, avgSalary: 21500 },
};

const CHART_DATA = [
  {
    quarter: "T1 22",
    Madrid: 100,
    Cataluña: 100,
    "País Vasco": 100,
    Baleares: 100,
    Andalucía: 100,
    Aragón: 100,
    Asturias: 100,
    Canarias: 100,
    Cantabria: 100,
    "Castilla-La Mancha": 100,
    "Castilla y León": 100,
    "C. Valenciana": 100,
    Extremadura: 100,
    Galicia: 100,
    "La Rioja": 100,
    Murcia: 100,
    Navarra: 100,
    Ceuta: 100,
    Melilla: 100,
    National: 100,
  },
  {
    quarter: "T2 22",
    Madrid: 104,
    Cataluña: 103,
    "País Vasco": 103,
    Baleares: 105,
    Andalucía: 101,
    Aragón: 101,
    Asturias: 102,
    Canarias: 103,
    Cantabria: 102,
    "Castilla-La Mancha": 101,
    "Castilla y León": 101,
    "C. Valenciana": 102,
    Extremadura: 100,
    Galicia: 101,
    "La Rioja": 101,
    Murcia: 102,
    Navarra: 102,
    Ceuta: 101,
    Melilla: 101,
    National: 103,
  },
  {
    quarter: "T3 22",
    Madrid: 108,
    Cataluña: 107,
    "País Vasco": 106,
    Baleares: 110,
    Andalucía: 104,
    Aragón: 104,
    Asturias: 104,
    Canarias: 106,
    Cantabria: 104,
    "Castilla-La Mancha": 103,
    "Castilla y León": 103,
    "C. Valenciana": 105,
    Extremadura: 101,
    Galicia: 103,
    "La Rioja": 103,
    Murcia: 104,
    Navarra: 105,
    Ceuta: 103,
    Melilla: 102,
    National: 107,
  },
  {
    quarter: "T4 22",
    Madrid: 115,
    Cataluña: 113,
    "País Vasco": 111,
    Baleares: 118,
    Andalucía: 108,
    Aragón: 107,
    Asturias: 107,
    Canarias: 110,
    Cantabria: 107,
    "Castilla-La Mancha": 106,
    "Castilla y León": 106,
    "C. Valenciana": 109,
    Extremadura: 103,
    Galicia: 106,
    "La Rioja": 106,
    Murcia: 107,
    Navarra: 109,
    Ceuta: 105,
    Melilla: 104,
    National: 113,
  },
  {
    quarter: "T1 23",
    Madrid: 121,
    Cataluña: 119,
    "País Vasco": 117,
    Baleares: 126,
    Andalucía: 113,
    Aragón: 111,
    Asturias: 111,
    Canarias: 116,
    Cantabria: 111,
    "Castilla-La Mancha": 110,
    "Castilla y León": 110,
    "C. Valenciana": 114,
    Extremadura: 105,
    Galicia: 110,
    "La Rioja": 110,
    Murcia: 111,
    Navarra: 114,
    Ceuta: 108,
    Melilla: 107,
    National: 119,
  },
  {
    quarter: "T2 23",
    Madrid: 130,
    Cataluña: 127,
    "País Vasco": 124,
    Baleares: 136,
    Andalucía: 119,
    Aragón: 117,
    Asturias: 116,
    Canarias: 123,
    Cantabria: 117,
    "Castilla-La Mancha": 115,
    "Castilla y León": 115,
    "C. Valenciana": 121,
    Extremadura: 108,
    Galicia: 115,
    "La Rioja": 116,
    Murcia: 117,
    Navarra: 121,
    Ceuta: 112,
    Melilla: 111,
    National: 127,
  },
  {
    quarter: "T3 23",
    Madrid: 138,
    Cataluña: 135,
    "País Vasco": 131,
    Baleares: 145,
    Andalucía: 126,
    Aragón: 123,
    Asturias: 122,
    Canarias: 130,
    Cantabria: 123,
    "Castilla-La Mancha": 121,
    "Castilla y León": 121,
    "C. Valenciana": 128,
    Extremadura: 111,
    Galicia: 121,
    "La Rioja": 122,
    Murcia: 123,
    Navarra: 128,
    Ceuta: 116,
    Melilla: 115,
    National: 135,
  },
  {
    quarter: "T4 23",
    Madrid: 148,
    Cataluña: 144,
    "País Vasco": 139,
    Baleares: 156,
    Andalucía: 134,
    Aragón: 130,
    Asturias: 129,
    Canarias: 139,
    Cantabria: 130,
    "Castilla-La Mancha": 128,
    "Castilla y León": 128,
    "C. Valenciana": 136,
    Extremadura: 115,
    Galicia: 128,
    "La Rioja": 129,
    Murcia: 130,
    Navarra: 136,
    Ceuta: 121,
    Melilla: 120,
    National: 144,
  },
  {
    quarter: "T1 24",
    Madrid: 160,
    Cataluña: 155,
    "País Vasco": 148,
    Baleares: 168,
    Andalucía: 143,
    Aragón: 139,
    Asturias: 137,
    Canarias: 149,
    Cantabria: 139,
    "Castilla-La Mancha": 136,
    "Castilla y León": 136,
    "C. Valenciana": 146,
    Extremadura: 120,
    Galicia: 136,
    "La Rioja": 138,
    Murcia: 139,
    Navarra: 146,
    Ceuta: 127,
    Melilla: 126,
    National: 155,
  },
  {
    quarter: "T2 24",
    Madrid: 172,
    Cataluña: 167,
    "País Vasco": 158,
    Baleares: 181,
    Andalucía: 152,
    Aragón: 148,
    Asturias: 146,
    Canarias: 159,
    Cantabria: 148,
    "Castilla-La Mancha": 145,
    "Castilla y León": 145,
    "C. Valenciana": 156,
    Extremadura: 126,
    Galicia: 145,
    "La Rioja": 147,
    Murcia: 148,
    Navarra: 156,
    Ceuta: 134,
    Melilla: 133,
    National: 167,
  },
  {
    quarter: "T3 24",
    Madrid: 185,
    Cataluña: 179,
    "País Vasco": 169,
    Baleares: 196,
    Andalucía: 162,
    Aragón: 158,
    Asturias: 155,
    Canarias: 170,
    Cantabria: 158,
    "Castilla-La Mancha": 154,
    "Castilla y León": 154,
    "C. Valenciana": 167,
    Extremadura: 132,
    Galicia: 154,
    "La Rioja": 157,
    Murcia: 158,
    Navarra: 167,
    Ceuta: 141,
    Melilla: 140,
    National: 179,
  },
  {
    quarter: "T4 24",
    Madrid: 198,
    Cataluña: 191,
    "País Vasco": 180,
    Baleares: 212,
    Andalucía: 172,
    Aragón: 168,
    Asturias: 164,
    Canarias: 181,
    Cantabria: 168,
    "Castilla-La Mancha": 163,
    "Castilla y León": 163,
    "C. Valenciana": 178,
    Extremadura: 139,
    Galicia: 163,
    "La Rioja": 166,
    Murcia: 168,
    Navarra: 178,
    Ceuta: 149,
    Melilla: 148,
    National: 192,
  },
];

function calculateMetrics(region, salary, type) {
  const multiplier = type === "new" ? 1.18 : 1;
  const pricePerSqm = Math.round(REGIONS[region].pricePerSqm * multiplier);
  const totalPrice = pricePerSqm * 70;
  const yearsOfSalary = (totalPrice / salary).toFixed(1);
  const principal = totalPrice * 0.8;
  const monthlyRate = 0.035 / 12;
  const numPayments = 360;
  const monthlyPayment = Math.round(
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1),
  );
  const netSalary = salary * 0.72;
  const salaryPct = Math.round(((monthlyPayment * 12) / netSalary) * 100);

  let status = "danger";
  let label = "Inaccesible";
  if (salaryPct <= 30) {
    status = "ok";
    label = "Accesible";
  } else if (salaryPct <= 50) {
    status = "warning";
    label = "Difícil acceso";
  }

  return {
    pricePerSqm,
    yearsOfSalary,
    monthlyPayment,
    salaryPct,
    status,
    label,
  };
}

export default function Dashboard() {
  const [region, setRegion] = useState("Madrid");
  const [salary, setSalary] = useState(28000);
  const [type, setType] = useState("resale");
  const metrics = calculateMetrics(region, salary, type);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-500 mb-6">
        Datos del INE · Índice de Precios de Vivienda y Encuesta de Estructura
        Salarial
      </p>

      {/* Controles */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Comunidad autónoma
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900"
          >
            {Object.keys(REGIONS).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Salario bruto anual:{" "}
            <span className="font-medium text-gray-900">
              {salary.toLocaleString("es-ES")} €
            </span>
          </label>
          <input
            type="range"
            min="15000"
            max="80000"
            step="1000"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Tipo de vivienda
          </label>
          <div className="flex gap-2">
            {["resale", "new"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                  type === t
                    ? "bg-blue-50 border-blue-200 text-blue-800 font-medium"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                {t === "resale" ? "Segunda mano" : "Nueva"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard
          title="Precio medio m²"
          value={`${metrics.pricePerSqm.toLocaleString("es-ES")} €`}
          subtitle="+12,9% anual"
          status="danger"
        />
        <MetricCard
          title="Esfuerzo salarial"
          value={`${metrics.yearsOfSalary} años`}
          subtitle="para comprar 70 m²"
        />
        <MetricCard
          title="Cuota mensual"
          value={`${metrics.monthlyPayment.toLocaleString("es-ES")} €`}
          subtitle="30 años · 3,5% TAE"
        />
        <MetricCard
          title="% salario en hipoteca"
          value={`${metrics.salaryPct}%`}
          subtitle={metrics.label}
          status={metrics.status}
        />
      </div>

      {/* Barra de accesibilidad */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Umbral de accesibilidad</span>
          <span>Recomendado: máx. 30% del salario neto</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.salaryPct > 50
                ? "bg-red-400"
                : metrics.salaryPct > 30
                  ? "bg-amber-400"
                  : "bg-green-400"
            }`}
            style={{ width: `${Math.min(metrics.salaryPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span style={{ marginLeft: "28%" }}>30%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-900">
            Evolución IPV · {region} vs Nacional
          </span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
            Base T1 2022 = 100
          </span>
        </div>
        <PriceChart data={CHART_DATA} selectedRegion={region} />
      </div>

      {/* Tabla comparativa */}
      <RegionTable
        regions={REGIONS}
        selectedRegion={region}
        onSelect={setRegion}
        type={type}
      />
    </div>
  );
}
