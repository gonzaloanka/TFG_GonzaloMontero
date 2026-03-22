'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

const ESTADO_COLORS = {
  'programado': 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
  'en-directo': 'bg-red-500/10 border-red-500 text-red-400',
  'finalizado': 'bg-gray-500/10 border-gray-600 text-gray-400',
};

const EMPTY_FORM = {
  equipoLocal: '', equipoVisitante: '', fecha: '',
  descripcion: '', streamUrl: '', estado: 'programado',
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('partidos');
  const [partidos, setPartidos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Modal partido
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartido, setEditingPartido] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Confirmar eliminación
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchPartidos = useCallback(async () => {
    const res = await fetch('/api/partidos');
    const data = await res.json();
    if (data.success) setPartidos(data.partidos);
  }, []);

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setUsers(data.users);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    const decoded = parseJwt(token);
    if (!decoded || decoded.role !== 'admin') { router.push('/'); return; }
    setCurrentUserId(decoded.userId);
    Promise.all([fetchPartidos(), fetchUsers()]).finally(() => setLoading(false));
  }, [router, fetchPartidos, fetchUsers]);

  // ── PARTIDOS ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPartido(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (partido) => {
    setEditingPartido(partido);
    setForm({
      equipoLocal: partido.equipoLocal,
      equipoVisitante: partido.equipoVisitante,
      fecha: partido.fecha ? new Date(partido.fecha).toISOString().slice(0, 16) : '',
      descripcion: partido.descripcion || '',
      streamUrl: partido.streamUrl || '',
      estado: partido.estado,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.equipoLocal || !form.equipoVisitante || !form.fecha) {
      showToast('Equipos y fecha son obligatorios', 'error');
      return;
    }
    setSaving(true);
    const token = getToken();
    try {
      const res = editingPartido
        ? await fetch(`/api/admin/partidos/${editingPartido._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
          })
        : await fetch('/api/partidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (data.success) {
        showToast(editingPartido ? 'Partido actualizado' : 'Partido creado');
        setModalOpen(false);
        fetchPartidos();
      } else {
        showToast(data.error || 'Error guardando', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (partido, nuevoEstado) => {
    const token = getToken();
    const res = await fetch(`/api/admin/partidos/${partido._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    const data = await res.json();
    if (data.success) { showToast('Estado actualizado'); fetchPartidos(); }
  };

  const handleDeletePartido = async (id) => {
    const token = getToken();
    const res = await fetch(`/api/admin/partidos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      showToast('Partido eliminado');
      setConfirmDelete(null);
      fetchPartidos();
    } else {
      showToast(data.error || 'Error eliminando', 'error');
    }
  };

  // ── USUARIOS ──────────────────────────────────────────────────────
  const handleRoleChange = async (user, newRole) => {
    const token = getToken();
    const res = await fetch(`/api/admin/users/${user._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Rol de ${user.name} actualizado a ${newRole}`);
      fetchUsers();
    } else {
      showToast(data.error || 'Error actualizando rol', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    const token = getToken();
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      showToast('Usuario eliminado');
      setConfirmDeleteUser(null);
      fetchUsers();
    } else {
      showToast(data.error || 'Error eliminando usuario', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-px h-5 bg-gray-700" />
            <h1 className="text-lg font-bold">Panel de Administración</h1>
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{partidos.length} partidos</span>
            <span>·</span>
            <span>{users.length} usuarios</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit border border-gray-800">
          {[
            { id: 'partidos', label: 'Partidos', count: partidos.length },
            { id: 'usuarios', label: 'Usuarios', count: users.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">

        {/* TAB PARTIDOS */}
        {activeTab === 'partidos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gestión de Partidos</h2>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Partido
              </button>
            </div>

            {partidos.length === 0 ? (
              <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
                <p className="text-gray-500 mb-4">No hay partidos todavía</p>
                <button onClick={openCreate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition">
                  Crear el primero
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {partidos.map(partido => (
                  <div key={partido._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-white">
                            {partido.equipoLocal} <span className="text-gray-600 font-normal text-sm">vs</span> {partido.equipoVisitante}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${ESTADO_COLORS[partido.estado]}`}>
                            {partido.estado === 'en-directo' ? '● EN VIVO' : partido.estado?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(partido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {partido.streamUrl && <span className="ml-3 text-emerald-600">● Stream activo</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={partido.estado}
                          onChange={e => handleEstado(partido, e.target.value)}
                          className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="programado">Programado</option>
                          <option value="en-directo">En Directo</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                        <button onClick={() => openEdit(partido)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(partido)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB USUARIOS */}
        {activeTab === 'usuarios' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Gestión de Usuarios</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Usuario</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Rol</th>
                    <th className="text-left px-5 py-3">Registro</th>
                    <th className="text-right px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const isCurrentUser = user._id === currentUserId;
                    return (
                      <tr key={user._id} className={`hover:bg-gray-800/30 transition ${i < users.length - 1 ? 'border-b border-gray-800/50' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`}
                              alt="avatar"
                              className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700"
                            />
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              {isCurrentUser && <p className="text-xs text-amber-400">Tú</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-400">{user.email}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
                            user.role === 'admin'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-gray-700/50 border-gray-700 text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!isCurrentUser && (
                              <>
                                {/* Cambiar rol */}
                                <button
                                  onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                                  className={`px-3 py-1 text-xs rounded-lg border transition ${
                                    user.role === 'admin'
                                      ? 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                                      : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                  }`}
                                  title={user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                                >
                                  {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                                </button>

                                {/* Eliminar */}
                                <button
                                  onClick={() => setConfirmDeleteUser(user)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                  title="Eliminar usuario"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR PARTIDO */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
              <h3 className="font-bold text-white">{editingPartido ? 'Editar Partido' : 'Nuevo Partido'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Equipo Local *</label>
                  <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                    value={form.equipoLocal} onChange={e => setForm({ ...form, equipoLocal: e.target.value })} placeholder="Ej: Real Madrid" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Equipo Visitante *</label>
                  <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                    value={form.equipoVisitante} onChange={e => setForm({ ...form, equipoVisitante: e.target.value })} placeholder="Ej: Barcelona" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Fecha y Hora *</label>
                  <input type="datetime-local" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                    value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Estado</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition"
                    value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    <option value="programado">Programado</option>
                    <option value="en-directo">En Directo</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">URL del Stream (HLS)</label>
                <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition font-mono"
                  value={form.streamUrl} onChange={e => setForm({ ...form, streamUrl: e.target.value })} placeholder="https://ejemplo.com/stream.m3u8" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Descripción</label>
                <textarea className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none transition resize-none"
                  rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del partido..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
                {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingPartido ? 'Guardar cambios' : 'Crear partido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR PARTIDO */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-2">¿Eliminar partido?</h3>
            <p className="text-sm text-gray-400 mb-6">
              <span className="text-white">{confirmDelete.equipoLocal} vs {confirmDelete.equipoVisitante}</span>
              <br />Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Cancelar</button>
              <button onClick={() => handleDeletePartido(confirmDelete._id)} className="flex-1 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR USUARIO */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-2">¿Eliminar usuario?</h3>
            <p className="text-sm text-gray-400 mb-6">
              <span className="text-white">{confirmDeleteUser.name}</span> — {confirmDeleteUser.email}
              <br />Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteUser(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Cancelar</button>
              <button onClick={() => handleDeleteUser(confirmDeleteUser._id)} className="flex-1 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}