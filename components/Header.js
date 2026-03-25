export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white mb-8">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            Accesibilidad a la vivienda en España
          </h1>
          <p className="text-xs text-gray-400">
            Basado en datos abiertos del INE
          </p>
        </div>
        <a
          href="https://www.ine.es"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Fuente: INE.es
        </a>
      </div>
    </header>
  );
}
