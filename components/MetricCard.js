export default function MetricCard({ title, value, subtitle, status, highlight = false }) {
  const colors = {
    danger: "bg-red-50 text-red-700 border border-red-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    ok: "bg-green-50 text-green-700 border border-green-100",
  };

  const valueColors = {
    danger: "text-red-600",
    warning: "text-amber-600",
    ok: "text-green-600",
  };

  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-1 ${
        highlight
          ? "bg-linear-to-br from-slate-50 to-white border border-slate-200 shadow-sm"
          : "bg-white border border-gray-100"
      }`}
    >
      <p className="text-xs text-gray-400 leading-tight">{title}</p>
      <p
        className={`text-3xl font-medium leading-none mt-1 ${status ? valueColors[status] : "text-gray-900"}`}
      >
        {value}
      </p>
      {subtitle && (
        <span
          className={`text-xs mt-2 px-2 py-1 rounded-full inline-block font-medium w-fit ${colors[status] || "bg-gray-50 text-gray-500 border border-gray-100"}`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
