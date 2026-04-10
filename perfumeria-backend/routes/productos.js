const express = require('express');
const router = express.Router();
const supabase = require('../database');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { nombre, precio, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('productos').insert([{ nombre, precio, stock, stock_minimo }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto agregado', data });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, stock_minimo } = req.body;
  const { data, error } = await supabase.from('productos').update({ nombre, precio, stock, stock_minimo }).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto actualizado', data });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Producto eliminado' });
});

module.exports = router;