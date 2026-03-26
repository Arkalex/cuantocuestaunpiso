export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            cuantocuestaunpiso.es
          </h1>
          <p className="text-xs text-gray-400">
            Datos oficiales del INE y Ministerio de Vivienda
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
