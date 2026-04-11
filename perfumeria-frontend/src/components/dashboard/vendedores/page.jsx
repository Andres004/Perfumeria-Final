import { useState, useEffect } from 'react';

const VendedoresPage = () => {
  const [vendedores, setVendedores] = useState([]);
  const [nuevoVendedor, setNuevoVendedor] = useState({ nombre: '', email: '', password: '' });

  const cargarDatos = async () => {
    try {
      const res = await fetch('https://perfumeria-final-b.onrender.com/usuarios');
      const data = await res.json();
      setVendedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar vendedores", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrearVendedor = async (e) => {
    e.preventDefault();
    const res = await fetch('https://perfumeria-final-b.onrender.com/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...nuevoVendedor, rol: 'vendedor' }) });
    if (res.ok) {
      alert('Vendedor registrado'); setNuevoVendedor({ nombre: '', email: '', password: '' }); cargarDatos();
    } else {
      const data = await res.json(); alert(`Error: ${data.error}`);
    }
  };

  const handleQuitarAccesoVendedor = async (id) => {
    if(!window.confirm('Quitar acceso permanentemente a este usuario.')) return;
    await fetch(`https://perfumeria-final-b.onrender.com/usuarios/${id}`, { method: 'DELETE' }); cargarDatos();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="bg-[#111] border border-[#333] p-6 rounded h-fit">
        <h2 className="text-michova-silver font-bold uppercase tracking-wider mb-6 border-b border-[#333] pb-2">Dar de Alta Empleado</h2>
        <form onSubmit={handleCrearVendedor} className="space-y-4">
          <div><label className="text-xs text-gray-400 font-bold uppercase">Nombre Completo</label><input type="text" required value={nuevoVendedor.nombre} onChange={e => setNuevoVendedor({...nuevoVendedor, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="Ej: Juan Perez" /></div>
          <div><label className="text-xs text-gray-400 font-bold uppercase">Correo (Login)</label><input type="email" required value={nuevoVendedor.email} onChange={e => setNuevoVendedor({...nuevoVendedor, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" placeholder="juan@michova.com" /></div>
          <div><label className="text-xs text-gray-400 font-bold uppercase">Contraseña Temporal</label><input type="password" required value={nuevoVendedor.password} onChange={e => setNuevoVendedor({...nuevoVendedor, password: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white rounded mt-1 focus:border-michova-gold outline-none" /></div>
          <button type="submit" className="w-full bg-michova-silver text-black font-bold py-3 rounded mt-4 hover:bg-white transition-colors uppercase text-sm">Registrar Vendedor</button>
        </form>
      </div>
      <div className="lg:col-span-2 bg-[#111] border border-[#333] rounded overflow-hidden">
         <div className="p-4 border-b border-[#333] bg-[#0a0a0a]"><h2 className="text-michova-silver font-bold uppercase tracking-wider">Personal Autorizado</h2></div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendedores.map(v => (
            <div key={v.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded flex justify-between items-center group">
              <div><p className="font-bold text-white text-lg">{v.nombre}</p><p className="text-sm text-gray-400">{v.email}</p><p className="text-xs text-michova-gold mt-1">Registrado: {new Date(v.creado_en).toLocaleDateString('es-BO')}</p></div>
              <button onClick={() => handleQuitarAccesoVendedor(v.id)} className="bg-[#222] group-hover:bg-red-900 group-hover:text-white text-gray-500 px-3 py-1 rounded font-bold transition-colors uppercase text-xs">Revocar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendedoresPage;