import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ResumenPage = () => {
  const [ventas, setVentas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [frascos, setFrascos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtroTiempo, setFiltroTiempo] = useState('semanal');

  const cargarDatos = async () => {
    try {
      const [resFrag, resVentas, resVend, resFrascos, resProd] = await Promise.all([
        fetch('https://perfumeria-final-b.onrender.com/fragancias'),
        fetch('https://perfumeria-final-b.onrender.com/ventas'),
        fetch('https://perfumeria-final-b.onrender.com/usuarios'),
        fetch('https://perfumeria-final-b.onrender.com/frascos'),
        fetch('https://perfumeria-final-b.onrender.com/productos')
      ]);
      
      const dataFrag = await resFrag.json();
      const dataVentas = await resVentas.json();
      const dataVend = await resVend.json();
      const dataFrascos = await resFrascos.json();
      const dataProd = await resProd.json();

      if (Array.isArray(dataFrag)) {
        dataFrag.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' }));
        setInventario(dataFrag);
      } else setInventario([]);

      setVentas(Array.isArray(dataVentas) ? dataVentas : []);
      setVendedores(Array.isArray(dataVend) ? dataVend : []);
      setFrascos(Array.isArray(dataFrascos) ? dataFrascos : []);
      setProductos(Array.isArray(dataProd) ? dataProd : []);

    } catch (error) {
      console.error("Error al cargar el resumen", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const procesarDatosGrafico = () => {
    if (!Array.isArray(ventas)) return [];
    const hoy = new Date();
    let diasFiltro = filtroTiempo === 'diario' ? 1 : filtroTiempo === 'semanal' ? 7 : 30;
    const ventasFiltradas = ventas.filter(v => {
      const fechaVenta = new Date(v.fecha_hora);
      return (hoy - fechaVenta) / (1000 * 60 * 60 * 24) <= diasFiltro;
    });
    const agrupado = ventasFiltradas.reduce((acc, v) => {
      const fecha = new Date(v.fecha_hora).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + Number(v.total);
      return acc;
    }, {});
    return Object.keys(agrupado).map(fecha => ({ fecha, total: agrupado[fecha] })).reverse(); 
  };

  const alertasFragancias = inventario.filter(i => i.stock_ml <= i.stock_minimo).length;
  const alertasFrascos = frascos.filter(f => f.stock <= f.stock_minimo).length;
  const alertasProductos = productos.filter(p => p.stock <= p.stock_minimo).length;
  const totalAlertas = alertasFragancias + alertasFrascos + alertasProductos;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-michova-gold shadow-md">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Recaudado (Historico)</p>
          <p className="text-3xl font-bold mt-2">Bs. {ventas.reduce((acc, v) => acc + Number(v.total), 0)}</p>
        </div>
        <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-red-500 shadow-md">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Alertas de Stock</p>
          <p className="text-3xl font-bold mt-2 text-white">{totalAlertas} <span className="text-sm font-normal text-gray-500">criticos</span></p>
        </div>
        <div className="bg-[#111] border border-[#333] p-6 rounded border-l-4 border-l-blue-500 shadow-md">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Vendedores Activos</p>
          <p className="text-3xl font-bold mt-2">{vendedores.length}</p>
        </div>
      </div>
      <div className="bg-[#111] border border-[#333] p-6 rounded shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-michova-silver font-bold uppercase tracking-wider">Curva de Ingresos</h2>
          <select value={filtroTiempo} onChange={(e) => setFiltroTiempo(e.target.value)} className="bg-[#1a1a1a] text-white border border-[#333] p-2 rounded text-sm focus:border-michova-gold outline-none">
            <option value="diario">Hoy</option><option value="semanal">Ultimos 7 Dias</option><option value="mensual">Ultimo Mes</option>
          </select>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={procesarDatosGrafico()}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="fecha" stroke="#888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Bs${value}`} /><Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#FFD700', fontWeight: 'bold' }} /><Line type="monotone" dataKey="total" name="Ingresos" stroke="#FFD700" strokeWidth={3} dot={{ r: 4, fill: '#FFD700', strokeWidth: 2, stroke: '#111' }} activeDot={{ r: 6 }} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResumenPage;