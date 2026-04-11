import { useState, useEffect } from 'react';

const FraganciasPage = () => {
  const [inventario, setInventario] = useState([]);
  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [nuevoPerfume, setNuevoPerfume] = useState({ nombre: '', stock_ml: '', stock_minimo: '', precio_por_ml: '' });
  const [editandoId, setEditandoId] = useState(null);

  const cargarDatos = async () => {
    try {
      const resFrag = await fetch('https://perfumeria-final-b.onrender.com/fragancias');
      const dataFrag = await resFrag.json();

      if (Array.isArray(dataFrag)) {
        dataFrag.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' }));
        setInventario(dataFrag);
      } else setInventario([]);

    } catch (error) {
      console.error("Error al cargar fragancias", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

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
  };
  
  const handleEliminarPerfume = async (id) => {
    if(!window.confirm('Confirmar eliminacion de fragancia.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/fragancias/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const inventarioFiltrado = inventario.filter(item => item.nombre.toLowerCase().includes(busquedaInventario.toLowerCase()));

  return (
    <div className="animate-fade-in">
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
  );
};

export default FraganciasPage;