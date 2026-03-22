'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      localStorage.setItem('token', data.token);
      setUserName(data.user?.name || data.user?.email || 'Usuario');
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } else {
      setError(data.error || 'Email o contraseña incorrectos');
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido, {userName}!</h2>
          <p className="text-gray-400 text-sm">Redirigiendo a la cartelera...</p>
          <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[progress_2s_linear_forwards]" style={{animation: 'width 2s linear forwards', width: '100%'}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative">

      {/* Volver al inicio */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition group">
        <div className="p-2 bg-gray-900 rounded-full group-hover:bg-gray-800 transition border border-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <span className="font-medium text-sm hidden md:block">Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-500 mb-1">StreamFútbol</h1>
          <p className="text-gray-400">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">

          {/* Mensaje de error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition text-white placeholder-gray-600"
                placeholder="tu@email.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition text-white placeholder-gray-600"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-medium transition">
              Regístrate gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}