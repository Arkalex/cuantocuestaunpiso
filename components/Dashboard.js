"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MetricCard from "./MetricCard";
import PriceChart from "./PriceChart";
import RegionTable from "./RegionTable";
import LocationSelector from "./LocationSelector";
import {
  calculateMetrics,
  SURFACE_SQM,
  AFFORDABILITY_OK_THRESHOLD,
  AFFORDABILITY_WARNING_THRESHOLD,
} from "@/lib/calculateMetrics";

const CCAA_LIST = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla-La Mancha",
  "Castilla y León",
  "Cataluña",
  "C. Valenciana",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "Madrid",
  "Murcia",
  "Navarra",
  "País Vasco",
  "Ceuta",
  "Melilla",
];

const FALLBACK_PRICES = {
  Andalucía: 1540,
  Aragón: 1680,
  Asturias: 1420,
  Baleares: 4100,
  Canarias: 2100,
  Cantabria: 1780,
  "Castilla-La Mancha": 980,
  "Castilla y León": 1150,
  Cataluña: 2980,
  "C. Valenciana": 1820,
  Extremadura: 890,
  Galicia: 1320,
  "La Rioja": 1240,
  Madrid: 3210,
  Murcia: 1180,
  Navarra: 1950,
  "País Vasco": 2760,
  Ceuta: 1100,
  Melilla: 1050,
};

const MIN_SALARY = 12000;
const MAX_SALARY = 150000;
const SALARY_STEP = 500;

