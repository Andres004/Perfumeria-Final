const express = require('express');
const router = express.Router();
const supabase = require('../database');

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, creado_en')
    .eq('rol', 'vendedor');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, password_hash: password, rol: rol || 'vendedor' }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Usuario registrado', data });
});

router.put('/password', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Acceso revocado' });
});

module.exports = router;