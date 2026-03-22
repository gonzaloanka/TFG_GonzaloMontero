'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || 'Revisa los datos e inténtalo de nuevo');
    }
  };

  // Pantalla de éxito tras el registro
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-md text-center">

          {/* Icono animado */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">¡Cuenta creada!</h2>
          <p className="text-gray-400 mb-2">
            Bienvenido a <span className="text-emerald-400 font-semibold">StreamFútbol</span>, {formData.name}.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Ya puedes acceder a todas las retransmisiones en directo.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Tu cuenta</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{formData.name}</p>
                <p className="text-gray-500 text-xs">{formData.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            Iniciar sesión
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
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
          <p className="text-gray-400">Crea tu cuenta gratuita</p>
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
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition text-white placeholder-gray-600"
                placeholder="Tu nombre"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
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
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-medium transition">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}