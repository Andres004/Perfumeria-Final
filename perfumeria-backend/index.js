require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.send('Servidor MICHOVA funcionando');
});

// ==========================================
// 1. AUTENTICACIÓN Y USUARIOS
// ==========================================

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

app.get('/usuarios', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, creado_en')
    .eq('rol', 'vendedor');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/usuarios', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, password_hash: password, rol: rol || 'vendedor' }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Usuario registrado', data });
});

app.put('/usuarios/password', async (req, res) => {
  const { usuario_id, password_actual, password_nueva } = req.body;
  try {
    const { data: usuario, error: errorVerificacion } = await supabase
      .from('usuarios').select('id').eq('id', usuario_id).eq('password_hash', password_actual).single();
    if (errorVerificacion || !usuario) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    const { error: errorUpdate } = await supabase
      .from('usuarios').update({ password_hash: password_nueva }).eq('id', usuario_id);
    if (errorUpdate) throw errorUpdate;
    res.json({ mensaje: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Acceso revocado' });
});

// ==========================================
// 2. GESTIÓN DE INVENTARIOS (FRAGANCIAS, FRASCOS, PRODUCTOS)
// ==========================================

// Fragancias
app.get('/fragancias', async (req, res) => {
  const { data, error } = await supabase
    .from('fragancias')
    .select('id, nombre, stock_ml, stock_minimo, precio_por_ml')
    .order('nombre', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/fragancias', async (req, res) => {
  const { nombre, stock_ml, stock_minimo, precio_por_ml } = req.body;
  const { data, error } = await supabase
    .from('fragancias')
    .insert([{ nombre, precio_por_ml: precio_por_ml || 0, stock_ml, stock_minimo }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Fragancia agregada', data });
});

app.put('/fragancias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, stock_ml, stock_minimo, precio_por_ml } = req.body;
  const { data, error } = await supabase
    .from('fragancias')
    .update({ nombre, stock_ml, stock_minimo, precio_por_ml })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Fragancia actualizada', data });
});

app.delete('/fragancias/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('fragancias').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Fragancia eliminada' });
});

// Frascos
app.get('/frascos', async (req, res) => {
  const { data, error } = await supabase.from('frascos').select('*').order('capacidad_ml', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/frascos', async (req, res) => {
  const { capacidad_ml, tipo, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('frascos').insert([{ capacidad_ml, tipo, stock, stock_minimo }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Frasco agregado', data });
});

app.put('/frascos/:id', async (req, res) => {
  const { id } = req.params;
  const { capacidad_ml, tipo, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('frascos').update({ capacidad_ml, tipo, stock, stock_minimo }).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Frasco actualizado', data });
});

app.delete('/frascos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('frascos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Frasco eliminado' });
});

// Productos Varios
app.get('/productos', async (req, res) => {
  const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/productos', async (req, res) => {
  const { nombre, precio, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('productos').insert([{ nombre, precio, stock, stock_minimo }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto agregado', data });
});

app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('productos').update({ nombre, precio, stock, stock_minimo }).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto actualizado', data });
});

app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto eliminado' });
});

// ==========================================
// 3. REGISTRO DE VENTAS (Y GOOGLE SHEETS)
// ==========================================

app.post('/ventas', async (req, res) => {
  const { tipo_venta, usuario_id, metodo_pago, total_calculado, fragancia_id, tamaño_ml, tipo_frasco, producto_id, cantidad } = req.body;

  try {
    let nombreArticuloParaExcel = '';
    let tamanoParaExcel = '';
    let frascoParaExcel = '';

    // LOGICA POR TIPO DE VENTA
    if (tipo_venta === 'perfume' || tipo_venta === 'esencia') {
      const { data: fragancia, error: errFrag } = await supabase.from('fragancias').select('stock_ml, nombre').eq('id', fragancia_id).single();
      if (errFrag || fragancia.stock_ml < tamaño_ml) return res.status(400).json({ error: 'Stock insuficiente de fragancia' });
      
      nombreArticuloParaExcel = fragancia.nombre;
      tamanoParaExcel = tamaño_ml;
      frascoParaExcel = tipo_venta === 'esencia' ? 'Solo Esencia' : tipo_frasco;

      let frasco = null;
      if (tipo_venta === 'perfume' && tipo_frasco !== 'Recarga') {
        const { data: frascoData, error: errFrasco } = await supabase.from('frascos').select('id, stock').eq('capacidad_ml', tamaño_ml).eq('tipo', tipo_frasco).single();
        if (errFrasco || !frascoData || frascoData.stock < 1) return res.status(400).json({ error: `Stock insuficiente de frasco ${tamaño_ml}ml ${tipo_frasco}` });
        frasco = frascoData;
      }

      // Descontar inventarios
      await supabase.from('fragancias').update({ stock_ml: fragancia.stock_ml - tamaño_ml }).eq('id', fragancia_id);
      if (frasco) {
        await supabase.from('frascos').update({ stock: frasco.stock - 1 }).eq('id', frasco.id);
      }

    } else if (tipo_venta === 'producto') {
      const { data: producto, error: errProd } = await supabase.from('productos').select('stock, nombre').eq('id', producto_id).single();
      if (errProd || producto.stock < cantidad) return res.status(400).json({ error: 'Stock insuficiente del producto' });
      
      nombreArticuloParaExcel = producto.nombre;
      tamanoParaExcel = cantidad;
      frascoParaExcel = 'Producto Vario';

      await supabase.from('productos').update({ stock: producto.stock - cantidad }).eq('id', producto_id);
    }

    // REGISTRO DE LA VENTA
    const { data: nuevaVenta, error: errorVenta } = await supabase
      .from('ventas').insert([{ usuario_id, total: total_calculado, metodo_pago }]).select().single();
    if (errorVenta) throw errorVenta;

    // REGISTRO DEL DETALLE
    const detallePayload = { venta_id: nuevaVenta.id };
    if (tipo_venta === 'perfume' || tipo_venta === 'esencia') {
      detallePayload.fragancia_id = fragancia_id;
      detallePayload.tamaño_ml = tamaño_ml;
      detallePayload.tipo_frasco = tipo_venta === 'esencia' ? 'Solo Esencia' : tipo_frasco;
    } else if (tipo_venta === 'producto') {
      detallePayload.producto_id = producto_id;
      detallePayload.cantidad = cantidad;
      detallePayload.tipo_frasco = 'Producto';
    }

    const { error: errorDetalle } = await supabase.from('detalle_ventas').insert([detallePayload]);
    if (errorDetalle) throw errorDetalle;

    // ENVIAR A GOOGLE SHEETS
    try {
      const { data: usuarioData } = await supabase.from('usuarios').select('nombre').eq('id', usuario_id).single();
      const nombreVendedor = usuarioData ? usuarioData.nombre : 'Admin';
      const fechaActual = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
      
      const datosParaExcel = {
        fecha: fechaActual,
        vendedor: nombreVendedor,
        perfume: nombreArticuloParaExcel,
        tamano: tamanoParaExcel,
        frasco: frascoParaExcel,
        pago: metodo_pago,
        total: total_calculado
      };

      const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxD2y94zSvM1B4b20AqR2fCiWzzV_hU6cW_sGpHCzjUgaioHSkt15xoCsUBC-aIlsIHxA/exec'; 
      fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify(datosParaExcel)
      }).catch(err => console.error("Error de red hacia Google:", err));

    } catch (errorExcel) {
      console.error("Fallo excel:", errorExcel);
    }

    res.json({ mensaje: 'Venta registrada con éxito', total: total_calculado });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/ventas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: detalle } = await supabase
      .from('detalle_ventas')
      .select('fragancia_id, tamaño_ml, tipo_frasco, producto_id, cantidad')
      .eq('venta_id', id)
      .single();

    if (detalle) {
      // Devolver fragancias y frascos
      if (detalle.fragancia_id) {
        const { data: fragancia } = await supabase.from('fragancias').select('stock_ml').eq('id', detalle.fragancia_id).single();
        if (fragancia) {
          await supabase.from('fragancias').update({ stock_ml: fragancia.stock_ml + detalle.tamaño_ml }).eq('id', detalle.fragancia_id);
        }
        if (detalle.tipo_frasco !== 'Recarga' && detalle.tipo_frasco !== 'Solo Esencia' && detalle.tipo_frasco !== 'Producto') {
          const { data: frasco } = await supabase.from('frascos').select('id, stock').eq('capacidad_ml', detalle.tamaño_ml).eq('tipo', detalle.tipo_frasco).single();
          if (frasco) {
            await supabase.from('frascos').update({ stock: frasco.stock + 1 }).eq('id', frasco.id);
          }
        }
      }
      // Devolver productos varios
      if (detalle.producto_id) {
        const { data: producto } = await supabase.from('productos').select('stock').eq('id', detalle.producto_id).single();
        if (producto) {
          await supabase.from('productos').update({ stock: producto.stock + detalle.cantidad }).eq('id', detalle.producto_id);
        }
      }
    }

    const { error } = await supabase.from('ventas').delete().eq('id', id);
    if (error) throw error;
    res.json({ mensaje: 'Venta eliminada y stock devuelto al inventario' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/ventas', async (req, res) => {
  const { error } = await supabase.from('ventas').delete().neq('metodo_pago', 'ESTE_PAGO_NO_EXISTE');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Historial de ventas borrado por completo' });
});

// ==========================================
// 5. REPORTES Y DASHBOARD
// ==========================================

app.get('/ventas', async (req, res) => {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      id, fecha_hora, total, metodo_pago,
      usuarios ( nombre ),
      detalle_ventas ( tamaño_ml, tipo_frasco, cantidad, fragancias ( nombre ), productos ( nombre ) )
    `)
    .order('fecha_hora', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
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

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});