"use client";

import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";
import PriceChart from "./PriceChart";
import RegionTable from "./RegionTable";
import LocationSelector from "./LocationSelector";
import CostBreakdown from "./CostBreakdown";
import AffordabilityTimeline from "./AffordabilityTimeline";

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

function calculateMetrics(pricePerSqm, salary, type, surfaceM2 = 70, yearsHypotheca = 30, interestRate = 3.5, downPaymentPct = 20) {
  const multiplier = type === "new" ? 1.18 : 1;
  const finalPricePerSqm = Math.round(pricePerSqm * multiplier);
  const totalPrice = finalPricePerSqm * surfaceM2;
  const yearsOfSalary = (totalPrice / salary).toFixed(1);
  
  const downPayment = totalPrice * (downPaymentPct / 100);
  const principal = totalPrice - downPayment;
  
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = yearsHypotheca * 12;
  
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
    pricePerSqm: finalPricePerSqm,
    yearsOfSalary,
    monthlyPayment,
    salaryPct,
    status,
    label,
    totalPrice,
    downPayment,
    surfaceM2,
    yearsHypotheca,
    interestRate,
    downPaymentPct,
  };
}

export default function Dashboard() {
  const [ccaa, setCcaa] = useState("Madrid");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [salary, setSalary] = useState(28000);
  const [type, setType] = useState("resale");
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [provinciasData, setProvinciasData] = useState({});
  const [municipiosData, setMunicipiosData] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Personalization parameters
  const [surfaceM2, setSurfaceM2] = useState(70);
  const [yearsHypotheca, setYearsHypotheca] = useState(30);
  const [interestRate, setInterestRate] = useState(3.5);
  const [downPaymentPct, setDownPaymentPct] = useState(20);

  useEffect(() => {
    fetch("/api/ine")
      .then((res) => res.json())
      .then((json) => {
        if (json.chartData) setChartData(json.chartData);
      })
      .catch((err) => console.error("Error fetching INE data:", err))
      .finally(() => setLoadingChart(false));

    fetch("/api/ministerio")
      .then((res) => res.json())
      .then((json) => {
        if (json.provincias) setProvinciasData(json.provincias);
        if (json.municipios) setMunicipiosData(json.municipios);
      })
      .catch((err) => console.error("Error fetching Ministerio data:", err));
  }, []);

  const activePricePerSqm = (() => {
    if (municipio && municipiosData[municipio])
      return municipiosData[municipio].pricePerSqm;
    if (provincia && provinciasData[provincia])
      return provinciasData[provincia].pricePerSqm;
    return REGIONS[ccaa]?.pricePerSqm ?? 1500;
  })();

  const locationLabel = municipio || provincia || ccaa;
  
  // Métricas únicas con valores personalizados
  const metrics = calculateMetrics(activePricePerSqm, salary, type, surfaceM2, yearsHypotheca, interestRate, downPaymentPct);
  
  const barColor =
    metrics.salaryPct > 50
      ? "#f87171"
      : metrics.salaryPct > 30
        ? "#fbbf24"
        : "#34d399";

  const viabilityScore = Math.max(0, Math.min(100, 100 - metrics.salaryPct));
  const viabilityStatus = viabilityScore >= 70 ? "ok" : viabilityScore >= 40 ? "warning" : "danger";
  const effortYears = Number(metrics.yearsOfSalary).toFixed(1);

  const handleResetAdvancedFilters = () => {
    setSurfaceM2(70);
    setYearsHypotheca(30);
    setInterestRate(3.5);
    setDownPaymentPct(20);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-gray-900 mb-2">
          ¿Puedes permitirte vivir aquí?
        </h2>
        <p className="text-gray-400 text-sm">
          Selecciona tu comunidad, provincia o municipio e introduce tu salario.
          Te decimos si puedes comprar un piso de 70 m².
        </p>
      </div>

      {/* Controles */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <LocationSelector
          ccaa={ccaa}
          provincia={provincia}
          municipio={municipio}
          onCcaaChange={setCcaa}
          onProvinciaChange={setProvincia}
          onMunicipioChange={setMunicipio}
          ccaaList={Object.keys(REGIONS)}
          provincias={provinciasData}
          municipios={municipiosData}
        />
        <div className="flex flex-col justify-center gap-2">
          <label className="text-xs text-gray-400">Salario bruto anual</label>
          <p className="text-2xl font-medium text-gray-900">
            {salary.toLocaleString("es-ES")} €
          </p>
          <input
            type="range"
            min="15000"
            max="80000"
            step="1000"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-300">
            <span>15.000 €</span>
            <span>80.000 €</span>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <label className="text-xs text-gray-400">Tipo de vivienda</label>
          <div className="flex gap-2">
            {["resale", "new"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 text-sm py-2.5 rounded-xl border transition-colors ${
                  type === t
                    ? "bg-gray-900 border-gray-900 text-white font-medium"
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {t === "resale" ? "Segunda mano" : "Nueva"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Finanación - Controles integrados */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Personaliza tu búsqueda</h3>
          <button
            type="button"
            onClick={handleResetAdvancedFilters}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white rounded-lg px-3 py-1.5 transition-colors"
          >
            Resetear filtros
          </button>
        </div>
        
        {/* Grid de 4 sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Superficie */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-600">Superficie m²</label>
              <span className="text-2xl font-medium text-gray-900">{surfaceM2}</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="5"
              value={surfaceM2}
              onChange={(e) => setSurfaceM2(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>30 m²</span>
              <span>150 m²</span>
            </div>
          </div>

          {/* Años hipoteca */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-600">Plazo hipoteca</label>
              <span className="text-2xl font-medium text-gray-900">{yearsHypotheca} años</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={yearsHypotheca}
              onChange={(e) => setYearsHypotheca(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5 años</span>
              <span>40 años</span>
            </div>
          </div>

          {/* Tasa de interés */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-600">Tasa de interés (TAE)</label>
              <span className="text-2xl font-medium text-gray-900">{interestRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="6"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1.5%</span>
              <span>6%</span>
            </div>
          </div>

          {/* Entrada */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-gray-600">% Entrada</label>
              <span className="text-2xl font-medium text-gray-900">{downPaymentPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado principal */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              {locationLabel} · precio medio m²
            </p>
            <p className="text-5xl font-medium text-gray-900">
              {metrics.pricePerSqm.toLocaleString("es-ES")} €
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Fuente: Ministerio de Vivienda
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">% salario en hipoteca</p>
            <p
              className={`text-5xl font-medium ${
                metrics.salaryPct > 50
                  ? "text-red-500"
                  : metrics.salaryPct > 30
                    ? "text-amber-500"
                    : "text-green-500"
              }`}
            >
              {metrics.salaryPct}%
            </p>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                metrics.salaryPct > 50
                  ? "bg-red-50 text-red-600"
                  : metrics.salaryPct > 30
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
              }`}
            >
              {metrics.label}
            </span>
          </div>
        </div>

        {/* Barra */}
        <div className="mt-4">
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(metrics.salaryPct, 100)}%`,
                background: barColor,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-300"
              style={{ left: "30%" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>0%</span>
            <span style={{ marginLeft: "28%" }}>30% recomendado</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Métricas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          title="Cuota mensual"
          value={`${metrics.monthlyPayment.toLocaleString("es-ES")} €`}
          subtitle={`${yearsHypotheca} años · ${interestRate.toFixed(2)}%`}
        />
        <MetricCard
          title="Esfuerzo salarial"
          value={`${effortYears} años`}
          subtitle={`para comprar ${surfaceM2} m²`}
        />        
        <MetricCard
          title="Impacto salarial"
          value={`${metrics.salaryPct}%`}
          subtitle={metrics.salaryPct > 50 ? "⚠️ Muy alto" : metrics.salaryPct > 30 ? "⚠️ Alto" : "✓ Óptimo"}
        />
        <MetricCard
          title="Precio total"
          value={`${Math.round(metrics.totalPrice).toLocaleString("es-ES")} €`}
          subtitle={`${surfaceM2} m²`}
        />
        <MetricCard
          title="Entrada"
          value={`${Math.round(metrics.downPayment).toLocaleString("es-ES")} €`}
          subtitle={`${downPaymentPct}% del precio`}
        />
        <MetricCard
          title="Financiación"
          value={`${Math.round(metrics.totalPrice - metrics.downPayment).toLocaleString("es-ES")} €`}
          subtitle="A financiar"
        />
        <MetricCard
          title="Intereses totales"
          value={`${Math.round(metrics.monthlyPayment * yearsHypotheca * 12 - (metrics.totalPrice - metrics.downPayment)).toLocaleString("es-ES")} €`}
          subtitle={`${yearsHypotheca} años`}
        />
        <MetricCard
          title="Puntuación"
          value={`${viabilityScore}`}
          subtitle={viabilityScore >= 70 ? "Viabilidad alta" : viabilityScore >= 40 ? "Atención" : "Revisar escenario"}
          status={viabilityStatus}
          highlight
        />
      </div>

      {/* Accordion: Detalles expandibles */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
        <button
          onClick={() => setExpandedSection(expandedSection === "details" ? null : "details")}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-medium text-gray-900">Detalles y timeline</h3>
          <span
            className={`text-gray-400 transition-transform ${
              expandedSection === "details" ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
        
        {expandedSection === "details" && (
          <div className="border-t border-gray-100 px-6 py-6 space-y-6">
            <CostBreakdown
              pricePerSqm={metrics.pricePerSqm}
              totalPrice={metrics.totalPrice}
              monthlyPayment={metrics.monthlyPayment}
              downPaymentPct={downPaymentPct}
              yearsHypotheca={yearsHypotheca}
              interestRate={interestRate}
              salaryPct={metrics.salaryPct}
              status={metrics.status}
              status_label={metrics.label}
            />
            
            <AffordabilityTimeline
              downPaymentNeeded={Math.max(0, Math.round(metrics.downPayment) - 50000)}
              totalInitialNeeded={Math.max(0, Math.round(metrics.downPayment + metrics.totalPrice * 0.145 - 50000))}
              currentSalary={salary}
              monthlyPayment={metrics.monthlyPayment}
            />
          </div>
        )}
      </div>

      {/* Gráfico y tabla en dos columnas en pantallas grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Evolución de precios · {ccaa} vs Nacional
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Subida acumulada desde el primer trimestre de 2022
              </p>
            </div>
            <span className="text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">
              INE · IPV Base 2022
            </span>
          </div>
          <PriceChart
            data={loadingChart ? [] : chartData}
            selectedRegion={ccaa}
          />
        </div>

        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-900">
              Todas las comunidades
            </span>
            <p className="text-xs text-gray-400 mt-0.5">ordenadas por precio</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
            <RegionTable
              regions={REGIONS}
              selectedRegion={ccaa}
              onSelect={(r) => {
                setCcaa(r);
                setProvincia("");
                setMunicipio("");
              }}
              type={type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
