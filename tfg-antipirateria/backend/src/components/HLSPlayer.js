'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function getSessionId() {
  let sid = sessionStorage.getItem('streamSessionId');
  if (!sid) {
    sid = 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('streamSessionId', sid);
  }
  return sid;
}

export default function HLSPlayer({ streamUrl, estado, fecha }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const heartbeatRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const iniciarHeartbeat = () => {
    if (heartbeatRef.current) return;
    const token = localStorage.getItem('token');
    const sessionId = getSessionId();

    const ping = async () => {
      try {
        const res = await fetch('/api/stream/acceso', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!data.success && data.blocked) {
          setBlocked(true);
          setBlockReason(data.motivo || 'Acceso simultáneo detectado.');
          detenerHeartbeat();
          if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
          if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
        }
      } catch {}
    };

    ping();
    heartbeatRef.current = setInterval(ping, 15000);
  };

  const detenerHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const handlePlay = async () => {
    if (!streamUrl || !videoRef.current) return;

    const token = localStorage.getItem('token');
    const sessionId = getSessionId();

    try {
      const res = await fetch('/api/stream/acceso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!data.success && data.blocked) {
        setBlocked(true);
        setBlockReason(data.motivo || 'Tu cuenta ha sido bloqueada por acceso simultáneo.');
        return;
      }
    } catch {}

    setStarted(true);
    setLoading(true);
    iniciarHeartbeat();

    const Hls = (await import('hls.js')).default;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        videoRef.current.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) { setLoading(false); setError('No se puede cargar el stream.'); }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setLoading(false);
        videoRef.current.play().catch(() => {});
      });
      videoRef.current.addEventListener('error', () => {
        setLoading(false);
        setError('No se puede cargar el stream.');
      });
    } else {
      setLoading(false);
      setError('Tu navegador no soporta la reproducción de streams HLS.');
    }
  };

  useEffect(() => {
    return () => {
      detenerHeartbeat();
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, []);

  if (!mounted) return <div className="aspect-video w-full bg-gray-900 rounded-xl border border-gray-800 animate-pulse" />;

  if (estado === 'programado') {
    return (
      <div className="aspect-video w-full bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-1">El partido aún no ha comenzado</p>
          {fecha && (
            <p className="text-gray-400 text-sm">
              Programado para el {new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <p className="text-gray-600 text-xs mt-2">La retransmisión comenzará cuando el partido esté en directo</p>
        </div>
      </div>
    );
  }

  if (estado === 'finalizado') {
    return (
      <div className="aspect-video w-full bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-1">Este partido ha finalizado</p>
          <p className="text-gray-500 text-sm">La retransmisión en directo ha concluido</p>
        </div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="relative aspect-video w-full bg-gray-900 rounded-xl border border-red-500/30 overflow-hidden flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-gray-950 to-black" />
        <div className="relative">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Cuenta bloqueada</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto">{blockReason}</p>
          <p className="text-gray-600 text-xs max-w-xs mx-auto">
            Si crees que es un error, contacta con el administrador de la plataforma.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="relative aspect-video w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
        <div className="relative text-center px-6">
          <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Contenido exclusivo para usuarios registrados</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Inicia sesión para acceder a la retransmisión en directo de forma legal y segura.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition">
              Iniciar sesión
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition border border-gray-700">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="aspect-video w-full bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          EN VIVO
        </div>
        <p className="text-gray-400 font-medium">Stream no configurado</p>
        <p className="text-gray-600 text-sm">El administrador aún no ha añadido la URL de retransmisión</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {!started && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center z-10">
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            EN VIVO
          </div>
          <button onClick={handlePlay} className="group flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-200 shadow-2xl shadow-emerald-900/50">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm group-hover:text-emerald-400 transition">Ver en directo</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Cargando stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20 flex-col gap-3">
          <svg className="w-12 h-12 text-red-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {started && !loading && !error && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white pointer-events-none z-10">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          EN VIVO
        </div>
      )}

      <video ref={videoRef} className="w-full h-full" controls playsInline />
    </div>
  );
}