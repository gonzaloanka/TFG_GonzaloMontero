'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      alert('Cuenta creada correctamente');
      router.push('/login');
    } else {
      const errorData = await res.json();
      alert(`Error: ${errorData.error || 'Revisa los datos'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative">
      
      {}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition group">
        <div className="p-2 bg-gray-900 rounded-full group-hover:bg-gray-800 transition border border-gray-800">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </div>
        <span className="font-medium text-sm hidden md:block">Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-emerald-500">StreamFútbol</h1>
           <p className="text-gray-400 mt-2">Crea tu cuenta gratuita</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">Nombre</label>
            <input 
              type="text" 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-emerald-500 outline-none transition"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-gray-400">Email</label>
            <input 
              type="email" 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-emerald-500 outline-none transition"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-emerald-500 outline-none transition"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition transform hover:scale-[1.02]">
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <Link href="/login" className="text-emerald-500 hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
