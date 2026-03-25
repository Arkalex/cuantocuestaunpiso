export default function RegionTable({
  regions,
  selectedRegion,
  onSelect,
  type,
}) {
  const multiplier = type === "new" ? 1.18 : 1;

  const rows = Object.entries(regions)
    .map(([name, data]) => ({
      name,
      pricePerSqm: Math.round(data.pricePerSqm * multiplier),
      totalPrice: Math.round(data.pricePerSqm * multiplier * 70),
      yearsOfSalary: (
        (data.pricePerSqm * multiplier * 70) /
        data.avgSalary
      ).toFixed(1),
    }))
    .sort((a, b) => a.pricePerSqm - b.pricePerSqm);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <span className="text-sm font-medium text-gray-900">
          Todas las comunidades · ordenadas por precio
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-50">
            <th className="text-left px-4 py-2 font-normal">Comunidad</th>
            <th className="text-right px-4 py-2 font-normal">€/m²</th>
            <th className="text-right px-4 py-2 font-normal">Total 70 m²</th>
            <th className="text-right px-4 py-2 font-normal">
              Años de salario
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
                className={`px-4 py-2.5 ${row.name === selectedRegion ? "text-blue-800 font-medium" : "text-gray-700"}`}
              >
                {row.name}
              </td>
              <td className="px-4 py-2.5 text-right text-gray-700">
                {row.pricePerSqm.toLocaleString("es-ES")} €
              </td>
              <td className="px-4 py-2.5 text-right text-gray-700">
                {row.totalPrice.toLocaleString("es-ES")} €
              </td>
              <td
                className={`px-4 py-2.5 text-right font-medium ${
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
    </div>
  );
}
