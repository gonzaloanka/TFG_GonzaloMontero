'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function CarreleraCliente({ partidos }) {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const filtrados = useMemo(() => {
    return partidos.filter(p => {
      const matchSearch = search === '' ||
        p.equipoLocal.toLowerCase().includes(search.toLowerCase()) ||
        p.equipoVisitante.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
      return matchSearch && matchEstado;
    });
  }, [partidos, search, filtroEstado]);

  const ESTADOS = [
    { value: 'todos', label: 'Todos' },
    { value: 'en-directo', label: 'En directo' },
    { value: 'programado', label: 'Programados' },
    { value: 'finalizado', label: 'Finalizados' },
  ];

  const ESTADO_STYLES = {
    'programado': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    'en-directo': 'bg-red-500/10 border-red-500/30 text-red-400',
    'finalizado': 'bg-gray-700/50 border-gray-700 text-gray-500',
  };

  return (
    <div>
      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">

        {/* Buscador */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar equipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtros de estado */}
        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {ESTADOS.map(e => (
            <button
              key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filtroEstado === e.value
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {e.value === 'en-directo' && (
                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
              )}
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
          <p className="text-gray-500 mb-2">No se encontraron partidos</p>
          <button
            onClick={() => { setSearch(''); setFiltroEstado('todos'); }}
            className="text-sm text-emerald-500 hover:text-emerald-400 transition"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(partido => (
            <Link key={partido._id} href={`/partidos/${partido._id}`} className="block group">
              <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition h-full hover:bg-gray-900/80">

                {/* Header tarjeta */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-500 text-xs">
                    {new Date(partido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    {' · '}
                    {new Date(partido.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${ESTADO_STYLES[partido.estado]}`}>
                    {partido.estado === 'en-directo' ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        EN VIVO
                      </span>
                    ) : partido.estado === 'programado' ? 'Programado' : 'Finalizado'}
                  </span>
                </div>

                {/* Equipos */}
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition mb-2">
                  {partido.equipoLocal}
                  <span className="text-gray-600 font-normal text-sm mx-2">vs</span>
                  {partido.equipoVisitante}
                </h3>

                {/* Descripción */}
                {partido.descripcion && (
                  <p className="text-gray-500 text-sm truncate">{partido.descripcion}</p>
                )}

                {/* Footer tarjeta */}
                <div className="flex items-center justify-end mt-4">
                  <span className="text-xs text-gray-600 group-hover:text-emerald-500 transition flex items-center gap-1">
                    Ver partido
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}