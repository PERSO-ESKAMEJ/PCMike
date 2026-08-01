(function bootApp(root) {
  const DATA = root.PCMData;
  const SCORING = root.PCMScoring;
  const STORAGE_KEY = "pcm-explorateur-classement-v2";
  const app = document.getElementById("app");
  const progressFill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");
  const importFile = document.getElementById("importFile");

  function defaultState() {
    return {
      version: 2,
      sectionIndex: 0,
      startedAt: new Date().toISOString(),
      answers: {
        rankings: {}
      }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaultState();
      }
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        answers: SCORING.normalizeAnswers(parsed.answers || {})
      };
    } catch (error) {
      console.warn("Impossible de charger la session locale.", error);
      return defaultState();
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function currentSection() {
    return DATA.QUESTIONNAIRE_SECTIONS[state.sectionIndex] || DATA.QUESTIONNAIRE_SECTIONS[0];
  }

  function scenariosForSection(section) {
    if (section.kind !== "scenarios") {
      return [];
    }
    return DATA.SCENARIO_ITEMS.filter((scenario) => section.scenarioSections.includes(scenario.section));
  }

  function getRanking(scenario) {
    return SCORING.uniqueValidRanking(state.answers.rankings[scenario.id], scenario);
  }

  function setRanking(scenarioId, ranking) {
    state.answers.rankings[scenarioId] = ranking;
    saveState();
    render();
  }

  function addOption(scenarioId, optionId, insertIndex) {
    const scenario = DATA.SCENARIO_ITEMS.find((item) => item.id === scenarioId);
    if (!scenario || !scenario.options.some((option) => option.id === optionId)) {
      return;
    }
    const ranking = getRanking(scenario).filter((id) => id !== optionId);
    const targetIndex = Number.isFinite(insertIndex) ? Math.max(0, Math.min(insertIndex, ranking.length)) : ranking.length;
    ranking.splice(targetIndex, 0, optionId);
    setRanking(scenarioId, ranking);
  }

  function removeOption(scenarioId, optionId) {
    const scenario = DATA.SCENARIO_ITEMS.find((item) => item.id === scenarioId);
    if (!scenario) {
      return;
    }
    setRanking(
      scenarioId,
      getRanking(scenario).filter((id) => id !== optionId)
    );
  }

  function moveOption(scenarioId, optionId, direction) {
    const scenario = DATA.SCENARIO_ITEMS.find((item) => item.id === scenarioId);
    if (!scenario) {
      return;
    }
    const ranking = getRanking(scenario);
    const index = ranking.indexOf(optionId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ranking.length) {
      return;
    }
    [ranking[index], ranking[nextIndex]] = [ranking[nextIndex], ranking[index]];
    setRanking(scenarioId, ranking);
  }

  function clearScenario(scenarioId) {
    const nextRankings = { ...state.answers.rankings };
    delete nextRankings[scenarioId];
    state.answers.rankings = nextRankings;
    saveState();
    render();
  }

  function setSection(index) {
    state.sectionIndex = Math.max(0, Math.min(DATA.QUESTIONNAIRE_SECTIONS.length - 1, index));
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderProgress(result) {
    const percent = result.progress.percent;
    progressFill.style.width = `${percent}%`;
    progressLabel.textContent = `${percent}%`;
  }

  function renderStepNav() {
    return `
      <nav class="step-nav" aria-label="Sections du test">
        ${DATA.QUESTIONNAIRE_SECTIONS.map((section, index) => `
          <button
            type="button"
            class="step-button ${index === state.sectionIndex ? "active" : ""}"
            data-section="${index}"
          >
            <span>${index + 1}</span>
            ${escapeHtml(section.title)}
          </button>
        `).join("")}
      </nav>
    `;
  }

  function renderIntro(result) {
    return `
      <section class="intro-layout">
        <div class="intro-copy">
          <p class="notice">
            Outil indépendant et non officiel. Les résultats sont des hypothèses de lecture, pas un diagnostic ni un profil PCM certifié.
          </p>
          <h2>Classe les réponses qui te ressemblent. Ignore celles qui ne te correspondent pas.</h2>
          <p>
            Chaque situation propose six réponses courtes, une par type de personnalité. Glisse seulement les réponses pertinentes dans ton classement, de la plus vraie à la moins vraie.
          </p>
          <div class="metric-row">
            <div>
              <strong>${result.progress.answeredCount}</strong>
              <span>situations classées</span>
            </div>
            <div>
              <strong>${DATA.TOTAL_SCENARIOS}</strong>
              <span>situations au total</span>
            </div>
            <div>
              <strong>${DATA.TOTAL_PROPOSITIONS}</strong>
              <span>propositions comparées</span>
            </div>
          </div>
          <div class="button-row">
            <button class="primary-button" type="button" data-action="next">Commencer</button>
            <button class="danger-button" type="button" data-action="reset">Effacer mes réponses</button>
          </div>
        </div>
        <div class="type-map" aria-label="Six types comparés">
          ${DATA.TYPES.map((type) => `
            <article class="type-token" style="--type-color:${type.color}">
              <strong>${escapeHtml(type.name)}</strong>
              <span>${escapeHtml(type.perception)} · ${escapeHtml(type.channel)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderOptionCard(option, scenario, rankedIndex, rankedTotal) {
    const ranked = Number.isFinite(rankedIndex);
    return `
      <article
        class="rank-option ${ranked ? "ranked" : ""}"
        draggable="true"
        data-drag-option="${scenario.id}|${option.id}"
        ${ranked ? `data-drop-before="${scenario.id}|${option.id}"` : ""}
      >
        ${ranked ? `<span class="rank-badge">${rankedIndex + 1}</span>` : ""}
        <div>
          <strong>${escapeHtml(option.text)}</strong>
        </div>
        <div class="option-actions">
          ${ranked ? `
            <button type="button" aria-label="Monter" data-move-up="${scenario.id}|${option.id}" ${rankedIndex === 0 ? "disabled" : ""}>↑</button>
            <button type="button" aria-label="Descendre" data-move-down="${scenario.id}|${option.id}" ${rankedIndex === rankedTotal - 1 ? "disabled" : ""}>↓</button>
            <button type="button" aria-label="Retirer" data-remove-option="${scenario.id}|${option.id}">Retirer</button>
          ` : `
            <button type="button" data-add-option="${scenario.id}|${option.id}">Ajouter</button>
          `}
        </div>
      </article>
    `;
  }

  function renderScenario(scenario, index) {
    const ranking = getRanking(scenario);
    const rankedOptions = ranking
      .map((optionId) => scenario.options.find((option) => option.id === optionId))
      .filter(Boolean);
    const unrankedOptions = scenario.options.filter((option) => !ranking.includes(option.id));
    const targetLabel = scenario.target === "phase" ? "Phase actuelle" : "Structure durable";
    const dimensionLabel =
      DATA.DIMENSION_META[scenario.dimension]?.label ||
      (scenario.dimension === "situations" ? "Situation" : "Synthèse");

    return `
      <article class="scenario-card">
        <div class="scenario-head">
          <div>
            <div class="question-meta">
              <span>${index + 1}</span>
              <span>${escapeHtml(targetLabel)}</span>
              <span>${escapeHtml(dimensionLabel)}</span>
            </div>
            <h3>${escapeHtml(scenario.title)}</h3>
            <p>${escapeHtml(scenario.prompt)}</p>
          </div>
          <button class="ghost-button" type="button" data-clear-scenario="${scenario.id}" ${ranking.length ? "" : "disabled"}>Vider</button>
        </div>

        <div class="ranking-workspace">
          <section class="rank-zone" data-rank-zone="${scenario.id}">
            <h4>Mon classement</h4>
            <p>Du plus vrai au moins vrai. Tu peux t'arrêter quand les propositions restantes ne te correspondent plus.</p>
            <div class="rank-list ${rankedOptions.length ? "" : "empty"}">
              ${rankedOptions.length
                ? rankedOptions.map((option, rankedIndex) => renderOptionCard(option, scenario, rankedIndex, rankedOptions.length)).join("")
                : `<div class="empty-drop">Dépose ici les réponses qui te ressemblent.</div>`}
            </div>
          </section>

          <section class="pool-zone" data-pool-zone="${scenario.id}">
            <h4>Propositions non classées</h4>
            <p>Celles laissées ici ne comptent pas dans le score.</p>
            <div class="pool-list">
              ${unrankedOptions.map((option) => renderOptionCard(option, scenario)).join("")}
            </div>
          </section>
        </div>
      </article>
    `;
  }

  function renderScenarioSection(section) {
    const scenarios = scenariosForSection(section);
    const answered = scenarios.filter((scenario) => getRanking(scenario).length > 0).length;
    return `
      <section class="section-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">${answered}/${scenarios.length} situations classées</p>
            <h2>${escapeHtml(section.title)}</h2>
          </div>
          <p>Glisse les réponses dans ton classement ou utilise Ajouter. Les cartes laissées non classées sont ignorées.</p>
        </div>
        <div class="scenario-list">
          ${scenarios.map(renderScenario).join("")}
        </div>
      </section>
    `;
  }

  function renderScoreBars(scores, title) {
    return `
      <section class="score-panel">
        <h3>${escapeHtml(title)}</h3>
        <div class="score-list">
          ${scores.map((type) => `
            <div class="score-row" style="--type-color:${type.color}">
              <span>${escapeHtml(type.name)}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${type.percent}%"></div></div>
              <strong>${type.percent}</strong>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderBuilding(result) {
    const visual = [...result.buildingOrder].slice(0, 6).reverse();
    return `
      <section class="building-panel">
        <h3>Immeuble hypothétique</h3>
        <div class="building">
          ${visual.map((type, index) => {
            const realIndex = visual.length - index - 1;
            const label = realIndex === 0 ? "Base probable" : `Étage ${realIndex + 1}`;
            return `
              <div class="floor" style="--type-color:${type.color}">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(type.name)}</strong>
                <em>${escapeHtml(type.perception)}</em>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderResults() {
    const result = SCORING.scoreAssessment(state.answers, DATA);
    const base = result.base;
    const phase = result.phase;
    return `
      <section class="results-layout">
        <div class="result-hero">
          <p class="notice">
            Lecture exploratoire non officielle. Les cartes non classées n'ont pas été comptées.
          </p>
          <div class="result-summary">
            <article style="--type-color:${base.color}">
              <span>Base probable</span>
              <strong>${escapeHtml(base.name)}</strong>
              <em>Confiance ${escapeHtml(result.confidence.base.label.toLowerCase())}</em>
            </article>
            <article style="--type-color:${phase.color}">
              <span>Phase probable</span>
              <strong>${escapeHtml(phase.name)}</strong>
              <em>Confiance ${escapeHtml(result.confidence.phase.label.toLowerCase())}</em>
            </article>
            <article>
              <span>Progression</span>
              <strong>${result.progress.percent}%</strong>
              <em>${result.progress.answeredCount}/${result.progress.total} situations · ${result.progress.rankedOptionsCount} cartes classées</em>
            </article>
          </div>
          ${result.warnings.length ? `
            <div class="warnings">
              ${result.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("")}
            </div>
          ` : ""}
        </div>

        <div class="results-grid">
          ${renderBuilding(result)}
          <section class="insight-panel" style="--type-color:${base.color}">
            <h3>Connexion efficace avec ta Base</h3>
            <dl>
              <div><dt>Perception</dt><dd>${escapeHtml(base.perception)}</dd></div>
              <div><dt>Partie</dt><dd>${escapeHtml(base.part)}</dd></div>
              <div><dt>Canal</dt><dd>${escapeHtml(base.channel)}</dd></div>
              <div><dt>Style utile</dt><dd>${escapeHtml(base.styleUse)}</dd></div>
            </dl>
            <p>${escapeHtml(base.advice)}</p>
          </section>
          <section class="insight-panel" style="--type-color:${phase.color}">
            <h3>Besoins à nourrir maintenant</h3>
            <ul>
              ${phase.needs.map((need) => `<li>${escapeHtml(need)}</li>`).join("")}
            </ul>
            <p>${escapeHtml(phase.advice)}</p>
          </section>
          <section class="insight-panel" style="--type-color:${phase.color}">
            <h3>Séquence de stress à surveiller</h3>
            <dl>
              <div><dt>Driver</dt><dd>${escapeHtml(phase.stress.driver)}</dd></div>
              <div><dt>Entrée</dt><dd>${escapeHtml(phase.stress.entry)}</dd></div>
              <div><dt>Mécanisme</dt><dd>${escapeHtml(phase.stress.mechanism)}</dd></div>
              <div><dt>Cave</dt><dd>${escapeHtml(phase.stress.cave)}</dd></div>
            </dl>
          </section>
          <section class="insight-panel">
            <h3>Phases vécues possibles</h3>
            <div class="candidate-list">
              ${result.phaseCandidates.map((candidate) => `
                <div style="--type-color:${candidate.color}">
                  <strong>${escapeHtml(candidate.name)}</strong>
                  <span>${escapeHtml(candidate.reason)}</span>
                </div>
              `).join("")}
            </div>
          </section>
          ${renderScoreBars(result.baseScores, "Scores de structure")}
          ${renderScoreBars(result.phaseScores, "Scores de Phase")}
        </div>

        <div class="button-row results-actions">
          <button class="primary-button" type="button" data-action="export">Exporter JSON</button>
          <button class="ghost-button" type="button" data-action="print">Imprimer / PDF</button>
          <button class="ghost-button" type="button" data-section="1">Revoir les classements</button>
        </div>
      </section>
    `;
  }

  function renderFooterNav() {
    const isFirst = state.sectionIndex === 0;
    const isLast = state.sectionIndex === DATA.QUESTIONNAIRE_SECTIONS.length - 1;
    return `
      <footer class="footer-nav">
        <button class="ghost-button" type="button" data-action="prev" ${isFirst ? "disabled" : ""}>Précédent</button>
        <button class="primary-button" type="button" data-action="next" ${isLast ? "disabled" : ""}>Suivant</button>
      </footer>
    `;
  }

  function render() {
    const result = SCORING.scoreAssessment(state.answers, DATA);
    const section = currentSection();
    renderProgress(result);

    let content = renderStepNav();
    if (section.kind === "intro") {
      content += renderIntro(result);
    } else if (section.kind === "scenarios") {
      content += renderScenarioSection(section);
    } else if (section.kind === "results") {
      content += renderResults();
    }
    content += renderFooterNav();
    app.innerHTML = content;
  }

  function exportJson() {
    const result = SCORING.scoreAssessment(state.answers, DATA);
    const payload = {
      exportedAt: new Date().toISOString(),
      tool: "Explorateur PCM non officiel",
      version: state.version,
      answers: state.answers,
      result: {
        base: result.base.id,
        phase: result.phase.id,
        baseScores: result.baseScores.map(({ id, raw, percent }) => ({ id, raw, percent })),
        phaseScores: result.phaseScores.map(({ id, raw, percent }) => ({ id, raw, percent })),
        confidence: result.confidence,
        warnings: result.warnings
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `explorateur-pcm-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importJson(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        state.answers = SCORING.normalizeAnswers(payload.answers || payload);
        state.sectionIndex = DATA.QUESTIONNAIRE_SECTIONS.length - 1;
        saveState();
        render();
      } catch (error) {
        window.alert("Le fichier JSON ne peut pas être importé.");
        console.error(error);
      } finally {
        importFile.value = "";
      }
    });
    reader.readAsText(file);
  }

  function resetAnswers() {
    if (!window.confirm("Effacer tous les classements enregistrés dans ce navigateur ?")) {
      return;
    }
    state = defaultState();
    saveState();
    render();
  }

  function parsePair(value) {
    const [scenarioId, optionId] = String(value || "").split("|");
    return { scenarioId, optionId };
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) {
      return;
    }
    if (target.dataset.section) {
      setSection(Number(target.dataset.section));
      return;
    }
    if (target.dataset.addOption) {
      const { scenarioId, optionId } = parsePair(target.dataset.addOption);
      addOption(scenarioId, optionId);
      return;
    }
    if (target.dataset.removeOption) {
      const { scenarioId, optionId } = parsePair(target.dataset.removeOption);
      removeOption(scenarioId, optionId);
      return;
    }
    if (target.dataset.moveUp) {
      const { scenarioId, optionId } = parsePair(target.dataset.moveUp);
      moveOption(scenarioId, optionId, -1);
      return;
    }
    if (target.dataset.moveDown) {
      const { scenarioId, optionId } = parsePair(target.dataset.moveDown);
      moveOption(scenarioId, optionId, 1);
      return;
    }
    if (target.dataset.clearScenario) {
      clearScenario(target.dataset.clearScenario);
      return;
    }

    const action = target.dataset.action;
    if (action === "next") {
      setSection(state.sectionIndex + 1);
    } else if (action === "prev") {
      setSection(state.sectionIndex - 1);
    } else if (action === "export") {
      exportJson();
    } else if (action === "print") {
      window.print();
    } else if (action === "import") {
      importFile.click();
    } else if (action === "reset") {
      resetAnswers();
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.id === "importFile") {
      importJson(target.files && target.files[0]);
    }
  });

  document.addEventListener("dragstart", (event) => {
    const option = event.target.closest("[data-drag-option]");
    if (!option) {
      return;
    }
    event.dataTransfer.setData("text/plain", option.dataset.dragOption);
    event.dataTransfer.effectAllowed = "move";
  });

  document.addEventListener("dragover", (event) => {
    if (event.target.closest("[data-rank-zone], [data-pool-zone], [data-drop-before]")) {
      event.preventDefault();
    }
  });

  document.addEventListener("drop", (event) => {
    const raw = event.dataTransfer.getData("text/plain");
    const { scenarioId, optionId } = parsePair(raw);
    if (!scenarioId || !optionId) {
      return;
    }

    const beforeTarget = event.target.closest("[data-drop-before]");
    const poolZone = event.target.closest("[data-pool-zone]");
    const rankZone = event.target.closest("[data-rank-zone]");

    event.preventDefault();

    if (poolZone && poolZone.dataset.poolZone === scenarioId) {
      removeOption(scenarioId, optionId);
      return;
    }

    if (beforeTarget) {
      const before = parsePair(beforeTarget.dataset.dropBefore);
      if (before.scenarioId !== scenarioId) {
        return;
      }
      if (before.optionId === optionId) {
        return;
      }
      const scenario = DATA.SCENARIO_ITEMS.find((item) => item.id === scenarioId);
      const ranking = getRanking(scenario).filter((id) => id !== optionId);
      const targetIndex = ranking.indexOf(before.optionId);
      addOption(scenarioId, optionId, targetIndex >= 0 ? targetIndex : ranking.length);
      return;
    }

    if (rankZone && rankZone.dataset.rankZone === scenarioId) {
      addOption(scenarioId, optionId);
    }
  });

  render();
})(window);
