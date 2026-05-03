/**
 * api/export.js — Endpoint GET /api/export
 * Télécharge toutes les données brutes en JSON.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { data: responses, error } = await supabase
    .from('responses')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    return res.status(500).json({ error: 'Erreur base de données.' });
  }

  const date = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="ena-menus-${date}.json"`);
  res.json({ total: responses.length, responses });
};
