const express = require('express');
const router = express.Router();
const supabase = require('../database');

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
  const { tipo_venta, usuario_id, metodo_pago, total_calculado, fragancia_id, tamaño_ml, tipo_frasco, producto_id, cantidad } = req.body;

  try {
    let nombreArticuloParaExcel = '';
    let tamanoParaExcel = '';
    let frascoParaExcel = '';

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

    const { data: nuevaVenta, error: errorVenta } = await supabase
      .from('ventas').insert([{ usuario_id, total: total_calculado, metodo_pago }]).select().single();
    if (errorVenta) throw errorVenta;

    const detallePayload = { venta_id: nuevaVenta.id };
    if (tipo_venta === 'perfume' || tipo_venta === 'esencia') {
      detallePayload.fragancia_id = fragancia_id;
      detallePayload.tamaño_ml = tamaño_ml;
      detallePayload.tipo_frasco = tipo_venta === 'esencia' ? 'Solo Esencia' : tipo_frasco;
      detallePayload.precio_frasco = (tipo_venta === 'esencia' || tipo_frasco === 'Recarga') ? 0 : (tipo_frasco === 'Premium' ? 50 : 15);
    } else if (tipo_venta === 'producto') {
      detallePayload.producto_id = producto_id;
      detallePayload.cantidad = cantidad;
      detallePayload.tipo_frasco = 'Producto';
      detallePayload.precio_frasco = 0;
    }

    const { error: errorDetalle } = await supabase.from('detalle_ventas').insert([detallePayload]);
    if (errorDetalle) throw errorDetalle;

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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: detalle } = await supabase
      .from('detalle_ventas')
      .select('fragancia_id, tamaño_ml, tipo_frasco, producto_id, cantidad')
      .eq('venta_id', id)
      .single();

    if (detalle) {
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

router.delete('/', async (req, res) => {
  const { error } = await supabase.from('ventas').delete().neq('metodo_pago', 'ESTE_PAGO_NO_EXISTE');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Historial de ventas borrado por completo' });
});

module.exports = router;