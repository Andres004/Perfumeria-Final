const express = require('express');
const router = express.Router();
const supabase = require('../database');

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('fragancias')
    .select('id, nombre, stock_ml, stock_minimo, precio_por_ml')
    .order('nombre', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { nombre, stock_ml, stock_minimo, precio_por_ml } = req.body;
  const { data, error } = await supabase
    .from('fragancias')
    .insert([{ nombre, precio_por_ml: precio_por_ml || 0, stock_ml, stock_minimo }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Fragancia agregada', data });
});

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('fragancias').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Fragancia eliminada' });
});

module.exports = router;