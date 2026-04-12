import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const VentaPerfumePage = () => {
  const { agregarAlCarrito } = useOutletContext();
  const [basesDisponibles, setBasesDisponibles] = useState([]);
  const [fraganciaBuscada, setFraganciaBuscada] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [tamano, setTamano] = useState(30);
  const [tipoFrasco, setTipoFrasco] = useState('Estandar');
  const [isRecarga, setIsRecarga] = useState(false);
  const [feromonas, setFeromonas] = useState(0); 
  const [fijador, setFijador] = useState(0); 
  const [elixir, setElixir] = useState(false); 
  const [descuentoManual, setDescuentoManual] = useState(0);

  const preciosEstandar = { 5: 20, 10: 40, 30: 70, 50: 95, 100: 145 };
  const preciosPremium = { 30: 80, 50: 105, 100: 155 };
  const opcionesExtras = [0, 1, 2, 3, 4, 5, 6];

  useEffect(() => {
    fetch('https://perfumeria-final-b.onrender.com/fragancias')
      .then(res => res.json()).then(data => {
        if (Array.isArray(data)) {
          data.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' }));
          setBasesDisponibles(data);
        } else setBasesDisponibles([]);
      }).catch(err => console.error("Error:", err));
  }, []);

  const handleTamanoChange = (nuevoTamano) => {
    setTamano(nuevoTamano);
    if ((nuevoTamano === 5 || nuevoTamano === 10) && tipoFrasco === 'Premium') {
      setTipoFrasco('Estandar');
    }
  };

  const calcularTotal = () => {
    let total = 0;
    let descuentoRecarga = (!isRecarga) ? 0 : ([30, 50, 100].includes(tamano) ? 10 : (tamano === 10 ? 5 : 0));
    
    if (isRecarga) {
      total += preciosEstandar[tamano] || 0;
      total -= descuentoRecarga;
    } else {
      total += (tipoFrasco === 'Premium' && preciosPremium[tamano]) ? preciosPremium[tamano] : (preciosEstandar[tamano] || 0);
    }
    total += (Number(feromonas) * 5);
    total += (Number(fijador) * 5);
    if (elixir) total += 15;
    total -= Number(descuentoManual);
    return Number(Math.max(0, total).toFixed(2));
  };

  const handleAgregar = (e) => {
    e.preventDefault();
    const baseSeleccionada = basesDisponibles.find(b => b.nombre.toLowerCase() === fraganciaBuscada.toLowerCase());
    if (!baseSeleccionada) return alert('Por favor, busca y selecciona una fragancia valida.');

    let extrasStr = [];
    if (feromonas > 0) extrasStr.push(`${feromonas}x Fero`);
    if (fijador > 0) extrasStr.push(`${fijador}x Fija`);
    if (elixir) extrasStr.push(`Elixir`);
    if (Number(descuentoManual) > 0) extrasStr.push(`-Bs${descuentoManual}`);
    
    const textoExtras = extrasStr.length > 0 ? ` (+ ${extrasStr.join(', ')})` : '';
    const detalleVisual = `${tamano}ml - ${isRecarga ? 'Recarga' : tipoFrasco}${textoExtras}`;

    agregarAlCarrito({
      tipo_venta: 'perfume',
      nombre: baseSeleccionada.nombre,
      detalles_texto: detalleVisual,
      subtotal: calcularTotal(),
      payloadExtras: {
        fragancia_id: baseSeleccionada.id,
        tamaño_ml: tamano,
        tipo_frasco: isRecarga ? 'Recarga' : tipoFrasco
      }
    });

    setFraganciaBuscada(''); setTamano(30); setTipoFrasco('Estandar'); setIsRecarga(false);
    setFeromonas(0); setFijador(0); setElixir(false); setDescuentoManual(0);
  };

  const fraganciasFiltradas = basesDisponibles.filter(b => b.nombre.toLowerCase().includes(fraganciaBuscada.toLowerCase()));

  return (
    <form className="space-y-8" onSubmit={handleAgregar}>
      <div className="relative" ref={dropdownRef}>
        <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">1. Seleccionar Fragancia</label>
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
        <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">2. Cantidad en Mililitros</label>
        <div className="flex flex-wrap gap-3">
          {[5, 10, 30, 50, 100].map(vol => (
            <button key={vol} type="button" onClick={() => handleTamanoChange(vol)} className={`flex-1 py-4 px-2 rounded font-bold border transition-all ${tamano === vol ? 'bg-michova-gold text-michova-black border-michova-gold scale-105 shadow-md' : 'bg-[#1a1a1a] text-michova-silver border-[#333] hover:border-michova-silver'}`}>{vol} ml</button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-3">
          <label className="block text-michova-silver text-sm font-bold uppercase tracking-wider">3. Envase</label>
          <label className="flex items-center gap-2 cursor-pointer bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#333]">
            <input type="checkbox" checked={isRecarga} onChange={(e) => setIsRecarga(e.target.checked)} className="accent-michova-gold w-4 h-4" />
            <span className="text-sm font-bold text-white uppercase">Es Recarga</span>
          </label>
        </div>
        {isRecarga ? (
          <div className="w-full bg-[#1a1a1a] border border-michova-gold rounded-lg p-6 text-center"><span className="font-bold text-michova-gold text-xl uppercase tracking-widest">Servicio de Recarga</span></div>
        ) : (
          <div className="flex gap-4">
            <label className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer p-4 border rounded-lg transition-all ${tipoFrasco === 'Estandar' ? 'border-michova-gold bg-[#1a1a1a]' : 'border-[#333] opacity-60'}`}><input type="radio" name="frasco" value="Estandar" checked={tipoFrasco === 'Estandar'} onChange={() => setTipoFrasco('Estandar')} className="hidden" /><span className="font-bold text-lg">Estandar</span><span className="text-xs text-michova-gold">Bs. {preciosEstandar[tamano]}</span></label>
            <label className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer p-4 border rounded-lg transition-all ${(tamano === 5 || tamano === 10) ? 'opacity-20 cursor-not-allowed bg-black' : tipoFrasco === 'Premium' ? 'border-michova-gold bg-[#1a1a1a]' : 'border-[#333] opacity-60'}`}><input type="radio" name="frasco" value="Premium" disabled={tamano === 5 || tamano === 10} checked={tipoFrasco === 'Premium'} onChange={() => setTipoFrasco('Premium')} className="hidden" /><span className="font-bold text-lg">Premium</span><span className="text-xs text-michova-gold">{preciosPremium[tamano] ? `Bs. ${preciosPremium[tamano]}` : 'No aplica'}</span></label>
          </div>
        )}
      </div>

      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
        <label className="block text-michova-silver text-sm font-bold mb-4 uppercase tracking-wider">Extras y Descuentos</label>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#333] pb-3">
            <div><p className="text-sm font-bold text-white">Feromonas</p><p className="text-xs text-gray-500">Bs. 5 por dosis</p></div>
            <select value={feromonas} onChange={e => setFeromonas(Number(e.target.value))} className="bg-[#111] text-michova-gold font-bold p-2 rounded border border-[#444] outline-none">
              {opcionesExtras.map(n => <option key={n} value={n}>{n} Dosis</option>)}
            </select>
          </div>
          <div className="flex justify-between items-center border-b border-[#333] pb-3">
            <div><p className="text-sm font-bold text-white">Fijador</p><p className="text-xs text-gray-500">Bs. 5 por dosis</p></div>
            <select value={fijador} onChange={e => setFijador(Number(e.target.value))} className="bg-[#111] text-michova-gold font-bold p-2 rounded border border-[#444] outline-none">
              {opcionesExtras.map(n => <option key={n} value={n}>{n} Dosis</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer pt-2 border-b border-[#333] pb-3">
            <input type="checkbox" checked={elixir} onChange={e => setElixir(e.target.checked)} className="accent-michova-gold w-5 h-5" />
            <div><p className="text-sm font-bold text-white">Elixir</p><p className="text-xs text-michova-gold">Costo fijo +Bs. 15</p></div>
          </label>
          <div className="flex justify-between items-center pt-2">
            <div><p className="text-sm font-bold text-red-400">Descuento Manual</p><p className="text-xs text-gray-500">Monto en Bs.</p></div>
            <input type="number" min="0" placeholder="0" value={descuentoManual === 0 ? '' : descuentoManual} onChange={e => setDescuentoManual(e.target.value)} className="bg-[#111] text-red-400 font-bold p-2 rounded border border-[#444] outline-none w-24 text-right" />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-[#222] border border-[#333] text-white hover:border-michova-gold hover:text-michova-gold font-bold py-4 rounded uppercase tracking-widest transition-colors">
        + Agregar al Ticket (Bs. {calcularTotal()})
      </button>
    </form>
  );
};

export default VentaPerfumePage;