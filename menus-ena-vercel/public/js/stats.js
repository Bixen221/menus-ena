/**
 * stats.js — Tableau de bord des statistiques ENA
 * Récupère les données depuis l'API et génère les visualisations.
 */

(function () {
  'use strict';

  const API_URL = '/api/stats';
  let globalData = null;
  let activeDay  = 'Tous';
  let activeCat  = 'Toutes';

  /* ─── Init ─────────────────────────────────────── */
  async function init() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur serveur');
      globalData = await res.json();
      renderDashboard(globalData);
    } catch (err) {
      document.getElementById('stats-content').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Impossible de charger les données</h3>
          <p>Vérifiez que le serveur est en cours d'exécution (node server.js).</p>
          <p style="margin-top:.5rem; font-size:.8rem; color:var(--text-muted)">${err.message}</p>
        </div>`;
    }
  }

  /* ─── Rendu principal ──────────────────────────── */
  function renderDashboard(data) {
    const main = document.getElementById('stats-content');
    main.innerHTML = '';

    if (data.total === 0) {
      main.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>Aucune réponse pour l'instant</h3>
          <p>Partagez le lien aux étudiants pour collecter des votes.</p>
          <a href="/" class="btn btn-primary mt-2">Aller voter</a>
        </div>`;
      return;
    }

    // 1. Statistiques rapides
    main.appendChild(buildSummaryCards(data));

    // 2. Top plats
    main.appendChild(buildTopDishes(data));

    // 3. Répartition par catégorie
    main.appendChild(buildCategoryChart(data));

    // 4. Analyse par jour
    main.appendChild(buildDayAnalysis(data));

    // 5. Commentaires
    if (data.commentaires && data.commentaires.length > 0) {
      main.appendChild(buildComments(data.commentaires));
    }

    // 6. Bouton export
    main.appendChild(buildExportBtn());
  }

  /* ─── Cartes résumé ─────────────────────────────── */
  function buildSummaryCards(data) {
    const wrap = document.createElement('div');

    const cats = Object.keys(PLATS_DATA);
    const topCat = Object.entries(data.byCategory)
      .sort((a, b) => b[1] - a[1])[0];

    const topDay = Object.entries(data.byDay)
      .map(([jour, plats]) => [jour, Object.values(plats).reduce((s, v) => s + v, 0)])
      .sort((a, b) => b[1] - a[1])[0];

    // Nombre de plats distincts sélectionnés
    const allPlats = new Set();
    Object.values(data.byDay).forEach(plats => Object.keys(plats).forEach(p => allPlats.add(p)));

    wrap.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-number">${data.total}</div>
          <div class="stat-label">Participations</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${allPlats.size}</div>
          <div class="stat-label">Plats différents</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="font-size:1.1rem">${topDay ? topDay[0].substring(0,3) : '—'}</div>
          <div class="stat-label">Jour le + actif</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="font-size:0.85rem;line-height:1.3">${topCat ? topCat[0].replace(/^.{1,3} /, '') : '—'}</div>
          <div class="stat-label">Catégorie phare</div>
        </div>
      </div>`;

    return wrap;
  }

  /* ─── Top plats ─────────────────────────────────── */
  function buildTopDishes(data) {
    const section = document.createElement('div');
    section.innerHTML = `<h2 class="section-title">🏆 Plats les plus choisis</h2>`;

    // Agréger tous les votes par plat
    const platCounts = {};
    Object.values(data.byDay).forEach(plats => {
      Object.entries(plats).forEach(([plat, count]) => {
        platCounts[plat] = (platCounts[plat] || 0) + count;
      });
    });

    const sorted = Object.entries(platCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const maxCount = sorted[0]?.[1] || 1;
    const total    = data.total * 7; // votes totaux (7 jours)

    const card = document.createElement('div');
    card.className = 'chart-wrap';

    const list = document.createElement('ul');
    list.className = 'top-dish-list';

    sorted.forEach(([plat, count], idx) => {
      const pct       = Math.round((count / total) * 100);
      const barWidth  = Math.round((count / maxCount) * 100);
      const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';

      const li = document.createElement('li');
      li.className = 'top-dish-item';
      li.innerHTML = `
        <div class="rank-badge ${rankClass}">${idx + 1}</div>
        <div>
          <div style="font-size:.875rem;font-weight:600;color:var(--dark);line-height:1.3">${plat}</div>
          <div class="dish-bar-wrap mt-1" style="width:100%;min-width:60px">
            <div class="dish-bar-fill" style="width:${barWidth}%"></div>
          </div>
        </div>
        <div class="dish-count">${count} vote${count > 1 ? 's' : ''}</div>
        <div class="dish-pct">${pct}%</div>
      `;
      list.appendChild(li);
    });

    card.appendChild(list);
    section.appendChild(card);
    return section;
  }

  /* ─── Répartition par catégorie ─────────────────── */
  function buildCategoryChart(data) {
    const section = document.createElement('div');
    section.innerHTML = `<h2 class="section-title">🥘 Répartition par catégorie</h2>`;

    const card = document.createElement('div');
    card.className = 'chart-wrap';

    const canvas = document.createElement('canvas');
    canvas.id = 'cat-chart';
    card.appendChild(canvas);
    section.appendChild(card);

    // Construire les données
    const cats    = Object.keys(data.byCategory).filter(c => data.byCategory[c] > 0);
    const counts  = cats.map(c => data.byCategory[c]);
    const total   = counts.reduce((s, v) => s + v, 0) || 1;

    const colors = [
      '#C85C2A','#F2A65A','#2D6A4F','#52B788','#8B4513',
      '#D2691E','#A0522D','#6B8E23','#228B22','#3CB371'
    ];

    // Rendre le canvas disponible avant de créer le chart
    requestAnimationFrame(() => {
      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: cats.map(c => c.replace(/^.{1,3} /, '')), // retirer l'emoji
          datasets: [{
            data: counts,
            backgroundColor: colors.slice(0, cats.length),
            borderWidth: 2,
            borderColor: '#fff',
            hoverBorderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Nunito', size: 12 },
                padding: 12,
                boxWidth: 14
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const pct = Math.round((ctx.parsed / total) * 100);
                  return ` ${ctx.label} : ${ctx.parsed} vote${ctx.parsed > 1 ? 's' : ''} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    });

    return section;
  }

  /* ─── Analyse par jour ──────────────────────────── */
  function buildDayAnalysis(data) {
    const section = document.createElement('div');
    section.innerHTML = `<h2 class="section-title">📅 Analyse par jour</h2>`;

    // Onglets jours
    const tabs = document.createElement('div');
    tabs.className = 'filter-tabs';

    const allTab = document.createElement('button');
    allTab.className = `tab-btn${activeDay === 'Tous' ? ' active' : ''}`;
    allTab.textContent = 'Vue globale';
    allTab.addEventListener('click', () => {
      activeDay = 'Tous';
      section.replaceWith(buildDayAnalysis(data));
    });
    tabs.appendChild(allTab);

    JOURS.forEach(jour => {
      const tab = document.createElement('button');
      tab.className = `tab-btn${activeDay === jour ? ' active' : ''}`;
      tab.textContent = jour.substring(0, 3);
      tab.addEventListener('click', () => {
        activeDay = jour;
        section.replaceWith(buildDayAnalysis(data));
      });
      tabs.appendChild(tab);
    });

    section.appendChild(tabs);

    // Contenu
    const card = document.createElement('div');
    card.className = 'chart-wrap';

    if (activeDay === 'Tous') {
      // Graphique à barres : top 8 plats pour chaque jour (stacked ou grouped)
      const canvas = document.createElement('canvas');
      canvas.id = 'day-chart';
      card.appendChild(canvas);

      const jourLabels = JOURS.map(j => j.substring(0, 3));
      const topPlatsByDay = JOURS.map(jour => {
        const plats = data.byDay[jour] || {};
        const sorted = Object.entries(plats).sort((a, b) => b[1] - a[1]);
        return sorted[0] ? `${sorted[0][0].split('(')[0].trim().substring(0, 18)}` : '—';
      });
      const votesPerDay = JOURS.map(jour => {
        const plats = data.byDay[jour] || {};
        return Object.values(plats).reduce((s, v) => s + v, 0);
      });

      requestAnimationFrame(() => {
        new Chart(canvas, {
          type: 'bar',
          data: {
            labels: jourLabels,
            datasets: [{
              label: 'Votes par jour',
              data: votesPerDay,
              backgroundColor: 'rgba(200,92,42,0.8)',
              borderColor: '#C85C2A',
              borderWidth: 1.5,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  afterLabel: (ctx) => `Top : ${topPlatsByDay[ctx.dataIndex]}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, font: { family: 'Nunito' } },
                grid: { color: 'rgba(0,0,0,0.05)' }
              },
              x: { ticks: { font: { family: 'Nunito', weight: '700' } } }
            }
          }
        });
      });

    } else {
      // Détail d'un jour spécifique
      const platsCeJour = data.byDay[activeDay] || {};
      const sorted = Object.entries(platsCeJour).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const totalJour = sorted.reduce((s, [, c]) => s + c, 0) || 1;

      if (sorted.length === 0) {
        card.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>Aucun vote pour ${activeDay}.</p></div>`;
      } else {
        const canvas = document.createElement('canvas');
        canvas.id = `day-detail-chart`;
        card.appendChild(canvas);

        requestAnimationFrame(() => {
          new Chart(canvas, {
            type: 'bar',
            data: {
              labels: sorted.map(([p]) => p.split('(')[0].trim().substring(0, 22)),
              datasets: [{
                label: 'Votes',
                data: sorted.map(([, c]) => c),
                backgroundColor: sorted.map((_, i) => i === 0 ? '#C85C2A' : 'rgba(200,92,42,0.5)'),
                borderRadius: 6
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => {
                      const pct = Math.round((ctx.parsed.x / totalJour) * 100);
                      return ` ${ctx.parsed.x} vote${ctx.parsed.x > 1 ? 's' : ''} (${pct}%)`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: { stepSize: 1, font: { family: 'Nunito' } },
                  grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: { ticks: { font: { family: 'Nunito', size: 11 } } }
              }
            }
          });
        });
      }
    }

    section.appendChild(card);
    return section;
  }

  /* ─── Commentaires ──────────────────────────────── */
  function buildComments(commentaires) {
    const section = document.createElement('div');
    section.innerHTML = `<h2 class="section-title">💬 Commentaires des étudiants</h2>`;

    const list = document.createElement('div');
    list.className = 'comment-list';

    commentaires.slice().reverse().forEach(({ texte, date }) => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <div>${escapeHtml(texte)}</div>
        <div class="comment-date">${formatDate(date)}</div>
      `;
      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  /* ─── Export ─────────────────────────────────────── */
  function buildExportBtn() {
    const div = document.createElement('div');
    div.className = 'text-center mt-3';
    div.innerHTML = `
      <a href="/api/export" class="btn btn-secondary" download="ena-menus-export.json">
        ⬇️ Exporter les données (JSON)
      </a>
    `;
    return div;
  }

  /* ─── Utilitaires ───────────────────────────────── */
  function formatDate(isoStr) {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ─── Lancement ─────────────────────────────────── */
  init();

})();