// ---------------------------------------------------------------------------
// Skeleton de carga — se muestra mientras los datos no están disponibles
// ---------------------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse">
      {/* Hero skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
      {/* Controls skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-9 bg-gray-100 rounded-lg" />
          <div className="h-9 bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-9 bg-gray-100 rounded-lg" />
          <div className="h-3 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      </div>
      {/* Main result skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex justify-between mb-6">
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-12 bg-gray-200 rounded w-40" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-12 bg-gray-200 rounded w-24" />
          </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full" />
      </div>
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-28" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
          </div>
        ))}
      </div>
      {/* Chart + table skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32" />
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="h-6 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard principal
// ---------------------------------------------------------------------------
function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCcaa = (() => {
    const p = searchParams.get("ccaa");
    return p && CCAA_LIST.includes(p) ? p : "Madrid";
  })();
  const initialSalary = (() => {
    const p = Number(searchParams.get("salary"));
    return p >= MIN_SALARY && p <= MAX_SALARY ? p : 28000;
  })();
  const initialType = (() => {
    const p = searchParams.get("type");
    return p === "new" || p === "resale" ? p : "resale";
  })();

  const [ccaa, setCcaa] = useState(initialCcaa);
  const [provincia, setProvincia] = useState(searchParams.get("provincia") ?? "");
  const [municipio, setMunicipio] = useState(searchParams.get("municipio") ?? "");
  const [salary, setSalary] = useState(initialSalary);
  const [salaryInput, setSalaryInput] = useState(String(initialSalary));
  const [type, setType] = useState(initialType);

  // Fade key: changes when ccaa/provincia/municipio change to trigger CSS transition
  const [fadeKey, setFadeKey] = useState(0);

  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [errorChart, setErrorChart] = useState(false);

  const [provinciasData, setProvinciasData] = useState({});
  const [municipiosData, setMunicipiosData] = useState({});
  const [salariosData, setSalariosData] = useState({});
  const [dataQuarter, setDataQuarter] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorLocation, setErrorLocation] = useState(false);

  // Copied-to-clipboard state for share button
  const [copied, setCopied] = useState(false);

  // Sync URL params on state change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("ccaa", ccaa);
    if (provincia) params.set("provincia", provincia);
    if (municipio) params.set("municipio", municipio);
    params.set("salary", String(salary));
    params.set("type", type);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [ccaa, provincia, municipio, salary, type, router]);

  // Fetch data once on mount
  useEffect(() => {
    fetch("/api/ine")
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((json) => { if (json.chartData) setChartData(json.chartData); })
      .catch(() => setErrorChart(true))
      .finally(() => setLoadingChart(false));

    fetch("/api/ministerio")
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((json) => {
        if (json.provincias) setProvinciasData(json.provincias);
        if (json.municipios) setMunicipiosData(json.municipios);
        if (json.salarios) setSalariosData(json.salarios);
        if (json.dataQuarter) setDataQuarter(json.dataQuarter);
      })
      .catch(() => setErrorLocation(true))
      .finally(() => setLoadingLocation(false));
  }, []);

  // Dynamic CCAA prices from Ministerio data
  const ccaaPriceMap = useMemo(() => {
    if (Object.keys(provinciasData).length === 0) return {};
    const acc = {};
    Object.values(provinciasData).forEach(({ pricePerSqm, ccaa: pCcaa }) => {
      if (!acc[pCcaa]) acc[pCcaa] = { sum: 0, count: 0 };
      acc[pCcaa].sum += pricePerSqm;
      acc[pCcaa].count++;
    });
    return Object.fromEntries(
      Object.entries(acc).map(([k, v]) => [k, Math.round(v.sum / v.count)])
    );
  }, [provinciasData]);

  // Regions object for RegionTable
  const regions = useMemo(() => {
    return Object.fromEntries(
      CCAA_LIST.map((name) => [
        name,
        {
          pricePerSqm: ccaaPriceMap[name] ?? FALLBACK_PRICES[name] ?? 1500,
          avgSalary: salariosData[name] ?? 25000,
        },
      ])
    );
  }, [ccaaPriceMap, salariosData]);

  // Active price (municipio > provincia > ccaa)
  const activePricePerSqm = (() => {
    if (municipio && municipiosData[municipio]) return municipiosData[municipio].pricePerSqm;
    if (provincia && provinciasData[provincia]) return provinciasData[provincia].pricePerSqm;
    return ccaaPriceMap[ccaa] ?? FALLBACK_PRICES[ccaa] ?? 1500;
  })();

  const locationLabel = municipio || provincia || ccaa;
  const metrics = calculateMetrics(activePricePerSqm, salary, type);

  // Bar color for affordability bar
  const barColor =
    metrics.salaryPct > AFFORDABILITY_WARNING_THRESHOLD
      ? "#f87171"
      : metrics.salaryPct > AFFORDABILITY_OK_THRESHOLD
        ? "#fbbf24"
        : "#34d399";

  // Salary medio de la CCAA activa (for slider mark)
  const avgSalaryForCcaa = salariosData[ccaa] ?? 28000;
  const avgSalaryPct = Math.round(
    ((avgSalaryForCcaa - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100
  );

  // Stable callbacks for LocationSelector
  const handleCcaaChange = useCallback((val) => {
    setCcaa(val);
    setProvincia("");
    setMunicipio("");
    setFadeKey((k) => k + 1);
  }, []);
  const handleProvinciaChange = useCallback((val) => {
    setProvincia(val);
    setMunicipio("");
    setFadeKey((k) => k + 1);
  }, []);
  const handleMunicipioChange = useCallback((val) => {
    setMunicipio(val);
    setFadeKey((k) => k + 1);
  }, []);

  // Salary slider + manual input
  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setSalary(val);
    setSalaryInput(String(val));
  };
  const handleInputChange = (e) => {
    setSalaryInput(e.target.value);
    const val = Number(e.target.value.replace(/\./g, "").replace(",", "."));
    if (!isNaN(val) && val >= MIN_SALARY && val <= MAX_SALARY) setSalary(val);
  };
  const handleInputBlur = () => {
    const val = Number(salaryInput.replace(/\./g, "").replace(",", "."));
    if (isNaN(val) || val < MIN_SALARY) {
      setSalary(MIN_SALARY); setSalaryInput(String(MIN_SALARY));
    } else if (val > MAX_SALARY) {
      setSalary(MAX_SALARY); setSalaryInput(String(MAX_SALARY));
    } else {
      setSalary(val); setSalaryInput(String(val));
    }
  };

  // Share button
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Hero headline — dynamic verdict
  const heroHeadline = (() => {
    const years = Number(metrics.yearsOfSalary);
    if (metrics.status === "ok")
      return `En ${locationLabel} es accesible: ${years} años de salario`;
    if (metrics.status === "warning")
      return `En ${locationLabel} es difícil: ${years} años de salario`;
    return `En ${locationLabel} es inaccesible: ${years} años de salario`;
  })();

  const heroColor =
    metrics.status === "ok"
      ? "text-green-600"
      : metrics.status === "warning"
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-medium text-gray-900 mb-1">
            ¿Puedes permitirte vivir aquí?
          </h2>
          <p
            key={fadeKey}
            className={`text-lg font-medium transition-opacity duration-300 ${heroColor}`}
            style={{ animation: "fadeIn 0.3s ease" }}
          >
            {heroHeadline}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Calculadora para un piso de {SURFACE_SQM} m² con datos oficiales.
          </p>
        </div>
        {/* Share button */}
        <button
          onClick={handleShare}
          className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          title="Copiar enlace con esta configuración"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="text-green-500">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-600">¡Copiado!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Compartir
            </>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <LocationSelector
            ccaa={ccaa}
            provincia={provincia}
            municipio={municipio}
            onCcaaChange={handleCcaaChange}
            onProvinciaChange={handleProvinciaChange}
            onMunicipioChange={handleMunicipioChange}
            ccaaList={CCAA_LIST}
            provincias={provinciasData}
            municipios={municipiosData}
          />
          {loadingLocation && !errorLocation && (
            <p className="text-xs text-gray-400 mt-2">Cargando provincias...</p>
          )}
          {errorLocation && (
            <p className="text-xs text-red-500 mt-2">
              No se pudieron cargar los datos de provincias y municipios.
            </p>
          )}
        </div>

        {/* Salary: slider + manual input */}
        <div className="flex flex-col justify-center gap-2">
          <label className="text-xs text-gray-400">Salario bruto anual</label>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              min={MIN_SALARY}
              max={MAX_SALARY}
              step={SALARY_STEP}
              value={salaryInput}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full text-2xl font-medium text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-400 focus:outline-none pb-0.5 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-2xl font-medium text-gray-900">€</span>
          </div>
          {/* Slider with avg salary marker */}
          <div className="relative">
            <input
              type="range"
              min={MIN_SALARY}
              max={MAX_SALARY}
              step={SALARY_STEP}
              value={salary}
              onChange={handleSliderChange}
              className="w-full"
            />
            {/* Avg salary tick */}
            <div
              className="absolute top-0 flex flex-col items-center pointer-events-none"
              style={{ left: `${avgSalaryPct}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-px h-3 bg-blue-300 mt-1" />
            </div>
          </div>
          <div className="relative flex justify-between text-xs text-gray-300">
            <span>{MIN_SALARY.toLocaleString("es-ES")} €</span>
            {/* Avg salary label */}
            <span
              className="absolute text-blue-300 whitespace-nowrap"
              style={{ left: `${avgSalaryPct}%`, transform: "translateX(-50%)" }}
            >
              media {ccaa}
            </span>
            <span>{MAX_SALARY.toLocaleString("es-ES")} €</span>
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

      {/* Main result */}
      <div
        key={fadeKey}
        className="bg-white border border-gray-100 rounded-2xl p-6 mb-6"
        style={{ animation: "fadeIn 0.25s ease" }}
      >
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
              {dataQuarter && (
                <span className="ml-2 bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded text-xs">
                  {dataQuarter}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">% salario en hipoteca</p>
            <p
              className={`text-5xl font-medium transition-colors duration-300 ${
                metrics.salaryPct > AFFORDABILITY_WARNING_THRESHOLD
                  ? "text-red-500"
                  : metrics.salaryPct > AFFORDABILITY_OK_THRESHOLD
                    ? "text-amber-500"
                    : "text-green-500"
              }`}
            >
              {metrics.salaryPct}%
            </p>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                metrics.salaryPct > AFFORDABILITY_WARNING_THRESHOLD
                  ? "bg-red-50 text-red-600"
                  : metrics.salaryPct > AFFORDABILITY_OK_THRESHOLD
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
              }`}
            >
              {metrics.label}
            </span>
          </div>
        </div>

        {/* Affordability bar — h-4 with rounded ends and shadow */}
        <div className="mt-2">
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(metrics.salaryPct, 100)}%`,
                background: barColor,
              }}
            />
            {/* 30% recommended line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/60"
              style={{ left: "30%" }}
            />
          </div>
          <div className="relative flex justify-between text-xs text-gray-300 mt-1.5">
            <span>0%</span>
            <span
              className="absolute text-gray-300"
              style={{ left: "30%", transform: "translateX(-50%)" }}
            >
              30% recomendado
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Secondary metrics — with status color */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <MetricCard
          title="Cuota mensual"
          value={`${metrics.monthlyPayment.toLocaleString("es-ES")} €`}
          subtitle="30 años · 3,5% TAE"
          status={metrics.status}
        />
        <MetricCard
          title="Esfuerzo salarial"
          value={`${metrics.yearsOfSalary} años`}
          subtitle="para comprar 70 m²"
          status={metrics.status}
        />
        <MetricCard
          title="Precio total del piso"
          value={`${(metrics.pricePerSqm * SURFACE_SQM).toLocaleString("es-ES")} €`}
          subtitle="entrada mínima 20%"
        />
      </div>

      {/* Chart + table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          {errorChart ? (
            <p className="text-xs text-red-500 text-center py-8">
              No se pudieron cargar los datos del INE. Inténtalo de nuevo más tarde.
            </p>
          ) : (
            <PriceChart
              data={loadingChart ? [] : chartData}
              selectedRegion={ccaa}
            />
          )}
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
              regions={regions}
              selectedRegion={ccaa}
              onSelect={(r) => {
                handleCcaaChange(r);
              }}
              type={type}
            />
          </div>
        </div>
      </div>

      {/* Fade-in keyframe */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  );
}
