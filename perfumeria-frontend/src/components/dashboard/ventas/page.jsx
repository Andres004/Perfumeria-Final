import { useState, useEffect } from 'react';

const VentasPage = () => {
  const [ventas, setVentas] = useState([]);

  const cargarDatos = async () => {
    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/ventas');
      const data = await res.json();
      setVentas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar ventas", error);
    }
  };

  useEffect(() => {
    cargarDatos();
    
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

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

  return (
    <div className="bg-[#111] border border-[#333] rounded overflow-hidden animate-fade-in shadow-md">
      <div className="p-4 border-b border-[#333] bg-[#0a0a0a] flex justify-between items-center">
        <div>
          <h2 className="text-michova-silver font-bold uppercase tracking-wider">Todas las transacciones</h2>
          <span className="text-xs text-gray-500">Total Registros: {ventas.length}</span>
          <span className="text-xs text-green-500 ml-4 flex-inline items-center gap-1 animate-pulse">
            ● Actualizando en tiempo real
          </span>
        </div>
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
  );
};

export default VentasPage;