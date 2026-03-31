import { useEffect, useMemo  } from "react";

export default function LocationSelector({
  ccaa,
  provincia,
  municipio,
  onCcaaChange,
  onProvinciaChange,
  onMunicipioChange,
  ccaaList,
  provincias,
  municipios,
}) {
  const provinciasFiltered = useMemo(
    () =>
      Object.entries(provincias)
        .filter(([, v]) => v.ccaa === ccaa)
        .map(([name]) => name)
        .sort(),
    [provincias, ccaa],
  );

  const municipiosFiltered = useMemo(
    () =>
      Object.entries(municipios)
        .filter(([, v]) => v.provincia === provincia)
        .map(([name]) => name)
        .sort(),
    [municipios, provincia],
  );

  // Si solo hay una provincia, seleccionarla automáticamente
  useEffect(() => {
    if (
      provinciasFiltered.length === 1 &&
      provincia !== provinciasFiltered[0]
    ) {
      onProvinciaChange(provinciasFiltered[0]);
      onMunicipioChange("");
    }
  }, [provincia, provinciasFiltered, onProvinciaChange, onMunicipioChange]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Comunidad autónoma
        </label>
        <select
          value={ccaa}
          onChange={(e) => {
            onCcaaChange(e.target.value);
            onProvinciaChange("");
            onMunicipioChange("");
          }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900"
        >
          {ccaaList.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {provinciasFiltered.length > 1 && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Provincia <span className="text-gray-400">(opcional)</span>
          </label>
          <select
            value={provincia}
            onChange={(e) => {
              onProvinciaChange(e.target.value);
              onMunicipioChange("");
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900"
          >
            <option value="">Toda la comunidad</option>
            {provinciasFiltered.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      {provincia && municipiosFiltered.length > 0 && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Municipio <span className="text-gray-400">(opcional)</span>
          </label>
          <select
            value={municipio}
            onChange={(e) => onMunicipioChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900"
          >
            <option value="">Toda la provincia</option>
            {municipiosFiltered.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Solo municipios de más de 25.000 habitantes · Fuente: Ministerio de
            Vivienda
          </p>
        </div>
      )}
    </div>
  );
}
