import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const VentaEsenciaPage = () => {
  const { agregarAlCarrito } = useOutletContext();
  const [basesDisponibles, setBasesDisponibles] = useState([]);
  const [fraganciaBuscada, setFraganciaBuscada] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [tamano, setTamano] = useState('');
  const [descuentoManual, setDescuentoManual] = useState(0);

  useEffect(() => {
    fetch('https://perfumeria-final-b.onrender.com/fragancias')
      .then(res => res.json()).then(data => {
        if (Array.isArray(data)) {
          data.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' }));
          setBasesDisponibles(data);
        } else setBasesDisponibles([]);
      }).catch(err => console.error("Error:", err));
  }, []);

  const calcularTotal = () => {
    let total = 0;
    const baseSeleccionada = basesDisponibles.find(b => b.nombre.toLowerCase() === fraganciaBuscada.toLowerCase());
    if (baseSeleccionada) {
      total += (Number(baseSeleccionada.precio_por_ml) * tamano);
    }
    total -= Number(descuentoManual);
    return Number(Math.max(0, total).toFixed(2));
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    const baseSeleccionada = basesDisponibles.find(b => b.nombre.toLowerCase() === fraganciaBuscada.toLowerCase());
    if (!baseSeleccionada) return alert('Por favor, busca y selecciona una fragancia valida.');

    const textoExtras = Number(descuentoManual) > 0 ? ` (-Bs${descuentoManual})` : '';

    agregarAlCarrito({
      tipo_venta: 'esencia',
      nombre: `${baseSeleccionada.nombre} (Esencia)`,
      detalles_texto: `${tamano}ml Pura${textoExtras}`,
      subtotal: calcularTotal(),
      payloadExtras: {
        fragancia_id: baseSeleccionada.id,
        tamaño_ml: tamano,
        tipo_frasco: 'Estandar' 
      }
    });

    setFraganciaBuscada(''); setTamano(30); setDescuentoManual(0);
  };

  const fraganciasFiltradas = basesDisponibles.filter(b => b.nombre.toLowerCase().includes(fraganciaBuscada.toLowerCase()));

  return (
    <form className="space-y-8" onSubmit={handleAgregar}>
      <div className="relative" ref={dropdownRef}>
        <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">1. Seleccionar Esencia</label>
        <input type="text" placeholder="Buscar fragancia..." value={fraganciaBuscada} onChange={(e) => { setFraganciaBuscada(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-4 text-white focus:border-michova-gold outline-none" required autoComplete="off" />
        {showDropdown && fraganciasFiltradas.length > 0 && (
          <ul className="absolute w-full mt-1 bg-[#1a1a1a] border border-[#333] rounded z-50 max-h-48 overflow-y-auto shadow-2xl">
            {fraganciasFiltradas.map(b => (
              <li key={b.id} onMouseDown={() => { setFraganciaBuscada(b.nombre); setShowDropdown(false); }} className="p-4 hover:bg-[#333] cursor-pointer text-white font-medium hover:text-michova-gold transition-colors border-b border-[#222]">{b.nombre}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">2. Cantidad de Esencia (ml)</label>
        <input type="text" inputMode="decimal" value={tamano} onChange={e => { let val = e.target.value.replace(',', '.'); if (/^\d*\.?\d*$/.test(val)) { setTamano(val.replace(/^0+(?=\d)/, '') || 0); } }} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-4 text-white text-lg focus:border-michova-gold outline-none font-bold" />
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

export default VentaEsenciaPage;