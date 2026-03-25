export default function MetricCard({ title, value, subtitle, status }) {
  const colors = {
    danger: "bg-red-50 text-red-700",
    warning: "bg-amber-50 text-amber-700",
    ok: "bg-green-50 text-green-700",
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      {subtitle && (
        <p
          className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-medium ${colors[status] || "bg-gray-100 text-gray-500"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
