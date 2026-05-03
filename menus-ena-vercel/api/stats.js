/**
 * api/stats.js — Endpoint GET /api/stats
 * Calcule et retourne les statistiques agrégées depuis Supabase.
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

  // Récupérer toutes les réponses
  const { data: responses, error } = await supabase
    .from('responses')
    .select('menus, commentaire, date')
    .order('date', { ascending: false });

  if (error) {
    console.error('Erreur Supabase:', error);
    return res.status(500).json({ error: 'Erreur base de données.' });
  }

  const total = responses.length;
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Agrégation par jour : { Lundi: { "Ceebu jën": 5, ... }, ... }
  const byDay = {};
  jours.forEach(j => { byDay[j] = {}; });

  // Agrégation par catégorie
  const byCategory = {};

  // Commentaires non vides
  const commentaires = [];

  responses.forEach(r => {
    jours.forEach(jour => {
      const m = r.menus?.[jour];
      if (m?.plat) {
        byDay[jour][m.plat] = (byDay[jour][m.plat] || 0) + 1;
      }
      if (m?.categorie) {
        byCategory[m.categorie] = (byCategory[m.categorie] || 0) + 1;
      }
    });

    if (r.commentaire) {
      commentaires.push({ texte: r.commentaire, date: r.date });
    }
  });

  res.json({ total, byDay, byCategory, commentaires });
};
