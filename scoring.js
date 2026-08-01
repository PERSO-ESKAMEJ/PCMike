(function attachScoring(root) {
  const RANK_WEIGHTS = [6, 4, 2.5, 1.5, 0.75, 0.25];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeAnswers(answers) {
    const source = answers && typeof answers === "object" ? answers : {};
    return {
      rankings:
        source.rankings && typeof source.rankings === "object" && !Array.isArray(source.rankings)
          ? source.rankings
          : {}
    };
  }

  function createScoreMap(types) {
    return Object.fromEntries(types.map((type) => [type.id, 0]));
  }

  function addScore(scoreMap, typeId, amount) {
    if (Object.prototype.hasOwnProperty.call(scoreMap, typeId) && Number.isFinite(amount)) {
      scoreMap[typeId] += amount;
    }
  }

  function uniqueValidRanking(rawRanking, scenario) {
    if (!Array.isArray(rawRanking)) {
      return [];
    }
    const validOptionIds = new Set(scenario.options.map((option) => option.id));
    const seen = new Set();
    return rawRanking.filter((optionId) => {
      if (!validOptionIds.has(optionId) || seen.has(optionId)) {
        return false;
      }
      seen.add(optionId);
      return true;
    });
  }

  function rankScores(scoreMap, types) {
    const values = types.map((type) => scoreMap[type.id] || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;

    return types
      .map((type) => ({
        ...type,
        raw: Number((scoreMap[type.id] || 0).toFixed(3)),
        percent: spread === 0 ? 50 : Math.round(((scoreMap[type.id] - min) / spread) * 100)
      }))
      .sort((a, b) => b.raw - a.raw);
  }

  function confidenceFrom(ranked, answeredRatio, topSelfTypeId) {
    if (!ranked.length || answeredRatio <= 0) {
      return { value: 0, level: "faible", label: "Faible" };
    }

    const top = ranked[0].raw;
    const second = ranked[1] ? ranked[1].raw : top;
    const min = ranked[ranked.length - 1].raw;
    const spread = Math.max(1, top - min);
    const gapRatio = clamp((top - second) / spread, 0, 1);
    let value = clamp(0.24 + gapRatio * 0.76, 0, 1);

    value *= clamp(answeredRatio, 0.35, 1);

    if (topSelfTypeId && !ranked.slice(0, 2).some((candidate) => candidate.id === topSelfTypeId)) {
      value *= 0.82;
    }

    const level = value >= 0.72 ? "haute" : value >= 0.5 ? "moyenne" : "faible";
    return {
      value: Number(value.toFixed(2)),
      level,
      label: level.charAt(0).toUpperCase() + level.slice(1)
    };
  }

  function getProgress(inputAnswers, data) {
    const answers = normalizeAnswers(inputAnswers);
    const scenarios = data.SCENARIO_ITEMS || [];
    const answeredCount = scenarios.filter((scenario) => uniqueValidRanking(answers.rankings[scenario.id], scenario).length > 0).length;
    const rankedOptionsCount = scenarios.reduce(
      (sum, scenario) => sum + uniqueValidRanking(answers.rankings[scenario.id], scenario).length,
      0
    );
    const total = scenarios.length;

    return {
      answeredCount,
      total,
      rankedOptionsCount,
      totalOptions: data.TOTAL_PROPOSITIONS || scenarios.reduce((sum, scenario) => sum + scenario.options.length, 0),
      percent: total ? Math.round((answeredCount / total) * 100) : 0
    };
  }

  function scoreAssessment(inputAnswers, dataInput) {
    const data = dataInput || root.PCMData;
    if (!data) {
      throw new Error("PCM data is required before scoring.");
    }

    const answers = normalizeAnswers(inputAnswers || {});
    const baseScoreMap = createScoreMap(data.TYPES);
    const phaseScoreMap = createScoreMap(data.TYPES);
    const contributions = [];
    const rankedByType = createScoreMap(data.TYPES);
    let topSelfTypeId = null;

    data.SCENARIO_ITEMS.forEach((scenario) => {
      const ranking = uniqueValidRanking(answers.rankings[scenario.id], scenario);
      if (scenario.id === data.RANKING_PROMPT.id && ranking.length) {
        const firstOption = scenario.options.find((option) => option.id === ranking[0]);
        topSelfTypeId = firstOption ? firstOption.typeId : null;
      }

      ranking.forEach((optionId, index) => {
        const option = scenario.options.find((candidate) => candidate.id === optionId);
        if (!option) {
          return;
        }
        const rankWeight = RANK_WEIGHTS[index] || 0.1;
        const dimensionWeight = Number.isFinite(option.weight) ? option.weight : scenario.weight || 1;
        const evidence = rankWeight * dimensionWeight;
        const targetMap = scenario.target === "phase" ? phaseScoreMap : baseScoreMap;

        addScore(targetMap, option.typeId, evidence);
        addScore(rankedByType, option.typeId, 1);
        contributions.push({
          scenarioId: scenario.id,
          optionId,
          typeId: option.typeId,
          target: scenario.target,
          rank: index + 1,
          evidence: Number(evidence.toFixed(3))
        });
      });
    });

    const progress = getProgress(answers, data);
    const answeredRatio = progress.total ? progress.answeredCount / progress.total : 0;
    const baseScores = rankScores(baseScoreMap, data.TYPES);
    const phaseScores = rankScores(phaseScoreMap, data.TYPES);
    const baseConfidence = confidenceFrom(baseScores, answeredRatio, topSelfTypeId);
    const phaseConfidence = confidenceFrom(phaseScores, answeredRatio, null);

    const warnings = [];
    if (answeredRatio < 0.65) {
      warnings.push("Résultat provisoire : plusieurs situations ne sont pas encore classées.");
    }
    if (baseScores[1] && baseScores[0].raw - baseScores[1].raw < 7) {
      warnings.push("La Base est proche d'un autre type : lire les deux premiers candidats ensemble.");
    }
    if (phaseScores[1] && phaseScores[0].raw - phaseScores[1].raw < 7) {
      warnings.push("La Phase actuelle est proche d'un autre besoin : vérifier le contexte de vie récent.");
    }
    if (topSelfTypeId && !baseScores.slice(0, 2).some((type) => type.id === topSelfTypeId)) {
      warnings.push("Le classement global final ne confirme pas le score principal : la confiance est réduite.");
    }

    const phaseCandidates = phaseScores
      .filter((candidate, index) => index < 3 && (index === 0 || phaseScores[0].raw - candidate.raw <= 12))
      .map((candidate) => ({
        ...candidate,
        reason: candidate.id === phaseScores[0].id ? "Phase la plus probable" : "Phase proche ou vécue possible"
      }));

    return {
      progress,
      contributions,
      rankedByType,
      baseScores,
      phaseScores,
      base: baseScores[0],
      phase: phaseScores[0],
      phaseCandidates,
      buildingOrder: baseScores,
      confidence: {
        base: baseConfidence,
        phase: phaseConfidence,
        global: {
          value: Number(((baseConfidence.value + phaseConfidence.value) / 2).toFixed(2)),
          level:
            (baseConfidence.value + phaseConfidence.value) / 2 >= 0.72
              ? "haute"
              : (baseConfidence.value + phaseConfidence.value) / 2 >= 0.5
                ? "moyenne"
                : "faible",
          label:
            (baseConfidence.value + phaseConfidence.value) / 2 >= 0.72
              ? "Haute"
              : (baseConfidence.value + phaseConfidence.value) / 2 >= 0.5
                ? "Moyenne"
                : "Faible"
        }
      },
      warnings,
      isComplete: progress.percent >= 98
    };
  }

  const PCMScoring = {
    RANK_WEIGHTS,
    clamp,
    normalizeAnswers,
    uniqueValidRanking,
    getProgress,
    scoreAssessment
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PCMScoring;
  }
  root.PCMScoring = PCMScoring;
})(typeof window !== "undefined" ? window : globalThis);
