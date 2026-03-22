import connectDB from '../../../../../lib/mongodb';
import Partido from '../../../../../models/Partido';
import Link from 'next/link';
import HLSPlayer from '../../../../components/HLSPlayer';

async function getPartido(id) {
  await connectDB();
  try {
    const partido = await Partido.findById(id).lean();
    if (!partido) return null;
    partido._id = partido._id.toString();
    partido.fecha = partido.fecha.toISOString();
    return partido;
  } catch {
    return null;
  }
}

export default async function PartidoPage({ params }) {
  const { id } = await params;
  const partido = await getPartido(id);

  if (!partido) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-6">⚽</p>
          <h1 className="text-3xl font-bold text-red-500 mb-4">Partido no encontrado</h1>
          <p className="text-gray-400 mb-8">El evento que buscas no existe o ha sido eliminado.</p>
          <Link href="/" className="px-6 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition font-medium">
            Volver a la cartelera
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header — z-30 para estar siempre por encima del reproductor */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-emerald-400 transition flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la cartelera
          </Link>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-sm text-gray-400 truncate">
            {partido.equipoLocal} vs {partido.equipoVisitante}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Cabecera del partido */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 flex flex-wrap items-center gap-x-4">
              <span className="text-emerald-400">{partido.equipoLocal}</span>
              <span className="text-gray-600 text-2xl font-light">vs</span>
              <span className="text-white">{partido.equipoVisitante}</span>
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(partido.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
            partido.estado === 'en-directo'
              ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
              : partido.estado === 'finalizado'
              ? 'bg-gray-500/10 border-gray-600 text-gray-400'
              : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
          }`}>
            {partido.estado === 'en-directo' ? '● EN VIVO' : partido.estado?.toUpperCase()}
          </div>
        </div>

        {/* Reproductor */}
        <HLSPlayer
          streamUrl={partido.streamUrl}
          estado={partido.estado}
          fecha={partido.fecha}
        />

        {/* Descripción */}
        {partido.descripcion && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Descripción del encuentro</h3>
            <p className="text-gray-300 leading-relaxed">{partido.descripcion}</p>
          </div>
        )}

      </div>
    </div>
  );
}