'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function parseJwt (token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUser({ 
            name: decoded.name || decoded.email || 'Usuario', 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${decoded.id || 'default'}` 
        });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.reload(); 
  };

  if (!mounted) return null;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 group relative cursor-pointer py-2">
           <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
           </div>
           
           <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-gray-700 group-hover:border-emerald-500 transition shadow-lg bg-gray-800"
           />
          
          {}
          <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
            <div className="py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Cerrar Sesión
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
        Iniciar Sesión
      </Link>
      <Link href="/register" className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 flex items-center gap-2">
        <span>Registrarse</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      </Link>
    </div>
  );
}
