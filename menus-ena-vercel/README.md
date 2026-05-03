# 🍽️ Menus ENA — Déploiement Vercel + Supabase

## Structure du projet

```
menus-ena-vercel/
├── api/
│   ├── vote.js      ← POST /api/vote
│   ├── stats.js     ← GET /api/stats
│   └── export.js    ← GET /api/export
├── public/
│   ├── index.html
│   ├── stats.html
│   ├── css/style.css
│   └── js/
│       ├── data.js
│       ├── vote.js
│       └── stats.js
├── vercel.json
├── package.json
└── README.md
```

---

## 🚀 Déploiement

### 1. Supabase (base de données)

Dans le **SQL Editor** de Supabase, exécutez :

```sql
-- Créer la table
CREATE TABLE responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT now(),
  menus JSONB NOT NULL,
  commentaire TEXT DEFAULT ''
);

-- Désactiver RLS (données anonymes, pas de sécurité requise)
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
```

### 2. GitHub

1. Créez un compte sur [github.com](https://github.com)
2. Créez un nouveau dépôt (repository) nommé `menus-ena`
3. Uploadez tous les fichiers de ce dossier

### 3. Vercel

1. Allez sur [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Cliquez **Add New Project** → importez votre dépôt `menus-ena`
3. Avant de déployer, ajoutez les variables d'environnement :

| Nom | Valeur |
|-----|--------|
| `SUPABASE_URL` | `https://tfolujkhduqbrlhbrjqp.supabase.co` |
| `SUPABASE_ANON_KEY` | votre clé anon |

4. Cliquez **Deploy** 🚀

Vercel vous donnera une URL comme : `https://menus-ena.vercel.app`

---

## 🔧 Modifier les plats

Éditez `public/js/data.js`, puis re-déposez le fichier sur GitHub → Vercel redéploie automatiquement.
