<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket, type Problem } from '#lib/kb/split';

  // tickets: problem → link to the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const intake = (g: { reports: Report[] }) =>
    Object.entries(g.reports.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}))
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const label = (href: string) => href.replace(/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\//, '#');
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket}
  ({split.rows} rows in the export; {split.rows - split.merged.length} came twice) ·
  <strong>{split.groups.length}</strong> {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tagged</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><b>{PROBLEMS[g.problem].title}</b><br /><span class="what">{PROBLEMS[g.problem].what}</span></td>
        <td class="n">{g.reports.length}</td>
        <td class="tags">{intake(g)}</td>
        <td class="n">{g.tenants}</td>
        <td class="seen">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{label(tickets[g.problem] ?? '')}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what, .tags { color: var(--muted); font-size: 0.85em; }
  .n { text-align: right; font-variant-numeric: tabular-nums; }
  .seen { white-space: nowrap; font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
