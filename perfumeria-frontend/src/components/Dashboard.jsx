import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('resumen');
  const [inventario, setInventario] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  
  const [filtroTiempo, setFiltroTiempo] = useState('semanal');
  
  const [nuevoPerfume, setNuevoPerfume] = useState({ nombre: '', stock_ml: '', stock_minimo: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoVendedor, setNuevoVendedor] = useState({ nombre: '', email: '', password: '' });

  const cargarDatos = async () => {
    try {
      const [resFragancias, resVentas, resVendedores] = await Promise.all([
        fetch('https://perfumeria-final-b.onrender.com/fragancias'),
        fetch('https://perfumeria-final-b.onrender.com/ventas'),
        fetch('https://perfumeria-final-b.onrender.com/usuarios')
      ]);
      setInventario(await resFragancias.json());
      setVentas(await resVentas.json());
      setVendedores(await resVendedores.json());
    } catch (error) {
      console.error("Error al cargar el dashboard", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const procesarDatosGrafico = () => {
    if (!Array.isArray(ventas)) return [];
    const hoy = new Date();
    let diasFiltro = filtroTiempo === 'diario' ? 1 : filtroTiempo === 'semanal' ? 7 : 30;

    const ventasFiltradas = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha_hora);
      const diferenciaDias = (hoy - fechaVenta) / (1000 * 60 * 60 * 24);
      return diferenciaDias <= diasFiltro;
    });

    const agrupado = ventasFiltradas.reduce((acc, v) => {
      const fecha = new Date(v.fecha_hora).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + Number(v.total);
      return acc;
    }, {});

    return Object.keys(agrupado)
      .map(fecha => ({ fecha, total: agrupado[fecha] }))
      .reverse(); 
  };

  const handleGuardarPerfume = async (e) => {
    e.preventDefault();
    const url = editandoId ? `https://perfumeria-final-b.onrender.com/fragancias/${editandoId}` : 'https://perfumeria-final-b.onrender.com/fragancias';
    const method = editandoId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoPerfume)
    });
    
    setNuevoPerfume({ nombre: '', stock_ml: '', stock_minimo: '' });
    setEditandoId(null);
    cargarDatos();
  };

  const handleEditarPerfume = (perfume) => {
    setEditandoId(perfume.id);
    setNuevoPerfume({
      nombre: perfume.nombre,
      stock_ml: perfume.stock_ml,
      stock_minimo: perfume.stock_minimo
    });
    setActiveTab('inventario');
  };

  const handleEliminarPerfume = async (id) => {
    if(!window.confirm('¿Estás seguro de eliminar esta fragancia del sistema?')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/fragancias/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const handleCrearVendedor = async (e) => {
    e.preventDefault();
    const res = await fetch('https://perfumeria-final-b.onrender.com/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevoVendedor, rol: 'vendedor' })
    });
    
    if (res.ok) {
      alert('Vendedor registrado exitosamente');
      setNuevoVendedor({ nombre: '', email: '', password: '' });
      cargarDatos();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  };

  const handleQuitarAccesoVendedor = async (id) => {
    if(!window.confirm('🚨 ¿Quitar acceso a este vendedor permanentemente?')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/usuarios/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const handleBorrarHistorialVentas = async () => {
    const seguro = window.confirm('🚨 ADVERTENCIA: Estás a punto de BORRAR TODAS LAS VENTAS del sistema permanentemente. ¿Estás absolutamente seguro?');
    if (!seguro) return;

    const res = await fetch('https://perfumeria-final-b.onrender.com/ventas', { method: 'DELETE' });
    if (res.ok) {
      alert('Historial borrado por completo.');
      cargarDatos(); 
    } else {
      alert('Error al intentar borrar el historial.');
    }
  };

  return (
    <div className="min-h-screen bg-michova-black text-white font-sans" translate="no">
      <header className="bg-[#0a0a0a] border-b border-[#333] p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-michova-gold tracking-widest">MICHOVA ADMIN</h1>
            <p className="text-michova-silver tracking-widest uppercase text-xs mt-1">
              Hola, {localStorage.getItem('userName')}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.open('https://perfumeria-final-b.onrender.com/reporte-excel', '_blank')} 
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <span>📊</span> Descargar Excel
            </button>
            <button 
              onClick={() => { localStorage.clear(); navigate('/'); }} 
              className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded text-sm font-bold transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 border-b border-[#333] mb-8 overflow-x-auto">
          {[
            { id: 'resumen', label: 'Resumen & Gráficos' },
            { id: 'inventario', label: 'Bodega & Inventario' },
            { id: 'ventas', label: 'Historial de Ventas' },
            { id: 'vendedores', label: 'Gestión Vendedores' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-michova-gold text-michova-gold bg-[#111]' 
                  : 'border-transparent text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-michova-gold shadow-md">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Recaudado (Histórico)</p>
                <p className="text-3xl font-bold mt-2">Bs. {ventas.reduce((acc, v) => acc + Number(v.total), 0)}</p>
              </div>
              <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-red-500 shadow-md">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Alertas de Stock</p>
                <p className="text-3xl font-bold mt-2 text-white">
                  {inventario.filter(i => i.stock_ml <= i.stock_minimo).length} <span className="text-sm font-normal text-gray-500">críticos</span>
                </p>
              </div>
              <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-blue-500 shadow-md">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Vendedores Activos</p>
                <p className="text-3xl font-bold mt-2">{vendedores.length}</p>
              </div>
            </div>

            <div className="bg-[#111] border border-[#333] p-6 rounded shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-michova-silver font-bold uppercase tracking-wider">Curva de Ingresos</h2>
                <select 
                  value={filtroTiempo} 
                  onChange={(e) => setFiltroTiempo(e.target.value)}
                  className="bg-[#1a1a1a] text-white border border-[#333] p-2 rounded text-sm focus:border-michova-gold outline-none"
                >
                  <option value="diario">Hoy</option>
                  <option value="semanal">Últimos 7 Días</option>
                  <option value="mensual">Último Mes</option>
                </select>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={procesarDatosGrafico()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="fecha" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Bs${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#FFD700', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="total" name="Ingresos" stroke="#FFD700" strokeWidth={3} dot={{ r: 4, fill: '#FFD700', strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventario' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
              <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">
                {editandoId ? '✏️ Editar Fragancia' : '➕ Registrar Fragancia'}
              </h2>
              <form onSubmit={handleGuardarPerfume} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase">Nombre de Fragancia</label>
                  <input type="text" required value={nuevoPerfume.nombre} onChange={e => setNuevoPerfume({...nuevoPerfume, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 font-bold uppercase">Stock Actual (ml)</label>
                    <input type="number" required value={nuevoPerfume.stock_ml} onChange={e => setNuevoPerfume({...nuevoPerfume, stock_ml: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 font-bold uppercase">Alerta Mínima (ml)</label>
                    <input type="number" required value={nuevoPerfume.stock_minimo} onChange={e => setNuevoPerfume({...nuevoPerfume, stock_minimo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 bg-michova-gold text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors uppercase text-sm">
                    {editandoId ? 'Actualizar' : 'Guardar'}
                  </button>
                  {editandoId && (
                    <button type="button" onClick={() => { setEditandoId(null); setNuevoPerfume({nombre:'', stock_ml:'', stock_minimo:''}); }} className="bg-[#333] text-white px-4 rounded hover:bg-[#444] text-sm font-bold uppercase">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
              <div className="p-4 border-b border-[#333] bg-[#0a0a0a]">
                <h2 className="text-michova-silver font-bold uppercase tracking-wider">Inventario Actual</h2>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-4 font-bold uppercase tracking-wider">Fragancia</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Stock Restante</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {inventario.map(item => (
                      <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-4 font-bold text-white">{item.nombre}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock_ml <= item.stock_minimo ? 'bg-red-900/50 text-red-400 border border-red-800' : 'text-gray-300'}`}>
                            {item.stock_ml} ml
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-3">
                          <button onClick={() => handleEditarPerfume(item)} className="text-blue-400 hover:text-blue-300 uppercase text-xs font-bold">Editar</button>
                          <button onClick={() => handleEliminarPerfume(item.id)} className="text-red-500 hover:text-red-400 uppercase text-xs font-bold">Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="bg-[#111] border border-[#333] rounded overflow-hidden animate-fade-in shadow-md">
            <div className="p-4 border-b border-[#333] bg-[#0a0a0a] flex justify-between items-center">
              <div>
                <h2 className="text-michova-silver font-bold uppercase tracking-wider">Todas las transacciones</h2>
                <span className="text-xs text-gray-500">Total Registros: {ventas.length}</span>
              </div>
              <button 
                onClick={handleBorrarHistorialVentas}
                className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 px-4 py-2 rounded text-xs font-bold uppercase transition-colors"
              >
                🗑️ Borrar Historial
              </button>
            </div>
            <div className="overflow-x-auto max-h-[700px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0">
                  <tr>
                    <th className="p-4 font-bold uppercase tracking-wider">Fecha / Hora</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Vendedor</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Detalle de Preparación</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Pago</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {ventas.map(v => {
                    const detalle = v.detalle_ventas?.[0];
                    return (
                      <tr key={v.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-4 text-gray-300 whitespace-nowrap">
                          {new Date(v.fecha_hora).toLocaleDateString('es-BO')} <br/>
                          <span className="text-xs text-gray-500">{new Date(v.fecha_hora).toLocaleTimeString('es-BO')}</span>
                        </td>
                        <td className="p-4">
                          <span className="bg-[#222] px-2 py-1 rounded text-xs text-michova-silver border border-[#333]">
                            {v.usuarios?.nombre || 'Admin'}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-white">{detalle?.fragancias?.nombre}</p>
                          <p className="text-xs text-gray-500">{detalle?.tamaño_ml}ml • Frasco {detalle?.tipo_frasco}</p>
                        </td>
                        <td className="p-4 text-gray-300">{v.metodo_pago}</td>
                        <td className="p-4 text-right font-bold text-michova-gold text-lg">Bs. {v.total}</td>
                      </tr>
                    );
                  })}
                  {ventas.length === 0 && (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-500 italic">No hay ventas registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vendedores' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
              <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">
                Dar de Alta Empleado
              </h2>
              <form onSubmit={handleCrearVendedor} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase">Nombre Completo</label>
                  <input type="text" required value={nuevoVendedor.nombre} onChange={e => setNuevoVendedor({...nuevoVendedor, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="Ej: Juan Perez" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase">Correo (Login)</label>
                  <input type="email" required value={nuevoVendedor.email} onChange={e => setNuevoVendedor({...nuevoVendedor, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="juan@michova.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase">Contraseña Temporal</label>
                  <input type="password" required value={nuevoVendedor.password} onChange={e => setNuevoVendedor({...nuevoVendedor, password: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                </div>
                <button type="submit" className="w-full bg-michova-silver text-black font-bold py-3 rounded mt-4 hover:bg-white transition-colors uppercase text-sm">
                  Registrar Vendedor
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
               <div className="p-4 border-b border-[#333] bg-[#0a0a0a]">
                <h2 className="text-michova-silver font-bold uppercase tracking-wider">Personal Autorizado</h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendedores.map(v => (
                  <div key={v.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-white text-lg">{v.nombre}</p>
                      <p className="text-sm text-gray-400">{v.email}</p>
                      <p className="text-xs text-michova-gold mt-1">Registrado: {new Date(v.creado_en).toLocaleDateString('es-BO')}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleQuitarAccesoVendedor(v.id)}
                      className="bg-[#222] group-hover:bg-red-900 group-hover:text-white text-gray-500 p-3 rounded-full transition-colors"
                      title="Revocar Acceso"
                    >
                      
                    </button>
                  </div>
                ))}
                {vendedores.length === 0 && <p className="text-gray-500 italic p-4">No hay vendedores registrados aún.</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;