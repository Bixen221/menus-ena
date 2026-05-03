/**
 * api/vote.js — Endpoint POST /api/vote
 * Enregistre un vote dans Supabase.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // Autoriser uniquement POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { menus, commentaire, date } = req.body;

  // Validation : tous les jours doivent avoir un plat
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  for (const jour of jours) {
    if (!menus?.[jour]?.plat) {
      return res.status(400).json({ error: `Plat manquant pour ${jour}.` });
    }
  }

  // Insertion dans Supabase
  const { error } = await supabase
    .from('responses')
    .insert([{
      menus,
      commentaire: (commentaire || '').trim().substring(0, 2000),
      date: date || new Date().toISOString()
    }]);

  if (error) {
    console.error('Erreur Supabase:', error);
    return res.status(500).json({ error: 'Erreur base de données. Réessayez.' });
  }

  res.json({ success: true });
};
