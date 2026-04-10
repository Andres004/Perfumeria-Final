require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor MICHOVA funcionando');
});

// Rutas de raíz especiales
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol')
    .eq('email', email)
    .eq('password_hash', password)
    .single();

  if (error || !data) return res.status(401).json({ error: 'Credenciales incorrectas' });
  res.json({ mensaje: 'Login exitoso', usuario: data });
});

app.get('/reporte-excel', async (req, res) => {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select(`
      id, fecha_hora, metodo_pago, total,
      usuarios ( nombre ),
      detalle_ventas ( tamaño_ml, tipo_frasco, cantidad, fragancias ( nombre ), productos ( nombre ) )
    `);

  if (error) return res.status(400).json({ error: error.message });

  let csv = '\uFEFFID Venta;Fecha;Vendedor;Articulo;Tamaño/Cantidad;Frasco;Metodo Pago;Total (Bs)\n';
  ventas.forEach(v => {
    const d = v.detalle_ventas[0];
    const fecha = new Date(v.fecha_hora).toLocaleString('es-BO');
    const vendedor = v.usuarios?.nombre || 'Desconocido';
    const nombreArt = d?.fragancias?.nombre || d?.productos?.nombre || 'Desconocido';
    const cant = d?.tamaño_ml || d?.cantidad || 0;
    csv += `"${v.id}";"${fecha}";"${vendedor}";"${nombreArt}";${cant};"${d?.tipo_frasco || 'Producto Vario'}";"${v.metodo_pago}";${v.total}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Michova_Completo.csv');
  res.status(200).send(csv);
});

// Enlace a los módulos separados
app.use('/usuarios', require('./routes/usuarios'));
app.use('/fragancias', require('./routes/fragancias'));
app.use('/frascos', require('./routes/frascos'));
app.use('/productos', require('./routes/productos'));
app.use('/ventas', require('./routes/ventas'));

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});