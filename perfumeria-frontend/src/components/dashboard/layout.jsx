import { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import logotipo from '../../assets/logotipo.png'; 

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPassStatus({ loading: true, error: '', success: '' });
    if (passData.nueva !== passData.confirmar) return setPassStatus({ loading: false, error: 'Contraseñas no coinciden.', success: '' });
    if (passData.nueva.length < 6) return setPassStatus({ loading: false, error: 'Minimo 6 caracteres.', success: '' });
    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/usuarios/password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: localStorage.getItem('userId'), password_actual: passData.actual, password_nueva: passData.nueva })
      });
      const data = await res.json();
      if (res.ok) {
        setPassStatus({ loading: false, error: '', success: 'Contraseña actualizada.' });
        setTimeout(() => { setShowPasswordModal(false); setPassData({ actual: '', nueva: '', confirmar: '' }); setPassStatus({ loading: false, error: '', success: '' }); }, 2000);
      } else setPassStatus({ loading: false, error: data.error, success: '' });
    } catch (err) { setPassStatus({ loading: false, error: 'Error de conexion.', success: '' }); }
  };

  const tabs = [
    { path: '/dashboard', label: 'Resumen y Graficos', end: true },
    { path: '/dashboard/inventario', label: 'Bodega e Inventario' },
    { path: '/dashboard/ventas', label: 'Historial de Ventas' },
    { path: '/dashboard/vendedores', label: 'Gestion Vendedores' }
  ];

  return (
    <div className="min-h-screen bg-michova-black text-white font-sans relative" translate="no">
      <header className="bg-[#0a0a0a] border-b border-[#333] p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/*logo*/}
          <div className="flex items-center gap-3">
            <img 
              src={logotipo} 
              alt="Logo Michova" 
              className="h-15 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" 
            />
            <div>
              <h1 className="text-2xl font-bold text-michova-gold tracking-widest">MICHOVA ADMIN</h1>
              <p className="text-michova-silver tracking-widest uppercase text-xs mt-1">Hola, {localStorage.getItem('userName')}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={() => window.open('https://perfumeria-final-b.onrender.com/reporte-excel', '_blank')} className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold transition-colors">Descargar Excel</button>
            <button onClick={() => setShowPasswordModal(true)} className="text-gray-400 hover:text-white px-2 py-2 rounded text-sm font-bold transition-colors">Mi Cuenta</button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded text-sm font-bold transition-colors">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 border-b border-[#333] mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) => 
                `px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${
                  isActive 
                    ? 'border-michova-gold text-michova-gold bg-[#111]' 
                    : 'border-transparent text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <Outlet />

      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#333] rounded-lg p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#333] pb-4 mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white text-xl font-bold">X</button>
            </div>
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              {passStatus.error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded">{passStatus.error}</div>}
              {passStatus.success && <div className="bg-green-900/50 border border-green-500 text-green-200 text-sm p-3 rounded">{passStatus.success}</div>}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Actual</label>
                <input type="password" required value={passData.actual} onChange={e => setPassData({...passData, actual: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded focus:border-michova-gold outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nueva</label>
                <input type="password" required value={passData.nueva} onChange={e => setPassData({...passData, nueva: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded focus:border-michova-gold outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Confirmar</label>
                <input type="password" required value={passData.confirmar} onChange={e => setPassData({...passData, confirmar: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded focus:border-michova-gold outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={passStatus.loading} className="flex-1 bg-michova-gold text-michova-black font-bold py-3 rounded uppercase text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50">Actualizar</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="bg-[#333] text-white px-6 rounded font-bold uppercase text-sm hover:bg-[#444] transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;