import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Fondo animado */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid decorativo */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px'}}
      />

      <div className="relative text-center max-w-lg">

        {/* Número 404 */}
        <div className="relative mb-6">
          <p className="text-[10rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-gray-900 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Partido no encontrado
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          La página que buscas no existe o ha sido eliminada.<br />
          Puede que el enlace esté roto o que hayas escrito mal la dirección.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-900/30"
          >
            Volver a la cartelera
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-700">
          <div className="w-5 h-5 bg-emerald-500/20 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span className="text-sm font-medium">StreamFútbol</span>
        </div>
      </div>
    </div>
  );
}