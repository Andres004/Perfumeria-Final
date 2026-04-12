import { useState, useEffect, useRef } from 'react';

const VentaEsenciaPage = () => {
  const [basesDisponibles, setBasesDisponibles] = useState([]);
  const [fraganciaBuscada, setFraganciaBuscada] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [tamano, setTamano] = useState(30);
  const [descuentoManual, setDescuentoManual] = useState(0);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCobrar = async (e) => {
    e.preventDefault();

    const baseSeleccionada = basesDisponibles.find(b => b.nombre.toLowerCase() === fraganciaBuscada.toLowerCase());
    if (!baseSeleccionada) return alert('Por favor, busca y selecciona una fragancia valida.');

    const ventaPayload = {
      tipo_venta: 'esencia',
      usuario_id: localStorage.getItem('userId'),
      metodo_pago: metodoPago,
      total_calculado: calcularTotal(),
      fragancia_id: baseSeleccionada.id,
      tamaño_ml: tamano,
      tipo_frasco: 'Estandar' 
    };

    if (!window.confirm(`CONFIRMACION DE VENTA\n\nEstas a punto de cobrar Bs. ${ventaPayload.total_calculado} por: ${baseSeleccionada.nombre}.\n\n¿Deseas continuar?`)) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/ventas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ventaPayload)
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Venta Registrada Correctamente.\nTotal Cobrado: Bs. ${ventaPayload.total_calculado}`);
        setFraganciaBuscada(''); setTamano(30); setDescuentoManual(0); setMetodoPago('Efectivo');
      } else { alert(`Error: ${data.error}`); }
    } catch (err) { alert("Error conectando al servidor"); } 
    finally { setIsSubmitting(false); }
  };

  const fraganciasFiltradas = basesDisponibles.filter(b => b.nombre.toLowerCase().includes(fraganciaBuscada.toLowerCase()));
  const totalGenerado = calcularTotal();

  return (
    <div className="bg-[#111] border border-[#333] rounded-lg p-6 shadow-2xl flex flex-col lg:flex-row gap-10 animate-fade-in">
      <form className="flex-1 space-y-8" onSubmit={handleCobrar}>
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
          <input type="number" min="1" value={tamano} onChange={e => setTamano(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-4 text-white text-lg focus:border-michova-gold outline-none font-bold" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
          <div>
            <label className="block text-michova-silver text-sm font-bold mb-4 uppercase tracking-wider">Descuentos</label>
            <div className="flex justify-between items-center pt-2">
              <div><p className="text-sm font-bold text-red-400">Descuento Manual</p><p className="text-xs text-gray-500">Monto en Bs.</p></div>
              <input type="number" min="0" placeholder="0" value={descuentoManual === 0 ? '' : descuentoManual} onChange={e => setDescuentoManual(e.target.value)} className="bg-[#111] text-red-400 font-bold p-2 rounded border border-[#444] outline-none w-24 text-right" />
            </div>
          </div>
          <div>
            <label className="block text-michova-silver text-sm font-bold mb-4 uppercase tracking-wider">Metodo de Pago</label>
            <div className="space-y-3">
              {['Efectivo', 'QR', 'Tarjeta'].map(metodo => (
                <label key={metodo} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${metodoPago === metodo ? 'border-michova-gold bg-[#111]' : 'border-[#333] bg-black'}`}>
                  <input type="radio" name="pago" value={metodo} checked={metodoPago === metodo} onChange={() => setMetodoPago(metodo)} className="accent-michova-gold" />
                  <span className="font-bold">{metodo}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>

      <div className="lg:w-[35%]">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 sticky top-8 shadow-xl">
          <h2 className="text-lg font-bold text-michova-silver mb-6 border-b border-[#333] pb-3 uppercase tracking-wider text-center">Ticket de Venta</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">Esencia Pura:</span><span className="text-white font-bold text-right w-1/2 truncate">{fraganciaBuscada || '---'}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">Cantidad:</span><span className="text-white font-medium bg-[#1a1a1a] px-2 py-1 rounded">{tamano} ml</span></div>
            {fraganciaBuscada && basesDisponibles.find(b => b.nombre === fraganciaBuscada) && (
              <div className="flex justify-between items-center"><span className="text-gray-400">Precio x ml:</span><span className="text-white font-medium">Bs. {basesDisponibles.find(b => b.nombre === fraganciaBuscada).precio_por_ml}</span></div>
            )}
            
            {Number(descuentoManual) > 0 && (
              <div className="pt-4 border-t border-[#222]">
                <span className="block text-gray-400 mb-2 font-bold uppercase text-xs tracking-widest">Descuentos</span>
                <ul className="text-green-400 font-medium space-y-2">
                  <li className="flex justify-between"><span>Manual</span><span className="font-bold">-Bs. {descuentoManual}</span></li>
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-[#222] flex justify-between items-center"><span className="text-gray-400">Pago via:</span><span className="text-white font-bold uppercase">{metodoPago}</span></div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#333] text-center bg-[#111] -mx-6 -mb-6 p-6 rounded-b-lg">
            <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">TOTAL</p>
            <p className="text-5xl font-bold text-michova-gold mb-6 tracking-tight">Bs. {totalGenerado.toFixed(2)}</p>
            <button onClick={handleCobrar} disabled={isSubmitting || totalGenerado === 0} className={`w-full text-michova-black font-extrabold py-4 rounded text-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] ${(isSubmitting || totalGenerado === 0) ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-michova-gold hover:bg-yellow-400 active:scale-95'}`}>
              {isSubmitting ? 'Procesando...' : 'Cobrar Ahora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaEsenciaPage;