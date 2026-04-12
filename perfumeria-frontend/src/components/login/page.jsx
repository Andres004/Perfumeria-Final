import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logotipo from '../../assets/logotipo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', data.usuario.rol);
        localStorage.setItem('userId', data.usuario.id);
        localStorage.setItem('userName', data.usuario.nombre);
        
        if (data.usuario.rol === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/venta');
        }
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-michova-black flex items-center justify-center px-4 font-sans relative overflow-hidden" translate="no">
      
      {/* MARCA DE AGUA (Cubre toda la pantalla sin cortar esquinas) */}
      <div 
        className="absolute z-0 opacity-6 pointer-events-none w-[200vw] h-[200vh] top-1/2 left-1/2" 
        style={{ 
          backgroundImage: `url(${logotipo})`, 
          backgroundSize: '250px', 
          transform: 'translate(-50%, -50%) rotate(-30deg)' 
        }}
      ></div>
      
      <div className="max-w-md w-full bg-[#111111] rounded-lg shadow-2xl p-8 border border-[#333333] z-10 animate-fade-in relative backdrop-blur-sm bg-opacity-90">
        

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-michova-gold tracking-wider drop-shadow-md">
            MICHOVA
          </h1>
          <p className="text-michova-silver text-xs tracking-[0.3em] uppercase mt-1">
            Sistema de Gestión
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-michova-silver text-sm font-medium mb-2 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white border border-[#333333] rounded px-4 py-3 focus:outline-none focus:border-michova-gold transition-colors"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-michova-silver text-sm font-medium mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white border border-[#333333] rounded px-4 py-3 pr-12 focus:outline-none focus:border-michova-gold transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-michova-gold transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-michova-gold text-michova-black font-bold py-3 px-4 rounded hover:bg-yellow-400 transition-colors mt-6 shadow-[0_0_15px_rgba(255,215,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="text-center text-[#555] text-xs mt-8">
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
};

export default Login;