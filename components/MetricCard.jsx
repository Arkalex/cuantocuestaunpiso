export default function MetricCard({ title, value, subtitle, status }) {
  const containerColors = {
    danger: "bg-red-50 border-red-100",
    warning: "bg-amber-50 border-amber-100",
    ok: "bg-green-50 border-green-100",
  };

  const valueColors = {
    danger: "text-red-600",
    warning: "text-amber-600",
    ok: "text-green-600",
  };

  const subtitleColors = {
    danger: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600",
    ok: "bg-green-100 text-green-600",
  };

  return (
    <div
      className={`border rounded-xl p-5 flex flex-col gap-1 transition-colors duration-300 ${
        status ? containerColors[status] : "bg-white border-gray-100"
      }`}
    >
      <p className="text-xs text-gray-400 leading-tight">{title}</p>
      <p
        className={`text-3xl font-medium leading-none mt-1 transition-colors duration-300 ${
          status ? valueColors[status] : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <span
          className={`text-xs mt-2 px-2 py-1 rounded-full inline-block font-medium w-fit ${
            status
              ? subtitleColors[status]
              : "bg-gray-50 text-gray-500 border border-gray-100"
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
