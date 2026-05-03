/**
 * DONNÉES DES PLATS - ENA Menu Collector
 * Organisé par catégorie, basé sur la transcription officielle des plats sénégalais.
 * Pour modifier les plats, éditez cet objet directement.
 */

const PLATS_DATA = {
  "🍲 Bouillies": [
    "Fondé bassi (Bouillie de granulés de sorgho)",
    "Fondé dugub (Bouillie de granulés de mil)",
    "Fondé mbokh (Bouillie de granulés de maïs)",
    "Laaxu daxàr (Lakhou dakhar)",
    "Laaxu nèëri (Lakhou neuteuri)",
    "Laaxu soow (Lakhou sow)",
    "Mouhamsa soow (Mouhamsa au lait)",
    "Ruy (Bouillie de farine de mil)",
    "Sombi Céeb / Goci (Bouillie de riz au lait caillé)",
    "Sombi dugub (Bouillie de semoule de mil)",
    "Sombi mbokh (Bouillie de maïs)",
    "Sombi vermicelle (Bouillie de vermicelle)",
    "Sombi / Thiuraye gërté (Sombi guerté)"
  ],
  "🥔 Tubercules": [
    "Athiéké à la sénégalaise",
    "Fufu (Foufou)",
    "Rôti ñambi (Ragoût manioc)"
  ],
  "🥦 Légumineuses & Légumes": [
    "Lentilles yapp (Lentilles à la viande)",
    "Ndambé (Sauce niébé)",
    "Petits pois ganar (Petits pois poulet)",
    "Salade ordinaire",
    "Salatu ñebbe (Salade de niébé)"
  ],
  "🍚 Riz": [
    "C'bon",
    "Céebu ganar bu wéex (Riz gras poulet)",
    "Céebu géj (Thiebou guedj)",
    "Céebu jaga (Thiebou diaga)",
    "Céebu jën bu wéex (Thiebou dieune blanc)",
    "Céebu jën bu xonx (Thiebou dieune rouge)",
    "Céebu keccax bu wéex (Thiebou kéthiakh blanc)",
    "Céebu keccax bu xonx (Thiebou kéthiakh rouge)",
    "Céebu yapp (Riz gras viande)",
    "Céebu yapp bu xonx (Riz tomaté viande)",
    "Cù diw-tiir ganar (Thiou poulet à l'huile de palme)",
    "Cù diw-tiir jën (Thiou poisson à l'huile de palme)",
    "Cù diw-tiir yapp (Thiou viande à l'huile de palme)",
    "Cù ganar (Thiou poulet)",
    "Cù jën (Thiou poisson)",
    "Cù kari ganar (Thiou curry poulet)",
    "Cù kari jën (Thiou curry poisson)",
    "Cù kari yapp (Thiou curry viande)",
    "Cù yapp (Thiou viande)",
    "Daxin keccax (Dakhine kéthiakh)",
    "Daxin yapp (Dakhine viande)",
    "Domoda jën (Domoda poisson)",
    "Domoda yapp (Domoda viande)",
    "Étodié",
    "Futi (Fouty)",
    "Kaldu (Ragoût de poisson)",
    "Maafe folléré (Mafé à l'oseille)",
    "Maafe jën (Mafé poisson)",
    "Maafe yapp (Mafé viande)",
    "Mbaxal jën bu weex (Mbakhal poisson)",
    "Mbaxalu saalum (Mbakhal Saloum)",
    "Mbaxalu yapp (Mbakhal viande)",
    "Mboroxe (Sauce feuilles de manioc)",
    "Paella à la sénégalaise",
    "Plassas",
    "Riteufou / Dourang",
    "Sulluxu (Souloukhou)",
    "Suppu kanja (Sauce gombo)",
    "Yassa ganar (Yassa poulet)",
    "Yassa jën (Yassa poisson)",
    "Yaasa yapp (Yassa viande)"
  ],
  "🌾 Mil / Maïs / Fonio": [
    "Caakri dugub (Thiakry mil)",
    "Céeré baase yapp (Thiéré bassé viande)",
    "Céeré basi baase keccax (Thiéré bassé kéthiakh)",
    "Céeré mbuum (Thiéré mboum)",
    "Céeré méew (Thiéré au lait)",
    "Céeré ñebbe (Thiéré niébé)",
    "Céeré tallalé mbok jën (Thiéré maïs poisson)",
    "Céeré tam-xarit (Thiéré bomb)",
    "Céeré yapp (Thiéré viande)",
    "Couscous marocain viande à la sénégalaise",
    "Gar",
    "Laaxu caxàan / Ngurbàn (Lakhou thiakhane)",
    "Maafe fonio (Mafé fonio)",
    "Nélen (Niéleng)",
    "Nélen muud (Niéleng moud)",
    "Ngallàx (Ngalakh)",
    "Ñiiri bunaa (Gniri bouna)"
  ],
  "🍜 Soupes & Sauces": [
    "Fiirir (Poisson frit)",
    "Ngeubeu / Pépéssou (Soupe de poisson)",
    "Œuf surprise",
    "Poisson farcis à la Saint-Louisienne",
    "Poulet braisé",
    "Poulet sauté",
    "Sauce crevette",
    "Sup yapp (Soupe de viande)",
    "Touffé ganar",
    "Touffé yapp"
  ],
  "🍝 Pâtes": [
    "Maccaroni yapp (Maccaroni viande)",
    "Spaghetti bolognaise",
    "Spaghetti œufs",
    "Spaghetti viande",
    "Vermicelle poulet",
    "Vermicelle viande"
  ],
  "🥟 Beignets & Snacks": [
    "Akara (Beignets de niébé)",
    "Béñee coopati (Beignets de farine)",
    "Béñee dugub (Beignets de farine de mil)",
    "Fataya yapp (Fataya viande)",
    "Pastelles"
  ]
};

// Jours de la semaine
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Icônes pour les jours
const JOUR_ICONS = {
  'Lundi':    '🌅',
  'Mardi':    '☀️',
  'Mercredi': '🌤️',
  'Jeudi':    '🌞',
  'Vendredi': '🌆',
  'Samedi':   '🎉',
  'Dimanche': '😴'
};
