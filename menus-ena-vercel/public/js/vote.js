/**
 * vote.js — Logique du formulaire de vote ENA
 * Gère le stepper jour par jour, la soumission et l'anti-doublon.
 */

(function () {
  'use strict';

  /* ─── Config ──────────────────────────────────── */
  const STORAGE_KEY_VOTED = 'ena_menus_voted';   // clé anti-doublon
  const API_URL           = '/api/vote';          // endpoint backend

  /* ─── État ─────────────────────────────────────── */
  let currentStep = 0; // 0-6 = jours, 7 = commentaire, 8 = succès
  const TOTAL_STEPS = JOURS.length; // 7

  // Choix de l'utilisateur : { Lundi: { categorie, plat }, ... }
  const choices = {};

  /* ─── Utilitaires ──────────────────────────────── */
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  function hasAlreadyVoted() {
    return !!localStorage.getItem(STORAGE_KEY_VOTED);
  }

  function markAsVoted() {
    localStorage.setItem(STORAGE_KEY_VOTED, Date.now().toString());
  }

  function formatDate(isoStr) {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  /* ─── Rendu principal ──────────────────────────── */
  function render() {
    const main = $('#main-content');
    main.innerHTML = '';

    if (hasAlreadyVoted()) {
      renderAlreadyVoted(main);
      return;
    }

    if (currentStep === TOTAL_STEPS + 1) {
      renderSuccess(main);
      return;
    }

    // Barre de progression
    const pct = Math.round(((currentStep) / (TOTAL_STEPS + 1)) * 100);
    const progressWrap = el('div', 'progress-bar-wrap');
    progressWrap.innerHTML = `<div class="progress-bar-fill" style="width:${pct}%"></div>`;
    main.appendChild(progressWrap);

    // Stepper
    main.appendChild(buildStepper());

    if (currentStep < TOTAL_STEPS) {
      // Étape jour
      main.appendChild(buildDayCard(currentStep));
    } else {
      // Étape commentaire
      main.appendChild(buildCommentCard());
    }
  }

  /* ─── Stepper ──────────────────────────────────── */
  function buildStepper() {
    const stepper = el('div', 'stepper');

    JOURS.forEach((jour, idx) => {
      const isDone   = choices[jour] && choices[jour].plat;
      const isActive = currentStep === idx;

      const item = el('div', `step-item${isActive ? ' active' : ''}${isDone ? ' done' : ''}`);

      const dot = el('div', `step-dot${isActive ? ' active' : ''}${isDone ? ' done' : ''}`);
      if (!isDone) dot.textContent = idx + 1;
      item.appendChild(dot);

      const label = el('div', 'step-label', jour.substring(0, 3).toUpperCase());
      item.appendChild(label);

      // Clic pour naviguer vers un jour déjà rempli
      if (isDone || isActive) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          currentStep = idx;
          render();
        });
      }

      stepper.appendChild(item);

      // Ligne entre les dots
      if (idx < JOURS.length - 1) {
        const line = el('div', `step-line${isDone ? ' done' : ''}`);
        stepper.appendChild(line);
      }
    });

    return stepper;
  }

  /* ─── Carte jour ───────────────────────────────── */
  function buildDayCard(stepIndex) {
    const jour     = JOURS[stepIndex];
    const icon     = JOUR_ICONS[jour] || '🍽️';
    const saved    = choices[jour] || {};
    const isFirst  = stepIndex === 0;
    const isLast   = stepIndex === TOTAL_STEPS - 1;

    const card = el('div', 'card');

    // En-tête
    card.innerHTML = `
      <div class="card-day-header">
        <div class="day-icon">${icon}</div>
        <div>
          <div class="day-title">${jour}</div>
          <div class="day-subtitle">Jour ${stepIndex + 1} sur ${TOTAL_STEPS} — Choisissez votre plat de déjeuner</div>
        </div>
      </div>
    `;

    // Select catégorie
    const catGroup = el('div', 'field-group');
    catGroup.innerHTML = `
      <label>
        <span class="label-step">1</span>
        Catégorie de plat
      </label>
    `;

    const catSelect = el('select');
    catSelect.id = `cat-${jour}`;
    catSelect.innerHTML = '<option value="">— Choisir une catégorie —</option>';
    Object.keys(PLATS_DATA).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === saved.categorie) opt.selected = true;
      catSelect.appendChild(opt);
    });
    catGroup.appendChild(catSelect);
    card.appendChild(catGroup);

    // Select plat
    const platGroup = el('div', 'field-group');
    platGroup.innerHTML = `
      <label>
        <span class="label-step">2</span>
        Plat
      </label>
    `;

    const platSelect = el('select');
    platSelect.id = `plat-${jour}`;
    platSelect.disabled = !saved.categorie;
    platSelect.innerHTML = '<option value="">— D\'abord choisir une catégorie —</option>';

    if (saved.categorie && PLATS_DATA[saved.categorie]) {
      populatePlatSelect(platSelect, PLATS_DATA[saved.categorie], saved.plat);
    }

    platGroup.appendChild(platSelect);
    card.appendChild(platGroup);

    // Affichage sélection confirmée
    const confirmedDiv = el('div', `selected-display${saved.plat ? ' visible' : ''}`);
    confirmedDiv.id = `confirmed-${jour}`;
    confirmedDiv.innerHTML = `
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      <span id="confirmed-text-${jour}">${saved.plat || ''}</span>
    `;
    card.appendChild(confirmedDiv);

    // Boutons
    const navDiv = el('div', `nav-buttons${isFirst ? ' first-step' : ''}`);

    if (!isFirst) {
      const prevBtn = el('button', 'btn btn-secondary', '← Précédent');
      prevBtn.addEventListener('click', () => { currentStep--; render(); });
      navDiv.appendChild(prevBtn);
    }

    const nextBtn = el('button', `btn btn-primary${!saved.plat ? '' : ''}`, isLast ? 'Commentaire →' : 'Suivant →');
    nextBtn.id = `next-btn-${jour}`;
    if (!saved.plat) nextBtn.disabled = true;
    nextBtn.addEventListener('click', () => { currentStep++; render(); });
    navDiv.appendChild(nextBtn);

    card.appendChild(navDiv);

    // Événements
    catSelect.addEventListener('change', function () {
      const cat = this.value;
      platSelect.disabled = !cat;
      platSelect.innerHTML = cat
        ? '<option value="">— Choisir un plat —</option>'
        : '<option value="">— D\'abord choisir une catégorie —</option>';

      if (cat && PLATS_DATA[cat]) {
        populatePlatSelect(platSelect, PLATS_DATA[cat], null);
      }

      // Réinitialiser la sélection pour ce jour
      if (choices[jour]) choices[jour] = { categorie: cat, plat: '' };
      else choices[jour] = { categorie: cat, plat: '' };

      confirmedDiv.classList.remove('visible');
      nextBtn.disabled = true;
    });

    platSelect.addEventListener('change', function () {
      const plat = this.value;
      if (!plat) return;

      choices[jour] = { categorie: catSelect.value, plat };

      confirmedDiv.classList.add('visible');
      document.getElementById(`confirmed-text-${jour}`).textContent = plat;
      nextBtn.disabled = false;
    });

    return card;
  }

  function populatePlatSelect(select, plats, selectedPlat) {
    plats.forEach(plat => {
      const opt = document.createElement('option');
      opt.value = plat;
      opt.textContent = plat;
      if (plat === selectedPlat) opt.selected = true;
      select.appendChild(opt);
    });
  }

  /* ─── Carte commentaire ────────────────────────── */
  function buildCommentCard() {
    const card = el('div', 'card');

    card.innerHTML = `
      <div class="comment-header">
        <div class="comment-icon">💬</div>
        <div class="comment-title">Votre avis sur les menus</div>
        <div class="comment-subtitle">Cette étape est facultative</div>
      </div>
    `;

    // Résumé des choix
    const summaryTitle = el('div', 'section-title', '🗒️ Récapitulatif de votre semaine');
    card.appendChild(summaryTitle);

    const summaryGrid = el('div', 'summary-grid');
    JOURS.forEach(jour => {
      const item = el('div', `summary-item${!choices[jour]?.plat ? ' missing' : ''}`);
      item.innerHTML = `
        <span class="day-tag">${jour.substring(0, 3).toUpperCase()}</span>
        <span class="plat-name">${choices[jour]?.plat || 'Non sélectionné'}</span>
      `;
      summaryGrid.appendChild(item);
    });
    card.appendChild(summaryGrid);

    // Champ commentaire
    const fieldGroup = el('div', 'field-group mt-2');
    fieldGroup.innerHTML = `<label>Commentaires et suggestions</label>`;
    const textarea = el('textarea');
    textarea.id = 'comment-field';
    textarea.placeholder = 'Donnez votre avis, suggestions ou remarques sur les menus proposés…';
    textarea.rows = 5;
    fieldGroup.appendChild(textarea);
    card.appendChild(fieldGroup);

    // Boutons
    const navDiv = el('div', 'nav-buttons');

    const prevBtn = el('button', 'btn btn-secondary', '← Modifier');
    prevBtn.addEventListener('click', () => { currentStep--; render(); });
    navDiv.appendChild(prevBtn);

    const submitBtn = el('button', 'btn btn-success', '✅ Soumettre mon menu');
    submitBtn.addEventListener('click', handleSubmit);
    navDiv.appendChild(submitBtn);

    card.appendChild(navDiv);

    return card;
  }

  /* ─── Soumission ───────────────────────────────── */
  async function handleSubmit() {
    const commentaire = document.getElementById('comment-field')?.value?.trim() || '';

    // Vérifier que tous les jours sont remplis
    const manquants = JOURS.filter(j => !choices[j]?.plat);
    if (manquants.length > 0) {
      alert(`Veuillez sélectionner un plat pour : ${manquants.join(', ')}`);
      currentStep = JOURS.indexOf(manquants[0]);
      render();
      return;
    }

    const payload = {
      menus: choices,
      commentaire,
      date: new Date().toISOString()
    };

    try {
      const btn = document.querySelector('.btn-success');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Envoi en cours…'; }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erreur serveur');

      markAsVoted();
      currentStep = TOTAL_STEPS + 1;
      render();

    } catch (err) {
      console.error('Erreur soumission:', err);
      alert('❌ Une erreur est survenue. Vérifiez que le serveur est en marche et réessayez.');
      const btn = document.querySelector('.btn-success');
      if (btn) { btn.disabled = false; btn.textContent = '✅ Soumettre mon menu'; }
    }
  }

  /* ─── Écran succès ─────────────────────────────── */
  function renderSuccess(main) {
    const div = el('div', 'card success-screen');
    div.innerHTML = `
      <div class="success-icon">✅</div>
      <h2 class="success-title">Merci pour votre participation !</h2>
      <p class="success-text">
        Vos préférences de menus ont été enregistrées avec succès.<br>
        Vos choix contribuent à améliorer la restauration de l'ENA.
      </p>
      <a href="/stats.html" class="btn btn-secondary">
        📊 Voir les résultats
      </a>
    `;
    main.appendChild(div);
  }

  /* ─── Déjà voté ─────────────────────────────────── */
  function renderAlreadyVoted(main) {
    const div = el('div', 'voted-banner');
    div.innerHTML = `
      <div style="font-size:2.5rem">🎉</div>
      <h2>Vous avez déjà participé</h2>
      <p>Votre participation a déjà été enregistrée cette semaine. Merci !</p>
      <a href="/stats.html" class="btn btn-primary">
        📊 Voir les résultats
      </a>
    `;
    main.appendChild(div);

    // Option réinitialiser (pour admin/test)
    const resetNote = el('p', 'text-center text-muted mt-2');
    resetNote.innerHTML = `<small><a href="#" id="reset-link">Réinitialiser ma participation (test)</a></small>`;
    main.appendChild(resetNote);

    document.getElementById('reset-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Êtes-vous sûr de vouloir réinitialiser votre participation ?')) {
        localStorage.removeItem(STORAGE_KEY_VOTED);
        currentStep = 0;
        render();
      }
    });
  }

  /* ─── Init ──────────────────────────────────────── */
  render();

})();
