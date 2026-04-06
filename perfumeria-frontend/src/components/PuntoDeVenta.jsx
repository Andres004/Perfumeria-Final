import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PuntoDeVenta = () => {
  const navigate = useNavigate();
  const [basesDisponibles, setBasesDisponibles] = useState([]);
  
  const [fraganciaBuscada, setFraganciaBuscada] = useState('');
  const [tamano, setTamano] = useState(30);
  const [tipoFrasco, setTipoFrasco] = useState('Estandar');
  const [feromonas, setFeromonas] = useState(0); 
  const [fijador, setFijador] = useState(0); 
  const [elixir, setElixir] = useState(false); 
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });

  const preciosEstandar = { 5: 20, 10: 40, 30: 70, 50: 95, 100: 145 };
  const preciosPremium = { 30: 80, 50: 105, 100: 155 };

  useEffect(() => {
    fetch('https://perfumeria-final-b.onrender.com/fragancias')
      .then(res => res.json())
      .then(data => setBasesDisponibles(data))
      .catch(err => console.error("Error:", err));
  }, []);

  const handleTamanoChange = (nuevoTamano) => {
    setTamano(nuevoTamano);
    if ((nuevoTamano === 5 || nuevoTamano === 10) && tipoFrasco === 'Premium') {
      setTipoFrasco('Estandar');
    }
  };

  const calcularTotal = () => {
    let total = 0;
    if (tipoFrasco === 'Premium' && preciosPremium[tamano]) {
      total += preciosPremium[tamano];
    } else {
      total += preciosEstandar[tamano] || 0;
    }
    total += (Number(feromonas) * 5);
    total += (Number(fijador) * 5);
    if (elixir) total += 15;
    return total;
  };

  const handleCobrar = async (e) => {
    e.preventDefault();
    const baseSeleccionada = basesDisponibles.find(
      b => b.nombre.toLowerCase() === fraganciaBuscada.toLowerCase()
    );
    
    if (!baseSeleccionada) {
      return alert('Por favor, busca y selecciona una fragancia válida de la lista.');
    }

    const totalCobro = calcularTotal();
    const confirmar = window.confirm(` CONFIRMACIÓN DE VENTA\n\nEstás a punto de cobrar Bs. ${totalCobro} por la fragancia ${baseSeleccionada.nombre}.\n\n¿Deseas continuar?`);
    if (!confirmar) return;

    setIsSubmitting(true);

    const venta = {
      usuario_id: localStorage.getItem('userId'),
      fragancia_id: baseSeleccionada.id,
      tamaño_ml: tamano,
      tipo_frasco: tipoFrasco,
      metodo_pago: metodoPago,
      total_calculado: totalCobro,
      extras: { feromonas, fijador, elixir }
    };

    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venta)
      });
      const data = await res.json();

      if (res.ok) {
        alert(` ¡Venta Registrada Correctamente!\nTotal Cobrado: Bs. ${totalCobro}`);
        setFraganciaBuscada(''); setTamano(30); setTipoFrasco('Estandar');
        setFeromonas(0); setFijador(0); setElixir(false); setMetodoPago('Efectivo');
      } else {
        alert(` Error: ${data.error}`);
      }
    } catch (err) {
      alert("Error conectando al servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPassStatus({ loading: true, error: '', success: '' });

    if (passData.nueva !== passData.confirmar) {
      return setPassStatus({ loading: false, error: 'Las contraseñas nuevas no coinciden.', success: '' });
    }
    if (passData.nueva.length < 6) {
      return setPassStatus({ loading: false, error: 'La contraseña debe tener al menos 6 caracteres.', success: '' });
    }

    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/usuarios/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: localStorage.getItem('userId'),
          password_actual: passData.actual,
          password_nueva: passData.nueva
        })
      });
      const data = await res.json();

      if (res.ok) {
        setPassStatus({ loading: false, error: '', success: '¡Contraseña actualizada con éxito!' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPassData({ actual: '', nueva: '', confirmar: '' });
          setPassStatus({ loading: false, error: '', success: '' });
        }, 2000);
      } else {
        setPassStatus({ loading: false, error: data.error, success: '' });
      }
    } catch (err) {
      setPassStatus({ loading: false, error: 'Error de conexión con el servidor.', success: '' });
    }
  };

  return (
    <div className="min-h-screen bg-michova-black text-white p-4 md:p-8 font-sans relative" translate="no">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-6 border-b border-[#333] pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-michova-gold tracking-widest">MICHOVA</h1>
            <p className="text-michova-silver tracking-widest uppercase text-xs mt-1">
              Terminal: {localStorage.getItem('userName')}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {localStorage.getItem('role') === 'admin' && (
              <button onClick={() => navigate('/dashboard')} className="bg-[#222] hover:bg-[#333] px-4 py-2 rounded text-sm transition-colors">Panel Admin</button>
            )}
            
            <button 
              onClick={() => setShowPasswordModal(true)} 
              className="text-gray-400 hover:text-white px-2 py-2 rounded text-sm font-bold transition-colors flex items-center gap-1"
              title="Cambiar Contraseña"
            >
              ⚙️ Mi Cuenta
            </button>

            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded text-sm font-bold transition-colors">Salir</button>
          </div>
        </header>

        <div className="bg-[#111] border border-[#333] rounded-lg p-6 shadow-2xl flex flex-col lg:flex-row gap-10">
          <form className="flex-1 space-y-8" onSubmit={handleCobrar}>
            <div>
              <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">1. Buscar Fragancia</label>
              <input type="text" list="lista-fragancias" placeholder="Escribe para buscar..." value={fraganciaBuscada} onChange={(e) => setFraganciaBuscada(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-4 text-white focus:border-michova-gold outline-none" required />
              <datalist id="lista-fragancias">
                {basesDisponibles.map(b => <option key={b.id} value={b.nombre} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">2. Presentación (ml)</label>
              <div className="flex flex-wrap gap-3">
                {[5, 10, 30, 50, 100].map(vol => (
                  <button key={vol} type="button" onClick={() => handleTamanoChange(vol)} className={`flex-1 py-4 px-2 rounded font-bold border transition-all ${tamano === vol ? 'bg-michova-gold text-michova-black border-michova-gold scale-105 shadow-md' : 'bg-[#1a1a1a] text-michova-silver border-[#333] hover:border-michova-silver'}`}>{vol} ml</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-michova-silver text-sm font-bold mb-3 uppercase tracking-wider">3. Tipo de Envase</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer p-4 border rounded-lg transition-all ${tipoFrasco === 'Estandar' ? 'border-michova-gold bg-[#1a1a1a]' : 'border-[#333] opacity-60'}`}>
                  <input type="radio" name="frasco" value="Estandar" checked={tipoFrasco === 'Estandar'} onChange={() => setTipoFrasco('Estandar')} className="hidden" />
                  <span className="font-bold text-lg">Estándar</span><span className="text-xs text-michova-gold">Bs. {preciosEstandar[tamano]}</span>
                </label>
                <label className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer p-4 border rounded-lg transition-all ${(tamano === 5 || tamano === 10) ? 'opacity-20 cursor-not-allowed bg-black' : tipoFrasco === 'Premium' ? 'border-michova-gold bg-[#1a1a1a]' : 'border-[#333] opacity-60'}`}>
                  <input type="radio" name="frasco" value="Premium" disabled={tamano === 5 || tamano === 10} checked={tipoFrasco === 'Premium'} onChange={() => setTipoFrasco('Premium')} className="hidden" />
                  <span className="font-bold text-lg">Premium</span><span className="text-xs text-michova-gold">{preciosPremium[tamano] ? `Bs. ${preciosPremium[tamano]}` : 'No aplica'}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
              <div>
                <label className="block text-michova-silver text-sm font-bold mb-4 uppercase tracking-wider">4. Agregados Extras</label>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#333] pb-3">
                    <div><p className="text-sm font-bold text-white">Feromonas</p><p className="text-xs text-gray-500">Bs. 5 por dosis</p></div>
                    <select value={feromonas} onChange={e => setFeromonas(Number(e.target.value))} className="bg-[#111] text-michova-gold font-bold p-2 rounded border border-[#444] outline-none">
                      <option value={0}>0 Dosis</option><option value={1}>1 Dosis</option><option value={2}>2 Dosis</option><option value={3}>3 Dosis</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#333] pb-3">
                    <div><p className="text-sm font-bold text-white">Fijador</p><p className="text-xs text-gray-500">Bs. 5 por dosis</p></div>
                    <select value={fijador} onChange={e => setFijador(Number(e.target.value))} className="bg-[#111] text-michova-gold font-bold p-2 rounded border border-[#444] outline-none">
                      <option value={0}>0 Dosis</option><option value={1}>1 Dosis</option><option value={2}>2 Dosis</option><option value={3}>3 Dosis</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input type="checkbox" checked={elixir} onChange={e => setElixir(e.target.checked)} className="accent-michova-gold w-5 h-5" />
                    <div><p className="text-sm font-bold text-white">Elixir Secreto</p><p className="text-xs text-michova-gold">Costo fijo +Bs. 15</p></div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-michova-silver text-sm font-bold mb-4 uppercase tracking-wider">5. Método de Pago</label>
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
                <div className="flex justify-between items-center"><span className="text-gray-400">Perfume:</span><span className="text-white font-bold text-right w-1/2 truncate" title={fraganciaBuscada}>{fraganciaBuscada || '---'}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400">Formato:</span><span className="text-white font-medium bg-[#1a1a1a] px-2 py-1 rounded">{tamano}ml - {tipoFrasco}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400">Subtotal Envase:</span><span className="text-white font-medium">Bs. {tipoFrasco === 'Premium' ? preciosPremium[tamano] : preciosEstandar[tamano]}</span></div>
                {(feromonas > 0 || fijador > 0 || elixir) && (
                  <div className="pt-4 border-t border-[#222]">
                    <span className="block text-gray-400 mb-2 font-bold uppercase text-xs tracking-widest">Agregados</span>
                    <ul className="text-michova-gold font-medium space-y-2">
                      {feromonas > 0 && <li className="flex justify-between"><span>{feromonas}x Dosis Feromonas</span><span>Bs. {feromonas * 5}</span></li>}
                      {fijador > 0 && <li className="flex justify-between"><span>{fijador}x Dosis Fijador</span><span>Bs. {fijador * 5}</span></li>}
                      {elixir && <li className="flex justify-between"><span>1x Elixir Secreto</span><span>Bs. 15</span></li>}
                    </ul>
                  </div>
                )}
                <div className="pt-4 border-t border-[#222] flex justify-between items-center"><span className="text-gray-400">Pago vía:</span><span className="text-white font-bold uppercase">{metodoPago}</span></div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#333] text-center bg-[#111] -mx-6 -mb-6 p-6 rounded-b-lg">
                <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">TOTAL A PAGAR</p>
                <p className="text-5xl font-bold text-michova-gold mb-6 tracking-tight">Bs. {calcularTotal()}</p>
                <button onClick={handleCobrar} disabled={!fraganciaBuscada || isSubmitting} className={`w-full text-michova-black font-extrabold py-4 rounded text-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] ${(!fraganciaBuscada || isSubmitting) ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-michova-gold hover:bg-yellow-400 active:scale-95'}`}>
                  {isSubmitting ? 'Procesando Venta...' : 'Cobrar Ahora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#333] rounded-lg p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#333] pb-4 mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              {passStatus.error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded">{passStatus.error}</div>}
              {passStatus.success && <div className="bg-green-900/50 border border-green-500 text-green-200 text-sm p-3 rounded">{passStatus.success}</div>}
              
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Contraseña Actual</label>
                <input type="password" required value={passData.actual} onChange={e => setPassData({...passData, actual: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded focus:border-michova-gold outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Nueva Contraseña</label>
                <input type="password" required value={passData.nueva} onChange={e => setPassData({...passData, nueva: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded focus:border-michova-gold outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Confirmar Nueva Contraseña</label>
                <input type="password" required value={passData.confirmar} onChange={e => setPassData({...passData, confirmar: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded focus:border-michova-gold outline-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={passStatus.loading} className="flex-1 bg-michova-gold text-michova-black font-bold py-3 rounded uppercase text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50">
                  {passStatus.loading ? 'Guardando...' : 'Actualizar'}
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="bg-[#333] text-white px-6 rounded font-bold uppercase text-sm hover:bg-[#444] transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PuntoDeVenta;