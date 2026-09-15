# Сила Леса — yaai workspace

This directory owns the project-specific research configuration and history for the external `yaai` engine.

Structure:

- `cases/silalesa-seo.json` — collection case definition;
- `presets/silalesa.json` — intent/query classification rules;
- `planners/silalesa.json` — Page Planner targets;
- `results/` — latest generated artifacts;
- `snapshots/silalesa-seo/` — dated research history and comparisons.

Run from a checkout of `yaai`:

```bash
node scripts/build-page-plan.mjs --workspace ../silalesa/research/yaai --case silalesa-seo
node scripts/snapshot-results.mjs --workspace ../silalesa/research/yaai --case silalesa-seo
node scripts/compare-snapshots.mjs --workspace ../silalesa/research/yaai --case silalesa-seo
```

Wordstat collection additionally requires Yandex API credentials in environment variables. Client data belongs here, not in the `yaai` engine repository.
