import { useState, useEffect } from 'react';

const ProductosVariosPage = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '', stock_minimo: '' });
  const [editandoProductoId, setEditandoProductoId] = useState(null);

  const cargarDatos = async () => {
    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/productos');
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

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
  };

  const handleEliminarProducto = async (id) => {
    if(!window.confirm('Confirmar eliminacion de producto.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/productos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
          <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">{editandoProductoId ? 'Editar Producto' : 'Registrar Producto'}</h2>
          <form onSubmit={handleGuardarProducto} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Nombre del Producto</label>
              <input type="text" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="Caja de regalo..." />
            </div>
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
  );
};

export default ProductosVariosPage;