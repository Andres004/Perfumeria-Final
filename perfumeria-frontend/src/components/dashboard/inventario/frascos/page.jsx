import { useState, useEffect } from 'react';

const FrascosPage = () => {
  const [frascos, setFrascos] = useState([]);
  const [nuevoFrasco, setNuevoFrasco] = useState({ capacidad_ml: '', tipo: 'Estandar', stock: '', stock_minimo: '' });
  const [editandoFrascoId, setEditandoFrascoId] = useState(null);

  const cargarDatos = async () => {
    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/frascos');
      const data = await res.json();
      setFrascos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar frascos", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

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
  };

  const handleEliminarFrasco = async (id) => {
    if(!window.confirm('Confirmar eliminacion de envase.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/frascos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
          <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">{editandoFrascoId ? 'Editar Envase' : 'Registrar Envase'}</h2>
          <form onSubmit={handleGuardarFrasco} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Capacidad (ml)</label>
                <select required value={nuevoFrasco.capacidad_ml} onChange={e => { const cap = Number(e.target.value); let nuevoTipo = nuevoFrasco.tipo; if ((cap === 5 || cap === 10) && nuevoTipo === 'Premium') nuevoTipo = 'Estandar'; setNuevoFrasco({...nuevoFrasco, capacidad_ml: cap, tipo: nuevoTipo}); }} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none">
                  <option value="">Seleccionar</option><option value="5">5 ml</option><option value="10">10 ml</option><option value="30">30 ml</option><option value="50">50 ml</option><option value="100">100 ml</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Tipo</label>
                <select required value={nuevoFrasco.tipo} onChange={e => setNuevoFrasco({...nuevoFrasco, tipo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none">
                  <option value="Estandar">Estandar</option>{nuevoFrasco.capacidad_ml !== 5 && nuevoFrasco.capacidad_ml !== 10 && (<option value="Premium">Premium</option>)}
                </select>
              </div>
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
  );
};

export default FrascosPage;