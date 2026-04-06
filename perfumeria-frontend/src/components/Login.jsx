import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-michova-black flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-[#111111] rounded-lg shadow-2xl p-8 border border-[#333333]">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-michova-gold tracking-wider mb-2">
            MICHOVA
          </h1>
          <p className="text-michova-silver text-xs tracking-[0.3em] uppercase">
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] text-white border border-[#333333] rounded px-4 py-3 focus:outline-none focus:border-michova-gold transition-colors"
              placeholder="••••••••"
              required
            />
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