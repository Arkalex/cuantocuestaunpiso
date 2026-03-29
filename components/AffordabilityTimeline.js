export default function AffordabilityTimeline({
  downPaymentNeeded = 0,
  totalInitialNeeded = 0,
  currentSalary = 28000,
  monthlyPayment = 0,
}) {
  // Sanitize inputs to prevent undefined errors
  const downPaymentNeeded_safe = Math.max(0, downPaymentNeeded || 0);
  const totalInitialNeeded_safe = Math.max(0, totalInitialNeeded || 0);
  const currentSalary_safe = currentSalary || 28000;
  const monthlyPayment_safe = monthlyPayment || 0;

  // Si puedes comprarlo ahora
  if (downPaymentNeeded_safe === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          🎉 ¡Puedes comprar ahora!
        </h3>
        <p className="text-sm text-gray-600">
          Con tu salario actual de{" "}
          <span className="font-semibold">
            {currentSalary_safe.toLocaleString("es-ES")}€ anuales
          </span>
          , ya cuentas con la capacidad económica para acceder a una hipoteca
          en estas condiciones. El próximo paso es ponerte en contacto con un
          asesor hipotecario.
        </p>
      </div>
    );
  }

  const monthlyNetSalary = (currentSalary_safe * 0.72) / 12;
  const monthlySavingsRates = [
    { rate: 100, label: "100€ mensuales" },
    { rate: 300, label: "300€ mensuales" },
    { rate: 500, label: "500€ mensuales" },
    { rate: 1000, label: "1.000€ mensuales" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        💰 Hoja de ruta: Cuándo podrías comprar
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Si empiezas a ahorrar, aquí te mostramos cuánto tiempo te llevaría reunir
        los{" "}
        <span className="font-semibold">
          {totalInitialNeeded_safe.toLocaleString("es-ES")}€
        </span>{" "}
        necesarios (entrada + costos iniciales):
      </p>

      <div className="space-y-4">
        {monthlySavingsRates.map((option) => {
          const monthsNeeded = totalInitialNeeded_safe > 0 ? Math.ceil(totalInitialNeeded_safe / option.rate) : 0;
          const yearsNeeded = (monthsNeeded / 12).toFixed(1);
          const pctOfSalary = monthlyNetSalary > 0 ? ((option.rate / monthlyNetSalary) * 100).toFixed(0) : 0;

          let feasibility = "✅ Muy viable";
          let feasibilityColor = "bg-green-50 border-green-200";
          if (Number(pctOfSalary) > 20) {
            feasibility = "⚠️ Difícil";
            feasibilityColor = "bg-amber-50 border-amber-200";
          }
          if (Number(pctOfSalary) > 35) {
            feasibility = "❌ Muy difícil";
            feasibilityColor = "bg-red-50 border-red-200";
          }

          return (
            <div
              key={option.rate}
              className={`${feasibilityColor} border rounded-xl p-4`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({pctOfSalary}% de tu salario neto mensual)
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {feasibility}
                </span>
              </div>

              <div className="bg-white bg-opacity-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">
                    🗓️ En{" "}
                    <span className="font-semibold">
                      {monthsNeeded} meses
                    </span>{" "}
                    ({yearsNeeded} años)
                  </span>
                  <span className="text-gray-400">
                    {monthlyPayment_safe > monthlyNetSalary * 0.3
                      ? "Cuota: " +
                        Math.round((monthlyPayment_safe / monthlyNetSalary) * 100) +
                        "% salario"
                      : "✓ Cuota viable"}
                  </span>
                </div>
              </div>

              <div className="mt-3 relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{
                    width: "100%",
                    animation: `fill 0.8s ease-out`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 Tip: Si cambias de comunidad autónoma podrías encontrar pisos más
          baratos y alcanzables en menos tiempo.
        </p>
      </div>
    </div>
  );
}
