import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const [inventario, setInventario] = useState([]);
  const [frascos, setFrascos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [filtroTiempo, setFiltroTiempo] = useState('semanal');
  const [busquedaInventario, setBusquedaInventario] = useState('');

  const [nuevoPerfume, setNuevoPerfume] = useState({ nombre: '', stock_ml: '', stock_minimo: '', precio_por_ml: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoFrasco, setNuevoFrasco] = useState({ capacidad_ml: '', tipo: 'Estandar', stock: '', stock_minimo: '' });
  const [editandoFrascoId, setEditandoFrascoId] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '', stock_minimo: '' });
  const [editandoProductoId, setEditandoProductoId] = useState(null);
  const [nuevoVendedor, setNuevoVendedor] = useState({ nombre: '', email: '', password: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });

  const cargarDatos = async () => {
    try {
      const [resFrag, resVentas, resVend, resFrascos, resProd] = await Promise.all([
        fetch('https://perfumeria-final-b.onrender.com/fragancias'),
        fetch('https://perfumeria-final-b.onrender.com/ventas'),
        fetch('https://perfumeria-final-b.onrender.com/usuarios'),
        fetch('https://perfumeria-final-b.onrender.com/frascos'),
        fetch('https://perfumeria-final-b.onrender.com/productos')
      ]);
      
      const dataFrag = await resFrag.json();
      const dataVentas = await resVentas.json();
      const dataVend = await resVend.json();
      const dataFrascos = await resFrascos.json();
      const dataProd = await resProd.json();

      // Escudo anti-pantalla blanca: Verificamos que sean listas validas antes de guardarlas
      if (Array.isArray(dataFrag)) {
        dataFrag.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' }));
        setInventario(dataFrag);
      } else setInventario([]);

      setVentas(Array.isArray(dataVentas) ? dataVentas : []);
      setVendedores(Array.isArray(dataVend) ? dataVend : []);
      setFrascos(Array.isArray(dataFrascos) ? dataFrascos : []);
      setProductos(Array.isArray(dataProd) ? dataProd : []);

    } catch (error) {
      console.error("Error al cargar el dashboard", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const procesarDatosGrafico = () => {
    if (!Array.isArray(ventas)) return [];
    const hoy = new Date();
    let diasFiltro = filtroTiempo === 'diario' ? 1 : filtroTiempo === 'semanal' ? 7 : 30;
    const ventasFiltradas = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha_hora);
      return (hoy - fechaVenta) / (1000 * 60 * 60 * 24) <= diasFiltro;
    });
    const agrupado = ventasFiltradas.reduce((acc, v) => {
      const fecha = new Date(v.fecha_hora).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + Number(v.total);
      return acc;
    }, {});
    return Object.keys(agrupado).map(fecha => ({ fecha, total: agrupado[fecha] })).reverse(); 
  };

  const handleGuardarPerfume = async (e) => {
    e.preventDefault();
    const url = editandoId ? `https://perfumeria-final-b.onrender.com/fragancias/${editandoId}` : 'https://perfumeria-final-b.onrender.com/fragancias';
    const method = editandoId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoPerfume) });
    setNuevoPerfume({ nombre: '', stock_ml: '', stock_minimo: '', precio_por_ml: '' });
    setEditandoId(null);
    cargarDatos();
  };
  const handleEditarPerfume = (perfume) => {
    setEditandoId(perfume.id);
    setNuevoPerfume({ nombre: perfume.nombre, stock_ml: perfume.stock_ml, stock_minimo: perfume.stock_minimo, precio_por_ml: perfume.precio_por_ml });
    setActiveTab('inventario');
  };
  const handleEliminarPerfume = async (id) => {
    if(!window.confirm('Confirmar eliminacion de fragancia.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/fragancias/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const handleGuardarFrasco = async (e) => {
    e.preventDefault();
    const url = editandoFrascoId ? `https://perfumeria-final-b.onrender.com/frascos/${editandoFrascoId}` : 'https://perfumeria-final-b.onrender.com/frascos';
    const method = editandoFrascoId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoFrasco) });
      if (res.ok) {
        setNuevoFrasco({ capacidad_ml: '', tipo: 'Estandar', stock: '', stock_minimo: '' });
        setEditandoFrascoId(null);
        cargarDatos();
      }
    } catch (error) { alert("Error de conexion"); }
  };
  const handleEditarFrasco = (frasco) => {
    setEditandoFrascoId(frasco.id);
    setNuevoFrasco({ capacidad_ml: frasco.capacidad_ml, tipo: frasco.tipo, stock: frasco.stock, stock_minimo: frasco.stock_minimo });
    setActiveTab('inventario');
  };
  const handleEliminarFrasco = async (id) => {
    if(!window.confirm('Confirmar eliminacion de envase.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/frascos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    const url = editandoProductoId ? `https://perfumeria-final-b.onrender.com/productos/${editandoProductoId}` : 'https://perfumeria-final-b.onrender.com/productos';
    const method = editandoProductoId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoProducto) });
      if (res.ok) {
        setNuevoProducto({ nombre: '', precio: '', stock: '', stock_minimo: '' });
        setEditandoProductoId(null);
        cargarDatos();
      }
    } catch (error) { alert("Error de conexion"); }
  };
  const handleEditarProducto = (producto) => {
    setEditandoProductoId(producto.id);
    setNuevoProducto({ nombre: producto.nombre, precio: producto.precio, stock: producto.stock, stock_minimo: producto.stock_minimo });
    setActiveTab('inventario');
  };
  const handleEliminarProducto = async (id) => {
    if(!window.confirm('Confirmar eliminacion de producto.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/productos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const handleCrearVendedor = async (e) => {
    e.preventDefault();
    const res = await fetch('https://perfumeria-final-b.onrender.com/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...nuevoVendedor, rol: 'vendedor' }) });
    if (res.ok) {
      alert('Vendedor registrado'); setNuevoVendedor({ nombre: '', email: '', password: '' }); cargarDatos();
    } else {
      const data = await res.json(); alert(`Error: ${data.error}`);
    }
  };
  const handleQuitarAccesoVendedor = async (id) => {
    if(!window.confirm('Quitar acceso permanentemente a este usuario.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/usuarios/${id}`, { method: 'DELETE' }); cargarDatos();
  };
  const handleEliminarVentaSola = async (id) => {
    if (!window.confirm('Confirmar eliminacion de venta.')) return;
    const res = await fetch(`https://perfumeria-final-b.onrender.com/ventas/${id}`, { method: 'DELETE' });
    if (res.ok) { alert('Venta eliminada y stock devuelto.'); cargarDatos(); }
  };
  const handleBorrarHistorialVentas = async () => {
    if (!window.confirm('ADVERTENCIA: Se borrara todo el historial de ventas.')) return;
    const res = await fetch('https://perfumeria-final-b.onrender.com/ventas', { method: 'DELETE' });
    if (res.ok) { alert('Historial borrado.'); cargarDatos(); }
  };

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

  const alertasFragancias = inventario.filter(i => i.stock_ml <= i.stock_minimo).length;
  const alertasFrascos = frascos.filter(f => f.stock <= f.stock_minimo).length;
  const alertasProductos = productos.filter(p => p.stock <= p.stock_minimo).length;
  const totalAlertas = alertasFragancias + alertasFrascos + alertasProductos;
  const inventarioFiltrado = inventario.filter(item => item.nombre.toLowerCase().includes(busquedaInventario.toLowerCase()));

  return (
    <div className="min-h-screen bg-michova-black text-white font-sans relative" translate="no">
      <header className="bg-[#0a0a0a] border-b border-[#333] p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-michova-gold tracking-widest">MICHOVA ADMIN</h1>
            <p className="text-michova-silver tracking-widest uppercase text-xs mt-1">Hola, {localStorage.getItem('userName')}</p>
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
          {[{ id: 'resumen', label: 'Resumen y Graficos' }, { id: 'inventario', label: 'Bodega e Inventario' }, { id: 'ventas', label: 'Historial de Ventas' }, { id: 'vendedores', label: 'Gestion Vendedores' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${activeTab === tab.id ? 'border-michova-gold text-michova-gold bg-[#111]' : 'border-transparent text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-michova-gold shadow-md">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Recaudado (Historico)</p>
                <p className="text-3xl font-bold mt-2">Bs. {ventas.reduce((acc, v) => acc + Number(v.total), 0)}</p>
              </div>
              <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-red-500 shadow-md">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Alertas de Stock</p>
                <p className="text-3xl font-bold mt-2 text-white">{totalAlertas} <span className="text-sm font-normal text-gray-500">criticos</span></p>
              </div>
              <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-blue-500 shadow-md">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Vendedores Activos</p>
                <p className="text-3xl font-bold mt-2">{vendedores.length}</p>
              </div>
            </div>
            <div className="bg-[#111] border border-[#333] p-6 rounded shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-michova-silver font-bold uppercase tracking-wider">Curva de Ingresos</h2>
                <select value={filtroTiempo} onChange={(e) => setFiltroTiempo(e.target.value)} className="bg-[#1a1a1a] text-white border border-[#333] p-2 rounded text-sm focus:border-michova-gold outline-none">
                  <option value="diario">Hoy</option><option value="semanal">Ultimos 7 Dias</option><option value="mensual">Ultimo Mes</option>
                </select>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={procesarDatosGrafico()}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="fecha" stroke="#888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Bs${value}`} /><Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#FFD700', fontWeight: 'bold' }} /><Line type="monotone" dataKey="total" name="Ingresos" stroke="#FFD700" strokeWidth={3} dot={{ r: 4, fill: '#FFD700', strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 6 }} /></LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventario' && (
          <div className="space-y-12 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-michova-gold mb-6 uppercase tracking-wider border-b border-[#333] pb-2">Inventario de Fragancias</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
                  <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">{editandoId ? 'Editar Fragancia' : 'Registrar Fragancia'}</h2>
                  <form onSubmit={handleGuardarPerfume} className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase">Nombre</label>
                        <input type="text" required value={nuevoPerfume.nombre} onChange={e => setNuevoPerfume({...nuevoPerfume, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase">Precio por ml (Bs.)</label>
                      <input type="text" inputMode="decimal" required value={nuevoPerfume.precio_por_ml} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setNuevoPerfume({...nuevoPerfume, precio_por_ml: val.replace(/^0+(?=\d)/, '') || 0}); } }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Stock Actual (ml)</label>
                        <input type="number" min="0" required value={nuevoPerfume.stock_ml} onChange={e => setNuevoPerfume({...nuevoPerfume, stock_ml: e.target.value.replace(/^0+(?=\d)/, '') || 0})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Alerta Minima (ml)</label>
                        <input type="number" min="0" required value={nuevoPerfume.stock_minimo} onChange={e => setNuevoPerfume({...nuevoPerfume, stock_minimo: e.target.value.replace(/^0+(?=\d)/, '') || 0})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4"><button type="submit" className="flex-1 bg-michova-gold text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors uppercase text-sm">{editandoId ? 'Actualizar' : 'Guardar'}</button>{editandoId && <button type="button" onClick={() => { setEditandoId(null); setNuevoPerfume({nombre:'', stock_ml:'', stock_minimo:'', precio_por_ml:''}); }} className="bg-[#333] text-white px-4 rounded hover:bg-[#444] text-sm font-bold uppercase">Cancelar</button>}</div>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
                  <div className="p-4 border-b border-[#333] bg-[#0a0a0a] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h2 className="text-michova-silver font-bold uppercase tracking-wider">Inventario Actual</h2>
                    <input type="text" placeholder="Buscar fragancia..." value={busquedaInventario} onChange={(e) => setBusquedaInventario(e.target.value)} className="bg-[#1a1a1a] border border-[#333] text-white px-4 py-2 rounded text-sm focus:border-michova-gold outline-none w-full md:w-64" />
                  </div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0"><tr><th className="p-4 font-bold uppercase tracking-wider">Fragancia</th><th className="p-4 font-bold uppercase tracking-wider">Precio x ml</th><th className="p-4 font-bold uppercase tracking-wider">Stock Restante</th><th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th></tr></thead>
                      <tbody className="divide-y divide-[#222]">
                        {inventarioFiltrado.map(item => (
                          <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors"><td className="p-4 font-bold text-white">{item.nombre}</td><td className="p-4 text-michova-gold font-bold">Bs. {item.precio_por_ml}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.stock_ml <= item.stock_minimo ? 'bg-red-900/50 text-red-400 border border-red-800' : 'text-gray-300'}`}>{item.stock_ml} ml</span></td><td className="p-4 text-right space-x-3"><button onClick={() => handleEditarPerfume(item)} className="text-blue-400 hover:text-blue-300 uppercase text-xs font-bold">Editar</button><button onClick={() => handleEliminarPerfume(item.id)} className="text-red-500 hover:text-red-400 uppercase text-xs font-bold">Borrar</button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-michova-gold mb-6 uppercase tracking-wider border-b border-[#333] pb-2">Inventario de Frascos</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
                  <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">{editandoFrascoId ? 'Editar Envase' : 'Registrar Envase'}</h2>
                  <form onSubmit={handleGuardarFrasco} className="space-y-4">
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Capacidad (ml)</label><select required value={nuevoFrasco.capacidad_ml} onChange={e => { const cap = Number(e.target.value); let nuevoTipo = nuevoFrasco.tipo; if ((cap === 5 || cap === 10) && nuevoTipo === 'Premium') nuevoTipo = 'Estandar'; setNuevoFrasco({...nuevoFrasco, capacidad_ml: cap, tipo: nuevoTipo}); }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none"><option value="">Seleccionar</option><option value="5">5 ml</option><option value="10">10 ml</option><option value="30">30 ml</option><option value="50">50 ml</option><option value="100">100 ml</option></select></div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Tipo</label><select required value={nuevoFrasco.tipo} onChange={e => setNuevoFrasco({...nuevoFrasco, tipo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none"><option value="Estandar">Estandar</option>{nuevoFrasco.capacidad_ml !== 5 && nuevoFrasco.capacidad_ml !== 10 && (<option value="Premium">Premium</option>)}</select></div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Stock Actual</label>
                        <input type="text" inputMode="decimal" required value={nuevoFrasco.stock} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setNuevoFrasco({...nuevoFrasco, stock: val.replace(/^0+(?=\d)/, '') || 0}); } }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Alerta Minima</label>
                        <input type="text" inputMode="decimal" required value={nuevoFrasco.stock_minimo} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setNuevoFrasco({...nuevoFrasco, stock_minimo: val.replace(/^0+(?=\d)/, '') || 0}); } }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4"><button type="submit" className="flex-1 bg-michova-gold text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors uppercase text-sm">{editandoFrascoId ? 'Actualizar' : 'Guardar'}</button>{editandoFrascoId && <button type="button" onClick={() => { setEditandoFrascoId(null); setNuevoFrasco({capacidad_ml: '', tipo: 'Estandar', stock: '', stock_minimo: ''}); }} className="bg-[#333] text-white px-4 rounded hover:bg-[#444] text-sm font-bold uppercase">Cancelar</button>}</div>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
                  <div className="p-4 border-b border-[#333] bg-[#0a0a0a]"><h2 className="text-michova-silver font-bold uppercase tracking-wider">Inventario Actual de Frascos</h2></div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0"><tr><th className="p-4 font-bold uppercase tracking-wider">Envase</th><th className="p-4 font-bold uppercase tracking-wider">Stock Restante</th><th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th></tr></thead>
                      <tbody className="divide-y divide-[#222]">
                        {frascos.map(item => (
                          <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors"><td className="p-4 font-bold text-white">{item.capacidad_ml} ml - {item.tipo}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.stock <= item.stock_minimo ? 'bg-red-900/50 text-red-400 border border-red-800' : 'text-gray-300'}`}>{item.stock} unidades</span></td><td className="p-4 text-right space-x-3"><button onClick={() => handleEditarFrasco(item)} className="text-blue-400 hover:text-blue-300 uppercase text-xs font-bold">Editar</button><button onClick={() => handleEliminarFrasco(item.id)} className="text-red-500 hover:text-red-400 uppercase text-xs font-bold">Borrar</button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-michova-gold mb-6 uppercase tracking-wider border-b border-[#333] pb-2">Inventario Productos Varios</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
                  <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">{editandoProductoId ? 'Editar Producto' : 'Registrar Producto'}</h2>
                  <form onSubmit={handleGuardarProducto} className="space-y-4">
                    <div><label className="text-xs text-gray-400 font-bold uppercase">Nombre del Producto</label><input type="text" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="Caja de regalo..." /></div>
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase">Precio Unitario (Bs.)</label>
                      <input type="text" inputMode="decimal" required value={nuevoProducto.precio} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setNuevoProducto({...nuevoProducto, precio: val.replace(/^0+(?=\d)/, '') || 0}); } }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Stock Actual</label>
                        <input type="text" inputMode="decimal" required value={nuevoProducto.stock} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setNuevoProducto({...nuevoProducto, stock: val.replace(/^0+(?=\d)/, '') || 0}); } }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 font-bold uppercase">Alerta Minima</label>
                        <input type="text" inputMode="decimal" required value={nuevoProducto.stock_minimo} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setNuevoProducto({...nuevoProducto, stock_minimo: val.replace(/^0+(?=\d)/, '') || 0}); } }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4"><button type="submit" className="flex-1 bg-michova-gold text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors uppercase text-sm">{editandoProductoId ? 'Actualizar' : 'Guardar'}</button>{editandoProductoId && <button type="button" onClick={() => { setEditandoProductoId(null); setNuevoProducto({nombre: '', precio: '', stock: '', stock_minimo: ''}); }} className="bg-[#333] text-white px-4 rounded hover:bg-[#444] text-sm font-bold uppercase">Cancelar</button>}</div>
                  </form>
                </div>
                <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
                  <div className="p-4 border-b border-[#333] bg-[#0a0a0a]"><h2 className="text-michova-silver font-bold uppercase tracking-wider">Inventario Actual de Productos</h2></div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0"><tr><th className="p-4 font-bold uppercase tracking-wider">Producto</th><th className="p-4 font-bold uppercase tracking-wider">Precio</th><th className="p-4 font-bold uppercase tracking-wider">Stock</th><th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th></tr></thead>
                      <tbody className="divide-y divide-[#222]">
                        {productos.map(item => (
                          <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors"><td className="p-4 font-bold text-white">{item.nombre}</td><td className="p-4 text-michova-gold font-bold">Bs. {item.precio}</td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.stock <= item.stock_minimo ? 'bg-red-900/50 text-red-400 border border-red-800' : 'text-gray-300'}`}>{item.stock} unidades</span></td><td className="p-4 text-right space-x-3"><button onClick={() => handleEditarProducto(item)} className="text-blue-400 hover:text-blue-300 uppercase text-xs font-bold">Editar</button><button onClick={() => handleEliminarProducto(item.id)} className="text-red-500 hover:text-red-400 uppercase text-xs font-bold">Borrar</button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'ventas' && (
          <div className="bg-[#111] border border-[#333] rounded overflow-hidden animate-fade-in shadow-md">
            <div className="p-4 border-b border-[#333] bg-[#0a0a0a] flex justify-between items-center">
              <div><h2 className="text-michova-silver font-bold uppercase tracking-wider">Todas las transacciones</h2><span className="text-xs text-gray-500">Total Registros: {ventas.length}</span></div>
              <button onClick={handleBorrarHistorialVentas} className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 px-4 py-2 rounded text-xs font-bold uppercase transition-colors">Borrar Todo El Historial</button>
            </div>
            <div className="overflow-x-auto max-h-[700px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0 z-10"><tr><th className="p-4 font-bold uppercase tracking-wider">Fecha / Hora</th><th className="p-4 font-bold uppercase tracking-wider">Vendedor</th><th className="p-4 font-bold uppercase tracking-wider">Detalle</th><th className="p-4 font-bold uppercase tracking-wider">Pago</th><th className="p-4 font-bold uppercase tracking-wider text-right">Total / Accion</th></tr></thead>
                <tbody className="divide-y divide-[#222]">
                  {ventas.map(v => {
                    const detalle = v.detalle_ventas?.[0];
                    const articulo = detalle?.fragancias?.nombre || detalle?.productos?.nombre;
                    const cantidad = detalle?.tamaño_ml || detalle?.cantidad;
                    return (
                      <tr key={v.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-4 text-gray-300 whitespace-nowrap">{new Date(v.fecha_hora).toLocaleDateString('es-BO')} <br/><span className="text-xs text-gray-500">{new Date(v.fecha_hora).toLocaleTimeString('es-BO')}</span></td>
                        <td className="p-4"><span className="bg-[#222] px-2 py-1 rounded text-xs text-michova-silver border border-[#333]">{v.usuarios?.nombre || 'Admin'}</span></td>
                        <td className="p-4"><p className="font-bold text-white">{articulo}</p><p className="text-xs text-gray-500">{cantidad} {detalle?.tamaño_ml ? 'ml' : 'unid.'} - {detalle?.tipo_frasco}</p></td>
                        <td className="p-4 text-gray-300">{v.metodo_pago}</td>
                        <td className="p-4 text-right flex flex-col items-end gap-2"><span className="font-bold text-michova-gold text-lg">Bs. {v.total}</span><button onClick={() => handleEliminarVentaSola(v.id)} className="text-xs text-red-500 hover:text-red-400 uppercase font-bold transition-colors">Anular Venta</button></td>
                      </tr>
                    );
                  })}
                  {ventas.length === 0 && (<tr><td colSpan="5" className="p-6 text-center text-gray-500 italic">No hay ventas registradas.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vendedores' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
              <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">Dar de Alta Empleado</h2>
              <form onSubmit={handleCrearVendedor} className="space-y-4">
                <div><label className="text-xs text-gray-400 font-bold uppercase">Nombre Completo</label><input type="text" required value={nuevoVendedor.nombre} onChange={e => setNuevoVendedor({...nuevoVendedor, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="Ej: Juan Perez" /></div>
                <div><label className="text-xs text-gray-400 font-bold uppercase">Correo (Login)</label><input type="email" required value={nuevoVendedor.email} onChange={e => setNuevoVendedor({...nuevoVendedor, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="juan@michova.com" /></div>
                <div><label className="text-xs text-gray-400 font-bold uppercase">Contraseña Temporal</label><input type="password" required value={nuevoVendedor.password} onChange={e => setNuevoVendedor({...nuevoVendedor, password: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" /></div>
                <button type="submit" className="w-full bg-michova-silver text-black font-bold py-3 rounded mt-4 hover:bg-white transition-colors uppercase text-sm">Registrar Vendedor</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
               <div className="p-4 border-b border-[#333] bg-[#0a0a0a]"><h2 className="text-michova-silver font-bold uppercase tracking-wider">Personal Autorizado</h2></div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendedores.map(v => (
                  <div key={v.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded flex justify-between items-center group">
                    <div><p className="font-bold text-white text-lg">{v.nombre}</p><p className="text-sm text-gray-400">{v.email}</p><p className="text-xs text-michova-gold mt-1">Registrado: {new Date(v.creado_en).toLocaleDateString('es-BO')}</p></div>
                    <button onClick={() => handleQuitarAccesoVendedor(v.id)} className="bg-[#222] group-hover:bg-red-900 group-hover:text-white text-gray-500 px-3 py-1 rounded font-bold transition-colors uppercase text-xs">Revocar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
export default Dashboard;