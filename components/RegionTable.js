import {
  NEW_BUILD_MULTIPLIER,
  SURFACE_SQM,
} from "@/lib/calculateMetrics";

export default function RegionTable({
  regions,
  selectedRegion,
  onSelect,
  type,
}) {
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

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400 border-b border-gray-50">
          <th className="text-left px-4 py-2 font-normal">Comunidad</th>
          <th className="text-right px-3 py-2 font-normal whitespace-nowrap">
            €/m²
          </th>
          <th className="text-right px-3 py-2 font-normal whitespace-nowrap">
            Total 70m²
          </th>
          <th className="text-right px-4 py-2 font-normal whitespace-nowrap">
            Años
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.name}
            onClick={() => onSelect(row.name)}
            className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
              row.name === selectedRegion ? "bg-blue-50" : ""
            }`}
          >
            <td
              className={`px-4 py-2 ${row.name === selectedRegion ? "text-blue-800 font-medium" : "text-gray-700"}`}
            >
              {row.name}
            </td>
            <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">
              {row.pricePerSqm.toLocaleString("es-ES")} €
            </td>
            <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">
              {row.totalPrice.toLocaleString("es-ES")} €
            </td>
            <td
              className={`px-4 py-2 text-right font-medium whitespace-nowrap ${
                Number(row.yearsOfSalary) > 10
                  ? "text-red-600"
                  : Number(row.yearsOfSalary) > 7
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {row.yearsOfSalary}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
