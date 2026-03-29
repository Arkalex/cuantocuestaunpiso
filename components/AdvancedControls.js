import { useState } from "react";

export default function AdvancedControls({
  surfaceM2,
  setSurfaceM2,
  yearsHypotheca,
  setYearsHypotheca,
  interestRate,
  setInterestRate,
  downPaymentPct,
  setDownPaymentPct,
  onReset,
}) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: "surface",
      icon: "📐",
      title: "Superficie del piso",
      description: `${surfaceM2} m²`,
      value: surfaceM2,
      min: 30,
      max: 150,
      onChange: setSurfaceM2,
    },
    {
      id: "years",
      icon: "📅",
      title: "Plazo de hipoteca",
      description: `${yearsHypotheca} años`,
      value: yearsHypotheca,
      min: 15,
      max: 40,
      onChange: setYearsHypotheca,
    },
    {
      id: "interest",
      icon: "📈",
      title: "Tasa de interés anual",
      description: `${interestRate.toFixed(2)}%`,
      value: interestRate,
      min: 1.5,
      max: 6,
      step: 0.1,
      onChange: setInterestRate,
    },
    {
      id: "downpayment",
      icon: "💰",
      title: "% de entrada",
      description: `${downPaymentPct}%`,
      value: downPaymentPct,
      min: 10,
      max: 50,
      onChange: setDownPaymentPct,
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-transparent">
        <h3 className="text-sm font-semibold text-gray-900">
          🎛️ Simulador Avanzado
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Ajusta cada parámetro para personalizar tu análisis
        </p>
      </div>

      <div className="divide-y divide-gray-50">
        {sections.map((section) => (
          <div key={section.id} className="px-6 py-3">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between py-2 hover:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{section.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {section.title}
                  </p>
                  <p className="text-xs text-blue-600 font-semibold">
                    {section.description}
                  </p>
                </div>
              </div>
              <span
                className={`text-lg transition-transform ${
                  expandedSection === section.id ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {expandedSection === section.id && (
              <div className="mt-3 pb-4">
                <input
                  type="range"
                  min={section.min}
                  max={section.max}
                  step={section.step || 1}
                  value={section.value}
                  onChange={(e) =>
                    section.onChange(
                      section.step
                        ? parseFloat(e.target.value)
                        : parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{section.min}</span>
                  <span>{section.max}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full px-6 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-50"
      >
        Restablecer valores por defecto
      </button>
    </div>
  );
}
