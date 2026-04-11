import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/page.jsx';
import PuntoDeVenta from './components/PuntoDeVenta.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import DashboardLayout from './components/dashboard/layout.jsx';
import ResumenPage from './components/dashboard/resumen/page.jsx';
import InventarioLayout from './components/dashboard/inventario/layout.jsx';
import FraganciasPage from './components/dashboard/inventario/fragancias/page.jsx';
import FrascosPage from './components/dashboard/inventario/frascos/page.jsx';
import ProductosVariosPage from './components/dashboard/inventario/varios/page.jsx';
import VentasPage from './components/dashboard/ventas/page.jsx'; 
import VendedoresPage from './components/dashboard/vendedores/page.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<ResumenPage />} />
          
          <Route path="inventario" element={<InventarioLayout />}>
            <Route index element={<FraganciasPage />} />
            <Route path="frascos" element={<FrascosPage />} />
            <Route path="varios" element={<ProductosVariosPage />} />
          </Route>

          <Route path="ventas" element={<VentasPage />} />
          <Route path="vendedores" element={<VendedoresPage />} />
        </Route>
        
        <Route 
          path="/venta" 
          element={
            <ProtectedRoute>
              <PuntoDeVenta />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;