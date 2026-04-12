import { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import logotipo from '../../assets/logotipo.png';

const VentaLayout = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });

  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketFinalizado, setTicketFinalizado] = useState(null);

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

  const tabs = [
    { path: '/venta', label: 'Perfume Preparado', end: true },
    { path: '/venta/esencia', label: 'Solo Esencia' },
    { path: '/venta/producto', label: 'Cajas y Productos' }
  ];

  const agregarAlCarrito = (item) => {
    setCarrito([...carrito, { ...item, id_temp: Date.now() }]);
    setTicketFinalizado(null);
  };

  const eliminarDelCarrito = (id_temp) => {
    setCarrito(carrito.filter(item => item.id_temp !== id_temp));
  };

  const totalGeneral = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCobrarVenta = async () => {
    if (carrito.length === 0) return;

    setIsSubmitting(true);

    try {
      for (const item of carrito) {
        const ventaPayload = {
          tipo_venta: item.tipo_venta,
          usuario_id: localStorage.getItem('userId'),
          metodo_pago: metodoPago,
          total_calculado: item.subtotal,
          ...item.payloadExtras
        };

        await fetch('https://perfumeria-final-b.onrender.com/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ventaPayload)
        });
      }

      setTicketFinalizado({
        items: [...carrito],
        total: totalGeneral,
        fecha: new Date().toLocaleString('es-BO'),
        pago: metodoPago
      });
      setCarrito([]);
    } catch (err) {
      alert("Error conectando al servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imprimirTicket = () => {
    if (!ticketFinalizado) return;
    const ventana = window.open('', '_blank', 'width=400,height=600');
    ventana.document.write(`
      <html>
        <head>
          <title>Ticket de Venta</title>
          <style>
            body { font-family: monospace; color: #000; padding: 20px; max-width: 300px; margin: auto; }
            h1 { text-align: center; font-size: 24px; margin-bottom: 5px; }
            p { margin: 2px 0; font-size: 12px; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;}
            .item-name { width: 70%; }
            .item-price { width: 30%; text-align: right; font-weight: bold; }
            .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>MICHOVA</h1>
          <p style="text-align:center">Sistema de Gestion</p>
          <div class="divider"></div>
          <p>Fecha: ${ticketFinalizado.fecha}</p>
          <p>Atendido por: ${localStorage.getItem('userName')}</p>
          <div class="divider"></div>
          ${ticketFinalizado.items.map(i => `
            <div class="item">
              <div class="item-name">${i.nombre}<br><small>${i.detalles_texto}</small></div>
              <div class="item-price">Bs. ${i.subtotal.toFixed(2)}</div>
            </div>
          `).join('')}
          <div class="divider"></div>
          <p>Metodo de Pago: ${ticketFinalizado.pago}</p>
          <div class="total">TOTAL: Bs. ${ticketFinalizado.total.toFixed(2)}</div>
          <div class="divider"></div>
          <p style="text-align:center">¡Gracias por su compra!</p>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-michova-black text-white font-sans relative" translate="no">
      <header className="bg-[#0a0a0a] border-b border-[#333] p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <img 
              src={logotipo} 
              alt="Logo Michova" 
              className="h-15 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" 
            />
            <div>
              <h1 className="text-2xl font-bold text-michova-gold tracking-widest">MICHOVA</h1>
              <p className="text-michova-silver tracking-widest uppercase text-xs mt-1">Hola, {localStorage.getItem('userName')}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {localStorage.getItem('role') === 'admin' && (
              <button onClick={() => navigate('/dashboard')} className="bg-[#222] hover:bg-[#333] px-4 py-2 rounded text-sm font-bold transition-colors">Panel Admin</button>
            )}
            <button onClick={() => setShowPasswordModal(true)} className="text-gray-400 hover:text-white px-2 py-2 rounded text-sm font-bold transition-colors">Mi Cuenta</button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded text-sm font-bold transition-colors">Salir</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 border-b border-[#333] mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) => 
                `px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${
                  isActive 
                    ? 'border-michova-gold text-michova-gold bg-[#111]' 
                    : 'border-transparent text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="bg-[#111] border border-[#333] rounded-lg p-6 shadow-2xl flex flex-col lg:flex-row gap-10 animate-fade-in">
          
          <div className="flex-1">
            <Outlet context={{ agregarAlCarrito }} />
          </div>

          <div className="lg:w-[40%] flex flex-col">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex-1 flex flex-col shadow-xl">
              <h2 className="text-lg font-bold text-michova-silver mb-4 border-b border-[#333] pb-3 uppercase tracking-wider text-center">Ticket de Venta</h2>
              
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
                {carrito.length === 0 && !ticketFinalizado && (
                  <p className="text-center text-gray-500 text-sm mt-10 italic">El carrito esta vacio</p>
                )}
                {carrito.map(item => (
                  <div key={item.id_temp} className="bg-[#1a1a1a] p-3 rounded border border-[#222] relative group">
                    <div className="pr-6">
                      <p className="text-white font-bold text-sm leading-tight">{item.nombre}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.detalles_texto}</p>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-michova-gold font-bold text-sm">Bs. {item.subtotal.toFixed(2)}</span>
                    </div>
                    <button onClick={() => eliminarDelCarrito(item.id_temp)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 font-bold opacity-50 group-hover:opacity-100 transition-opacity p-1">X</button>
                  </div>
                ))}
                
                {ticketFinalizado && (
                  <div className="bg-green-900/20 border border-green-900/50 p-4 rounded text-center">
                    <p className="text-green-500 font-bold uppercase tracking-widest text-sm mb-2">Venta Procesada</p>
                    <p className="text-white text-xs mb-4">La venta ha sido guardada en el historial.</p>
                    <button onClick={imprimirTicket} className="bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors w-full uppercase text-xs tracking-wider">
                      🖨️ Imprimir / Descargar PDF
                    </button>
                  </div>
                )}
              </div>

              {!ticketFinalizado && (
                <div className="mt-6 pt-4 border-t border-[#333]">
                  <label className="block text-michova-silver text-xs font-bold mb-3 uppercase tracking-wider">Metodo de Pago</label>
                  <div className="flex gap-2 mb-6">
                    {['Efectivo', 'QR', 'Tarjeta'].map(metodo => (
                      <label key={metodo} className={`flex-1 text-center py-2 border rounded cursor-pointer transition-colors text-xs uppercase font-bold tracking-wider ${metodoPago === metodo ? 'border-michova-gold bg-[#111] text-michova-gold' : 'border-[#333] bg-black text-gray-500'}`}>
                        <input type="radio" name="pago_global" value={metodo} checked={metodoPago === metodo} onChange={() => setMetodoPago(metodo)} className="hidden" />
                        {metodo}
                      </label>
                    ))}
                  </div>

                  <div className="text-center bg-[#1a1a1a] -mx-6 -mb-6 p-6 rounded-b-lg border-t border-[#222]">
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest">TOTAL A COBRAR</p>
                    <p className="text-4xl font-bold text-michova-gold mb-4 tracking-tight">Bs. {totalGeneral.toFixed(2)}</p>
                    <button onClick={handleCobrarVenta} disabled={isSubmitting || carrito.length === 0} className={`w-full text-michova-black font-extrabold py-4 rounded text-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] ${(isSubmitting || carrito.length === 0) ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-michova-gold hover:bg-yellow-400 active:scale-95'}`}>
                      {isSubmitting ? 'Procesando...' : 'Completar Venta'}
                    </button>
                  </div>
                </div>
              )}
              
              {ticketFinalizado && (
                <button onClick={() => setTicketFinalizado(null)} className="mt-4 w-full bg-[#1a1a1a] text-white border border-[#333] hover:bg-[#222] font-bold py-3 rounded uppercase text-xs tracking-wider transition-colors">
                  Iniciar Nueva Venta
                </button>
              )}
            </div>
          </div>
        </div>
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

export default VentaLayout;