import Link from 'next/link';
import connectDB from '../../../lib/mongodb';
import Partido from '../../../models/Partido';
import UserMenu from '../../components/UserMenu';
import CartelaraCliente from '../../components/CarteleraCliente';

async function getPartidos() {
  await connectDB();
  const partidos = await Partido.find().sort({ fecha: 1 }).lean();
  return partidos.map(p => ({
    ...p,
    _id: p._id.toString(),
    fecha: p.fecha.toISOString(),
    autor: p.autor?.toString()
  }));
}

export default async function Home() {
  const partidos = await getPartidos();
  const enVivo = partidos.filter(p => p.estado === 'en-directo');

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">StreamFútbol</span>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">

        {/* Fondo animado */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px'}}
        />

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          {/* Badge EN VIVO */}
          {enVivo.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {enVivo.length} partido{enVivo.length > 1 ? 's' : ''} en directo ahora
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            El fútbol en directo,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              cuando quieras
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Accede a las retransmisiones de LaLiga, Champions League, Copa del Rey y más. Solo para usuarios registrados.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-10 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {partidos.length} eventos disponibles
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Streaming en HD
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Acceso seguro
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-center gap-6">
            <a
              href="#cartelera"
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-900/30"
            >
              Ver cartelera
            </a>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* EN DIRECTO AHORA */}
      {enVivo.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-xl font-bold text-white">En directo ahora</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enVivo.map(partido => (
              <Link key={partido._id} href={`/partidos/${partido._id}`} className="block group">
                <div className="bg-gray-900 border border-red-500/20 hover:border-red-500/50 rounded-2xl p-5 transition relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      EN VIVO
                    </span>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                    {partido.equipoLocal} <span className="text-gray-600 font-normal text-sm">vs</span> {partido.equipoVisitante}
                  </h3>
                  {partido.descripcion && (
                    <p className="text-gray-500 text-sm mt-1 truncate">{partido.descripcion}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CARTELERA CON FILTROS */}
      <section id="cartelera" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Cartelera</h2>
          <span className="text-sm text-gray-500">{partidos.length} eventos</span>
        </div>
        <CartelaraCliente partidos={partidos} />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="font-bold text-white">StreamFútbol</span>
            </div>
            <p className="text-gray-600 text-sm">© 2026 StreamFútbol · TFG Gonzalo Montero · U-TAD</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/login" className="hover:text-gray-400 transition">Iniciar sesión</Link>
              <Link href="/register" className="hover:text-gray-400 transition">Registrarse</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}