const assert = require("node:assert/strict");
const DATA = require("./data.js");
const { scoreAssessment, getProgress } = require("./scoring.js");

function optionForType(scenario, typeId) {
  return scenario.options.find((option) => option.typeId === typeId).id;
}

function pureAnswers(baseType, phaseType = baseType) {
  const answers = { rankings: {} };

  DATA.SCENARIO_ITEMS.forEach((scenario) => {
    const typeId = scenario.target === "phase" ? phaseType : baseType;
    answers.rankings[scenario.id] = [optionForType(scenario, typeId)];
  });

  return answers;
}

function balancedAnswers() {
  const answers = { rankings: {} };
  const typeIds = DATA.TYPES.map((type) => type.id);
  const counters = { base: 0, phase: 0 };
  const limits = { base: 24, phase: 12 };

  DATA.SCENARIO_ITEMS.forEach((scenario) => {
    if (counters[scenario.target] >= limits[scenario.target]) {
      return;
    }
    const typeId = typeIds[counters[scenario.target] % typeIds.length];
    counters[scenario.target] += 1;
    answers.rankings[scenario.id] = [optionForType(scenario, typeId)];
  });

  return answers;
}

{
  const result = scoreAssessment(pureAnswers("analyseur"), DATA);
  assert.equal(result.base.id, "analyseur");
  assert.equal(result.phase.id, "analyseur");
  assert.equal(result.confidence.base.level, "haute");
  assert.equal(result.confidence.phase.level, "haute");
}

{
  const result = scoreAssessment(pureAnswers("empathique", "promoteur"), DATA);
  assert.equal(result.base.id, "empathique");
  assert.equal(result.phase.id, "promoteur");
}

{
  const result = scoreAssessment(balancedAnswers(), DATA);
  assert.equal(result.confidence.base.level, "faible");
}

{
  const answers = pureAnswers("perseverant", "energiseur");
  const exported = JSON.stringify({ answers });
  const imported = JSON.parse(exported);
  const before = scoreAssessment(answers, DATA);
  const after = scoreAssessment(imported.answers, DATA);
  assert.equal(after.base.id, before.base.id);
  assert.equal(after.phase.id, before.phase.id);
  assert.deepEqual(getProgress(imported.answers, DATA), getProgress(answers, DATA));
}

{
  const result = scoreAssessment({}, DATA);
  assert.ok(result.base);
  assert.ok(result.phase);
  assert.equal(result.progress.answeredCount, 0);
  assert.equal(result.confidence.base.level, "faible");
}

assert.equal(DATA.SCENARIO_ITEMS.length, 39);
assert.equal(DATA.TOTAL_SCENARIOS, 39);
assert.equal(DATA.TOTAL_PROPOSITIONS, 234);

DATA.SCENARIO_ITEMS.forEach((scenario) => {
  assert.equal(scenario.options.length, 6);
  assert.deepEqual(
    scenario.options.map((option) => option.typeId).sort(),
    DATA.TYPES.map((type) => type.id).sort()
  );
});

console.log("All ranking scoring tests passed.");
