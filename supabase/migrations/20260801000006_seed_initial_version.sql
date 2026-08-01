-- Version active initiale. A ajuster (nouvelle ligne + is_active) lors de toute recalibration
-- du bareme (docs/SOURCE_MAPPING.md §1.1) ou du contenu des 45 items.

insert into public.assessment_versions (
  label,
  questionnaire_version,
  scoring_version,
  report_template_version,
  is_active
) values (
  'Lancement V0.2',
  'v0.2',
  'scoring-2026.08.0',
  'report-2026.08.0',
  true
);
