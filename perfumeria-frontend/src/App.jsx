import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PuntoDeVenta from './components/PuntoDeVenta';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública: El Login siempre es accesible */}
        <Route path="/" element={<Login />} />

        {/* RUTAS PROTEGIDAS: Si no estás logueado, no entras */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
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