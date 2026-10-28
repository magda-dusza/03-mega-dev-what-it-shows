// Splitting a merged ticket into the problems it really holds. Pages explain it; this file is what runs.
//
// causes.ts tells `parser` from `hint` by tenant and channel. It has no word for a third problem the
// desk itself noted (desk-notes.json, `oneDayMove`): a date moved by one day, not a day and month
// swapped. causes.ts files those under their tenant's cause and footnotes them. Here they are a
// problem of their own, because a day/month fix will not move them back.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

export const PROBLEMS: Record<Problem, { title: string; what: string }> = {
  parser: {
    title: 'Shared parser reads day-first dates month first',
    what: 'Day and month swapped on invites and reminders for day-first tenants (app, email, booking-v2 form).',
  },
  hint: {
    title: 'booking-v3 form hint says MM/DD/YYYY to day-first tenants',
    what: 'People type what the hint says, month first; the form reads it day first. Day and month swapped.',
  },
  'one-day': {
    title: 'Dates move by one day, not swapped',
    what: 'Invite and calendar disagree by exactly one day, or by time zone of the attendee.',
  },
  unplaced: {
    title: 'No cause on file',
    what: 'Tenant not in the directory, or a month-first tenant.',
  },
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; rows: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged, rows: all.filter((r) => r.mergedInto === ticket).length, groups };
}
