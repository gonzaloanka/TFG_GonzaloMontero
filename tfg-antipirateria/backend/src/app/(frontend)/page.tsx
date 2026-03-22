import Link from 'next/link';
import connectDB from '../../../lib/mongodb';
import Partido from '../../../models/Partido';
import UserMenu from '../../components/UserMenu';

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <header className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">StreamFútbol</h1>
          
          {}
          <UserMenu />
          
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-6xl font-bold mb-6">Todos los partidos en directo</h2>
        <p className="text-xl text-gray-300 mb-12">LaLiga, Champions, Copa del Rey y más</p>
        <Link href="#cartelera" className="bg-green-600 px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition">
          Ver Partidos Disponibles
        </Link>
      </section>

      <section id="cartelera" className="container mx-auto px-6 py-12">
        <h3 className="text-3xl font-bold mb-8">Próximos partidos destacados</h3>
        
        {partidos.length === 0 ? (
           <div className="bg-gray-800 rounded-lg p-10 text-center">
              <p className="text-gray-400">No hay partidos programados en la base de datos.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partidos.map((partido) => (
              <Link href={`/partidos/${partido._id}`} key={partido._id} className="block group">
                <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition duration-300 border border-transparent hover:border-blue-500 cursor-pointer h-full">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-gray-400 text-sm">
                        {new Date(partido.fecha).toLocaleDateString()} • {new Date(partido.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                     {partido.estado === 'en-directo' && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">EN VIVO</span>
                     )}
                  </div>
                  
                  <h4 className="text-2xl font-bold group-hover:text-blue-400 transition">
                     {partido.equipoLocal} <span className="text-gray-500 text-lg">vs</span> {partido.equipoVisitante}
                  </h4>
                  
                  <p className="text-gray-400 mt-2 text-sm truncate">
                     {partido.descripcion || "Partido oficial en directo"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="container mx-auto px-6 py-8 mt-20 border-t border-gray-700 text-center text-gray-400">
        <p>StreamFútbol © 2026 - TFG Gonzalo Montero</p>
      </footer>
    </main>
  );
}
