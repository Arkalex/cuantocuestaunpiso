"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PriceChart({ data, selectedRegion }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Cargando datos...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey={selectedRegion}
          stroke="#185FA5"
          strokeWidth={2}
          dot={false}
          name={selectedRegion}
        />
        <Line
          type="monotone"
          dataKey="National"
          stroke="#aaa"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          name="Nacional"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
