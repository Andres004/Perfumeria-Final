import { NavLink, Outlet } from 'react-router-dom';

const InventarioLayout = () => {
  const subTabs = [
    { path: '/dashboard/inventario', label: 'Fragancias', end: true },
    { path: '/dashboard/inventario/frascos', label: 'Envases y Frascos' },
    { path: '/dashboard/inventario/varios', label: 'Productos Varios' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 border-b border-[#333] mb-6 overflow-x-auto">
        {subTabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) => 
              `px-4 py-2 font-bold uppercase tracking-wider text-xs transition-colors border-b-2 ${
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

      <Outlet />
    </div>
  );
};

export default InventarioLayout;