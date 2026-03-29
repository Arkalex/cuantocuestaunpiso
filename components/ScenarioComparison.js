export default function ScenarioComparison({
  basicMetrics,
  advancedMetrics,
  isAdvancedMode,
}) {
  if (!isAdvancedMode) return null;

  if (!basicMetrics?.monthlyPayment || !advancedMetrics?.monthlyPayment) return null;

  const safeSurfaceM2 = advancedMetrics?.surfaceM2 ?? 70;
  const safeYearsHypotheca = advancedMetrics?.yearsHypotheca ?? 30;
  const safeInterestRate = advancedMetrics?.interestRate ?? 3.5;
  const safeDownPaymentPct = advancedMetrics?.downPaymentPct ?? 20;

  const basicPayment = basicMetrics.monthlyPayment || 0;
  const advancedPayment = advancedMetrics.monthlyPayment || 0;
  const difference = Math.round(advancedPayment - basicPayment);
  const monthlyDifference = Math.abs(difference);
  const percentChange =
    (((advancedPayment - basicPayment) / basicPayment) * 100).toFixed(1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        📊 Comparativa: Modo Simple vs Avanzado
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Modo Simple */}
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
          <p className="text-xs text-gray-500 font-semibold mb-3">
            ⚙️ MODO SIMPLE (por defecto)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Superficie</span>
              <span className="font-semibold text-gray-900">70 m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Plazo hipoteca</span>
              <span className="font-semibold text-gray-900">30 años</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Tasa interés</span>
              <span className="font-semibold text-gray-900">3.50%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Entrada</span>
              <span className="font-semibold text-gray-900">20%</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 font-semibold">
                  Cuota mensual
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {basicPayment.toLocaleString("es-ES")} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modo Avanzado */}
        <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
          <p className="text-xs text-blue-700 font-semibold mb-3">
            🎛️ TU SIMULACIÓN (modo avanzado)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Superficie</span>
              <span className="font-semibold text-gray-900">
                {safeSurfaceM2} m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Plazo hipoteca</span>
              <span className="font-semibold text-gray-900">
                {safeYearsHypotheca} años
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Tasa interés</span>
              <span className="font-semibold text-gray-900">
                {safeInterestRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Entrada</span>
              <span className="font-semibold text-gray-900">
                {safeDownPaymentPct}%
              </span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 font-semibold">
                  Cuota mensual
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {advancedPayment.toLocaleString("es-ES")} €
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impacto */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
        <p className="text-xs text-gray-600 mb-2">Cambio en tu cuota mensual:</p>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-bold ${
              difference > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {difference > 0 ? "+" : ""}
            {monthlyDifference.toLocaleString("es-ES")} €
          </span>
          <span
            className={`text-sm font-semibold ${
              difference > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            ({percentChange}% {difference > 0 ? "más" : "menos"})
          </span>
        </div>

        {difference < 0 && (
          <p className="text-xs text-green-700 mt-2">
            ✅ ¡Ahorras {Math.abs(monthlyDifference)} € mensuales! Eso son{" "}
            <strong>
              {(Math.abs(monthlyDifference) * 12).toLocaleString("es-ES")}€
              /año
            </strong>
          </p>
        )}

        {difference > 0 && (
          <p className="text-xs text-amber-700 mt-2">
            ⚠️ Tu cuota es más alta. Verifica que pueda encajar en tu presupuesto
          </p>
        )}
      </div>
    </div>
  );
}
