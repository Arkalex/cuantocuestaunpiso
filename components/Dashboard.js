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

// Lista canónica de CCAA — solo se usa para el selector de LocationSelector
// Los precios se calculan dinámicamente desde provinciasData (Ministerio)
// y los salarios vienen del INE via salarios.json
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

// Precio de fallback por CCAA si los datos del Ministerio no están disponibles todavía
// Solo se usa durante la carga inicial o si el fetch falla
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

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Inicializar estado desde URL params ---
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

  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [errorChart, setErrorChart] = useState(false);

  const [provinciasData, setProvinciasData] = useState({});
  const [municipiosData, setMunicipiosData] = useState({});
  const [salariosData, setSalariosData] = useState({});
  const [dataQuarter, setDataQuarter] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorLocation, setErrorLocation] = useState(false);

  // --- Sincronizar URL params cuando cambia el estado ---
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("ccaa", ccaa);
    if (provincia) params.set("provincia", provincia);
    if (municipio) params.set("municipio", municipio);
    params.set("salary", String(salary));
    params.set("type", type);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [ccaa, provincia, municipio, salary, type, router]);

  // --- Fetch de datos (una sola vez al montar) ---
  useEffect(() => {
    fetch("/api/ine")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.chartData) setChartData(json.chartData);
      })
      .catch(() => setErrorChart(true))
      .finally(() => setLoadingChart(false));

    fetch("/api/ministerio")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.provincias) setProvinciasData(json.provincias);
        if (json.municipios) setMunicipiosData(json.municipios);
        if (json.salarios) setSalariosData(json.salarios);
        if (json.dataQuarter) setDataQuarter(json.dataQuarter);
      })
      .catch(() => setErrorLocation(true))
      .finally(() => setLoadingLocation(false));
  }, []);

  // --- Precios de CCAA calculados dinámicamente desde provinciasData ---
  // Promedio de las provincias de cada CCAA. Actualiza automáticamente
  // cuando los datos del Ministerio se cargan o cambian.
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

  // --- Objeto REGIONS combinando precios dinámicos + salarios del INE ---
  // Se pasa a RegionTable para la tabla comparativa
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

  // --- Precio activo (municipio > provincia > ccaa) ---
  const activePricePerSqm = (() => {
    if (municipio && municipiosData[municipio])
      return municipiosData[municipio].pricePerSqm;
    if (provincia && provinciasData[provincia])
      return provinciasData[provincia].pricePerSqm;
    return ccaaPriceMap[ccaa] ?? FALLBACK_PRICES[ccaa] ?? 1500;
  })();

  const locationLabel = municipio || provincia || ccaa;
  const metrics = calculateMetrics(activePricePerSqm, salary, type);
  const barColor =
    metrics.salaryPct > AFFORDABILITY_WARNING_THRESHOLD
      ? "#f87171"
      : metrics.salaryPct > AFFORDABILITY_OK_THRESHOLD
        ? "#fbbf24"
        : "#34d399";

  // --- Handlers estables para LocationSelector ---
  const handleCcaaChange = useCallback((val) => { setCcaa(val); setProvincia(""); setMunicipio(""); }, []);
  const handleProvinciaChange = useCallback((val) => { setProvincia(val); setMunicipio(""); }, []);
  const handleMunicipioChange = useCallback(setMunicipio, []);

  // --- Slider + input manual de salario ---
  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setSalary(val);
    setSalaryInput(String(val));
  };
  const handleInputChange = (e) => {
    setSalaryInput(e.target.value);
    const val = Number(e.target.value.replace(/\./g, "").replace(",", "."));
    if (!isNaN(val) && val >= MIN_SALARY && val <= MAX_SALARY) {
      setSalary(val);
    }
  };
  const handleInputBlur = () => {
    const val = Number(salaryInput.replace(/\./g, "").replace(",", "."));
    if (isNaN(val) || val < MIN_SALARY) {
      setSalary(MIN_SALARY);
      setSalaryInput(String(MIN_SALARY));
    } else if (val > MAX_SALARY) {
      setSalary(MAX_SALARY);
      setSalaryInput(String(MAX_SALARY));
    } else {
      setSalary(val);
      setSalaryInput(String(val));
    }
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

        {/* Salario bruto: slider + input manual */}
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
          <input
            type="range"
            min={MIN_SALARY}
            max={MAX_SALARY}
            step={SALARY_STEP}
            value={salary}
            onChange={handleSliderChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-300">
            <span>{MIN_SALARY.toLocaleString("es-ES")} €</span>
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
              className={`text-5xl font-medium ${
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

      {/* Métricas secundarias */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <MetricCard
          title="Cuota mensual"
          value={`${metrics.monthlyPayment.toLocaleString("es-ES")} €`}
          subtitle="30 años · 3,5% TAE"
        />
        <MetricCard
          title="Esfuerzo salarial"
          value={`${metrics.yearsOfSalary} años`}
          subtitle="para comprar 70 m²"
        />
        <MetricCard
          title="Precio total del piso"
          value={`${(metrics.pricePerSqm * SURFACE_SQM).toLocaleString("es-ES")} €`}
          subtitle="entrada mínima 20%"
        />
      </div>

      {/* Gráfico y tabla en dos columnas en pantallas grandes */}
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

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}
