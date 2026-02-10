import connectDB from '../../../../../lib/mongodb';
import Partido from '../../../../../models/Partido';
import Link from 'next/link';

async function getPartido(id) {
  await connectDB();
  try {
    const partido = await Partido.findById(id).lean();
    if (!partido) return null;
    
    partido._id = partido._id.toString();
    partido.fecha = partido.fecha.toISOString();
    return partido;
  } catch (error) {
    return null;
  }
}

export default async function PartidoPage({ params }) {
  const { id } = await params;
  const partido = await getPartido(id);

  if (!partido) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Partido no encontrado</h1>
        <p className="text-gray-400 mb-6">El evento que buscas no existe o ha sido eliminado.</p>
        <Link href="/" className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Botón Volver */}
        <Link href="/" className="text-gray-400 hover:text-emerald-400 mb-8 inline-flex items-center transition">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a la cartelera
        </Link>
        
        {/* Cabecera del Evento */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 gap-4">
            <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2 flex flex-wrap items-center gap-x-3">
                <span className="text-emerald-400">{partido.equipoLocal}</span> 
                <span className="text-gray-600 text-2xl font-light">vs</span>
                <span className="text-white">{partido.equipoVisitante}</span>
                </h1>
                <div className="flex items-center gap-4 text-sm md:text-base text-gray-400">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(partido.fecha).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(partido.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
            
            <div className={`px-4 py-1 rounded-full text-sm font-bold border ${
                partido.estado === 'en-directo' 
                ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
                : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
            }`}>
                {partido.estado === 'en-directo' ? '● EN VIVO' : partido.estado?.toUpperCase() || 'PROGRAMADO'}
            </div>
        </div>

        {/* ÁREA DEL REPRODUCTOR */}
        <div className="relative aspect-video w-full bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl group">
          {partido.streamUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm group-hover:bg-gray-900/30 transition-all">
               <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-emerald-500 transition shadow-lg mb-4">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               </div>
               <p className="text-white font-medium drop-shadow-md">Reproducir Stream</p>
               <p className="text-xs text-gray-400 mt-2 font-mono bg-black/50 px-2 py-1 rounded border border-gray-700">
                 Fuente: {partido.streamUrl}
               </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              <p className="text-xl font-medium">Señal no disponible</p>
              <p className="text-sm opacity-60 mt-1">El streaming comenzará 15 minutos antes del partido</p>
            </div>
          )}
        </div>

        {/* INFO ADICIONAL */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-3">Descripción del Encuentro</h3>
                <p className="text-gray-400 leading-relaxed">
                    {partido.descripcion || "No hay descripción disponible para este evento. Sigue la retransmisión oficial para más detalles."}
                </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white mb-3">Chat de Aficionados</h3>
                    <div className="h-24 bg-gray-950 rounded border border-gray-800 flex items-center justify-center text-gray-600 text-sm">
                        Chat desconectado
                    </div>
                </div>
                <button className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition text-sm font-medium" disabled>
                    Iniciar sesión para comentar
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
