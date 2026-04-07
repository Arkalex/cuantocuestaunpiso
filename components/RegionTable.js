import { NEW_BUILD_MULTIPLIER, SURFACE_SQM } from "@/lib/calculateMetrics";

export default function RegionTable({ regions, selectedRegion, onSelect, type }) {
  const multiplier = type === "new" ? NEW_BUILD_MULTIPLIER : 1;

  const rows = Object.entries(regions)
    .map(([name, data]) => ({
      name,
      pricePerSqm: Math.round(data.pricePerSqm * multiplier),
      totalPrice: Math.round(data.pricePerSqm * multiplier * SURFACE_SQM),
      yearsOfSalary: (
        (data.pricePerSqm * multiplier * SURFACE_SQM) /
        data.avgSalary
      ).toFixed(1),
    }))
    .sort((a, b) => a.pricePerSqm - b.pricePerSqm);

  const maxPrice = Math.max(...rows.map((r) => r.pricePerSqm));

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400 border-b border-gray-50">
          <th className="text-left px-4 py-2 font-normal">Comunidad</th>
          <th className="text-right px-3 py-2 font-normal whitespace-nowrap">
            €/m²
          </th>
          <th className="text-right px-4 py-2 font-normal whitespace-nowrap">
            Años
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const barPct = Math.round((row.pricePerSqm / maxPrice) * 100);
          const yearsNum = Number(row.yearsOfSalary);
          const yearsColor =
            yearsNum > 10
              ? "text-red-600"
              : yearsNum > 7
                ? "text-amber-600"
                : "text-green-600";

          // Bar color: gradient from green (cheap) to red (expensive)
          const barColor =
            barPct > 75
              ? "bg-red-300"
              : barPct > 50
                ? "bg-amber-300"
                : barPct > 25
                  ? "bg-blue-300"
                  : "bg-green-300";

          return (
            <tr
              key={row.name}
              onClick={() => onSelect(row.name)}
              className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                row.name === selectedRegion ? "bg-blue-50" : ""
              }`}
            >
              <td
                className={`px-4 py-2 ${
                  row.name === selectedRegion
                    ? "text-blue-800 font-medium"
                    : "text-gray-700"
                }`}
              >
                {row.name}
              </td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-gray-700 text-xs">
                    {row.pricePerSqm.toLocaleString("es-ES")} €
                  </span>
                  <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              </td>
              <td
                className={`px-4 py-2 text-right font-medium whitespace-nowrap ${yearsColor}`}
              >
                {row.yearsOfSalary}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
