const express = require('express');
const router = express.Router();
const supabase = require('../database');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('frascos').select('*').order('capacidad_ml', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { capacidad_ml, tipo, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('frascos').insert([{ capacidad_ml, tipo, stock, stock_minimo }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Frasco agregado', data });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { capacidad_ml, tipo, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('frascos').update({ capacidad_ml, tipo, stock, stock_minimo }).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Frasco actualizado', data });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('frascos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Frasco eliminado' });
});

module.exports = router;