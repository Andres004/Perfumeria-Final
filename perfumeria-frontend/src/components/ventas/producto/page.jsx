import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const VentaProductoPage = () => {
  const { agregarAlCarrito } = useOutletContext();
  const [productosVarios, setProductosVarios] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [descuentoManual, setDescuentoManual] = useState(0);

  useEffect(() => {
    fetch('https://perfumeria-final-b.onrender.com/productos')
      .then(res => res.json()).then(data => {
        setProductosVarios(Array.isArray(data) ? data : []);
      }).catch(err => console.error("Error:", err));
  }, []);

  const calcularTotal = () => {
    let total = 0;
    const prodSelect = productosVarios.find(p => p.id.toString() === productoSeleccionadoId);
    if (prodSelect) {
      total += (Number(prodSelect.precio) * cantidadProducto);
    }
    total -= Number(descuentoManual);
    return Number(Math.max(0, total).toFixed(2));
  };

  const handleAgregar = async (e) => {
    e.preventDefault();

    const prodSelect = productosVarios.find(p => p.id.toString() === productoSeleccionadoId);
    if (!prodSelect) return alert('Por favor, selecciona un producto de la lista.');

    const textoExtras = Number(descuentoManual) > 0 ? ` (-Bs${descuentoManual})` : '';

    agregarAlCarrito({
      tipo_venta: 'producto',
      nombre: prodSelect.nombre,
      detalles_texto: `${cantidadProducto} Unidad(es) a Bs.${prodSelect.precio}${textoExtras}`,
      subtotal: calcularTotal(),
      payloadExtras: {
        producto_id: prodSelect.id,
        cantidad: cantidadProducto
      }
    });

    setProductoSeleccionadoId(''); setCantidadProducto(1); setDescuentoManual(0);
  };

  return (
    <form className="space-y-8" onSubmit={handleAgregar}>
      <div>
        <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">1. Seleccionar Producto</label>
        <select value={productoSeleccionadoId} onChange={e => setProductoSeleccionadoId(e.target.value)} required className="w-full bg-[#1a1a1a] border border-[#333] rounded p-4 text-white focus:border-michova-gold outline-none">
          <option value="">Seleccione una opcion...</option>
          {productosVarios.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} (Bs. {p.precio})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">2. Cantidad de Unidades</label>
        <input type="number" min="1" value={cantidadProducto} onChange={e => setCantidadProducto(Number(e.target.value))} required className="w-full bg-[#1a1a1a] border border-[#333] rounded p-4 text-white focus:border-michova-gold outline-none text-lg font-bold" />
      </div>

      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
        <label className="block text-michova-silver text-sm font-bold mb-4 uppercase tracking-wider">Descuentos</label>
        <div className="flex justify-between items-center pt-2">
          <div><p className="text-sm font-bold text-red-400">Descuento Manual</p><p className="text-xs text-gray-500">Monto en Bs.</p></div>
          <input type="number" min="0" placeholder="0" value={descuentoManual === 0 ? '' : descuentoManual} onChange={e => setDescuentoManual(e.target.value)} className="bg-[#111] text-red-400 font-bold p-2 rounded border border-[#444] outline-none w-24 text-right" />
        </div>
      </div>

      <button type="submit" className="w-full bg-[#222] border border-[#333] text-white hover:border-michova-gold hover:text-michova-gold font-bold py-4 rounded uppercase tracking-widest transition-colors">
        + Agregar al Ticket (Bs. {calcularTotal()})
      </button>
    </form>
  );
};

export default VentaProductoPage;