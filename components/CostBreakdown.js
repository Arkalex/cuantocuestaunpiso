"use client";

export default function CostBreakdown({
  pricePerSqm,
  totalPrice,
  monthlyPayment,
  downPaymentPct = 20,
  yearsHypotheca = 30,
  interestRate = 3.5,
  salaryPct = 0,
  status = "danger",
  status_label = "Inaccesible",
}) {
  // Calcular costos
  const downPayment = Math.round(totalPrice * (downPaymentPct / 100));
  const loanAmount = totalPrice - downPayment;
  const totalInterests = Math.round(monthlyPayment * yearsHypotheca * 12 - loanAmount);

  // Costos iniciales (estimación)
  const itp = Math.round(totalPrice * 0.07); // 7% en compra usada
  const taskationFee = Math.round(totalPrice * 0.008); // 0.8% tasación
  const notarial = Math.round(totalPrice * 0.005); // 0.5% gestoría/notaría
  const registro = Math.round(totalPrice * 0.002); // 0.2% registro

  const initialCosts = itp + taskationFee + notarial + registro;
  const totalInitialWithDownPayment = downPayment + initialCosts;

  const affordabilityScore = Math.max(0, 100 - salaryPct);

  return (
    <div className="space-y-6">
      {/* Main Metric - Cuota Mensual */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
        <p className="text-sm text-gray-600 mb-2">Cuota mensual de hipoteca</p>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-6xl font-bold text-blue-600">
            {monthlyPayment.toLocaleString("es-ES")}
          </span>
          <span className="text-2xl text-gray-400">€</span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-600">
                Impacto en tu salario neto
              </span>
              <span
                className={`text-sm font-bold ${
                  status === "ok"
                    ? "text-green-600"
                    : status === "warning"
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {salaryPct}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === "ok"
                    ? "bg-green-500"
                    : status === "warning"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.min(salaryPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              30% es el límite recomendado
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === "ok"
                  ? "bg-green-100 text-green-700"
                  : status === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {status_label}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de costos desglosados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Precio total del piso</p>
          <p className="text-xl font-bold text-gray-900">
            {totalPrice.toLocaleString("es-ES")}€
          </p>
          <p className="text-xs text-gray-400 mt-1">@{pricePerSqm}€/m²</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Entrada requerida</p>
          <p className="text-xl font-bold text-blue-600">
            {downPayment.toLocaleString("es-ES")}€
          </p>
          <p className="text-xs text-gray-400 mt-1">{downPaymentPct}% del precio</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Financiación hipotecaria</p>
          <p className="text-xl font-bold text-indigo-600">
            {loanAmount.toLocaleString("es-ES")}€
          </p>
          <p className="text-xs text-gray-400 mt-1">a {yearsHypotheca} años</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Total con intereses</p>
          <p className="text-xl font-bold text-amber-600">
            {(loanAmount + totalInterests).toLocaleString("es-ES")}€
          </p>
          <p className="text-xs text-gray-400 mt-1">
            +{totalInterests.toLocaleString("es-ES")}€ intereses
          </p>
        </div>
      </div>

      {/* Costos iniciales breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          💸 Costos iniciales (antes de comprar)
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">
              🏛️ Impuesto de Transmisiones Patrimoniales (ITP){" "}
              <span className="text-xs text-gray-500">(7%)</span>
            </span>
            <span className="font-semibold text-gray-900">
              {itp.toLocaleString("es-ES")}€
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">
              📋 Tasación y gestoría{" "}
              <span className="text-xs text-gray-500">(0.8%)</span>
            </span>
            <span className="font-semibold text-gray-900">
              {taskationFee.toLocaleString("es-ES")}€
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">
              ✍️ Notaría{" "}
              <span className="text-xs text-gray-500">(0.5%)</span>
            </span>
            <span className="font-semibold text-gray-900">
              {notarial.toLocaleString("es-ES")}€
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">
              📝 Registro de propiedad{" "}
              <span className="text-xs text-gray-500">(0.2%)</span>
            </span>
            <span className="font-semibold text-gray-900">
              {registro.toLocaleString("es-ES")}€
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-semibold text-blue-900">
              Total costos iniciales
            </span>
            <span className="font-bold text-blue-600 text-lg">
              {initialCosts.toLocaleString("es-ES")}€
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          💡 Necesitarás tener{" "}
          <span className="font-semibold text-gray-700">
            {totalInitialWithDownPayment.toLocaleString("es-ES")}€
          </span>{" "}
          disponibles antes de comprar (entrada + costos iniciales)
        </p>
      </div>

      {/* Affordability Score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          🎯 Tu puntuación de viabilidad
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={
                    affordabilityScore >= 70
                      ? "#10b981"
                      : affordabilityScore >= 40
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                  strokeWidth="8"
                  strokeDasharray={`${(affordabilityScore / 100) * 351.9} 351.9`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {affordabilityScore}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              {affordabilityScore >= 70
                ? "✅ Excelente viabilidad"
                : affordabilityScore >= 40
                  ? "⚠️ Viabilidad media"
                  : "❌ Viabilidad baja"}
            </p>
            <p className="text-xs text-gray-500">
              {affordabilityScore >= 70
                ? "Tu capacidad de compra es muy buena con estos parámetros."
                : affordabilityScore >= 40
                  ? "Podrías comprar, pero requeriría un esfuerzo económico significativo."
                  : "En estas condiciones, comprar sería muy difícil. Considera ahorrar más o buscar otras opciones."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
