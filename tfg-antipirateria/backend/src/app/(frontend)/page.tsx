export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <header className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">StreamFútbol</h1>
          <div className="space-x-4">
            <a href="/login" className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700">Iniciar Sesión</a>
            <a href="/register" className="bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600">Registrarse</a>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-6xl font-bold mb-6">Todos los partidos en directo</h2>
        <p className="text-xl text-gray-300 mb-12">LaLiga, Champions, Copa del Rey y más</p>
        <a href="/partidos" className="bg-green-600 px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700">
          Ver Partidos Disponibles
        </a>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h3 className="text-3xl font-bold mb-8">Próximos partidos destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-2">15 Feb 2026 • 20:00</p>
            <h4 className="text-2xl font-bold">Real Madrid vs Barcelona</h4>
            <p className="text-gray-400 mt-2">LaLiga Jornada 22</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-2">18 Feb 2026 • 21:00</p>
            <h4 className="text-2xl font-bold">Atlético vs Sevilla</h4>
            <p className="text-gray-400 mt-2">LaLiga Jornada 23</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 mb-2">20 Feb 2026 • 18:45</p>
            <h4 className="text-2xl font-bold">Valencia vs Athletic</h4>
            <p className="text-gray-400 mt-2">Copa del Rey</p>
          </div>
        </div>
      </section>

      <footer className="container mx-auto px-6 py-8 mt-20 border-t border-gray-700 text-center text-gray-400">
        <p>StreamFútbol © 2026 - TFG Gonzalo Montero</p>
      </footer>
    </main>
  );
}
