'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Cambio de contraseña
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [showPwForm, setShowPwForm] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setUser(data.user);
        else router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Las contraseñas nuevas no coinciden');
      return;
    }

    setPwLoading(true);
    const token = localStorage.getItem('token');

    const res = await fetch('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }),
    });

    const data = await res.json();
    setPwLoading(false);

    if (data.success) {
      showToast('Contraseña actualizada correctamente');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwForm(false);
    } else {
      setPwError(data.error || 'Error al cambiar la contraseña');
    }
  };

  const diasDesdeRegistro = user
    ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="w-px h-5 bg-gray-700" />
          <Link href="/" className="text-emerald-500 font-bold text-lg">StreamFútbol</Link>
          <div className="w-px h-5 bg-gray-700" />
          <span className="text-gray-400 text-sm">Mi perfil</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-6">

        {/* Tarjeta principal del perfil */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-emerald-900/40 via-gray-900 to-blue-900/40" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-10 mb-6">
              <div className="flex items-end gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-gray-900 bg-gray-800 shadow-xl"
                />
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
                      user.role === 'admin'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
              </div>

              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-sm hover:bg-amber-500/20 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Panel de Admin
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Miembro desde</p>
                <p className="text-white font-semibold">
                  {new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Días en la plataforma</p>
                <p className="text-white font-semibold">{diasDesdeRegistro} días</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 col-span-2 md:col-span-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Tipo de cuenta</p>
                <p className={`font-semibold ${user.role === 'admin' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {user.role === 'admin' ? 'Administrador' : 'Acceso completo'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Información de la cuenta</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Nombre</p>
                <p className="text-white text-sm font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-white text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Contraseña</p>
                <p className="text-white text-sm font-medium">••••••••</p>
              </div>
              <button
                onClick={() => setShowPwForm(!showPwForm)}
                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition"
              >
                {showPwForm ? 'Cancelar' : 'Cambiar'}
              </button>
            </div>

            {/* Formulario cambio de contraseña */}
            {showPwForm && (
              <form onSubmit={handlePasswordChange} className="pt-2 space-y-3">
                {pwError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {pwError}
                  </div>
                )}
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {pwLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Actualizar contraseña
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Sesión</h2>
          <p className="text-gray-500 text-sm mb-4">Cierra tu sesión en este dispositivo.</p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}