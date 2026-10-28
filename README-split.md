# #4471 split — S01E03

The support kb export, with one page added: `src/routes/kb/incidents/4471-split/+page.svx`
(new logic in `src/lib/kb/split.ts` and `src/lib/kb/SplitTable.svelte`).

`rendered/4471-split.html` and `.png` show the page as the desk sees it (runbook layout,
counts computed from `reports-4471.json`).

Tickets: #1 parser (374 reports), #2 booking-v3 hint (33), #3 one-day shift (5).
