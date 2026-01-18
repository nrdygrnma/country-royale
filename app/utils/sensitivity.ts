import type { ComparisonSession, Criterion } from "~/types/countryRoyale";
import { rankCountries } from "~/utils/scoring";

type Delta = -1 | 1;

export interface SensitivityResult {
  baselineWinner: string | null;
  isStable: boolean;
  changeCount: number;
  testCount: number;
  changeRate: number; // 0..1
  flipStats?: Array<{
    criterionId: string;
    label: string;
    flipCount: number;
  }>;
  perCriterion: Array<{
    criterionId: string;
    label: string;
    direction: "higher-is-better" | "lower-is-better";
    baselineWeight: number;
    delta: Delta;
    newWeight: number;
    winner: string | null;
    changed: boolean;
  }>;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const withWeightChange = (
  session: ComparisonSession,
  criterionId: string,
  delta: Delta,
) => {
  const criteria = session.criteria.map((c) =>
    c.id === criterionId
      ? ({ ...c, weight: clamp(c.weight + delta, 1, 10) } satisfies Criterion)
      : c,
  );

  return { ...session, criteria };
};

const getWinner = (session: ComparisonSession) => {
  const ranked = rankCountries(session);
  return ranked[0]?.countryCode ?? null;
};

export const analyzeSensitivity = (
  session: ComparisonSession,
): SensitivityResult => {
  const baselineWinner = getWinner(session);

  const tests: SensitivityResult["perCriterion"] = [];

  for (const c of session.criteria) {
    for (const delta of [-1, 1] as const) {
      const mutated = withWeightChange(session, c.id, delta);
      const winner = getWinner(mutated);
      const changed = winner !== baselineWinner;

      tests.push({
        criterionId: c.id,
        label: c.label,
        direction: c.direction,
        baselineWeight: c.weight,
        delta,
        newWeight: clamp(c.weight + delta, 1, 10),
        winner,
        changed,
      });
    }
  }

  const changeCount = tests.filter((t) => t.changed).length;
  const testCount = tests.length;
  const changeRate = testCount === 0 ? 0 : changeCount / testCount;

  // Sensitivity Mode v2: show which criteria cause flips
  const flipsByCriterion = new Map<string, { label: string; count: number }>();
  for (const t of tests) {
    if (t.changed) {
      const entry = flipsByCriterion.get(t.criterionId) || {
        label: t.label,
        count: 0,
      };
      entry.count++;
      flipsByCriterion.set(t.criterionId, entry);
    }
  }

  const flipStats = [...flipsByCriterion.entries()]
    .map(([id, entry]) => ({
      criterionId: id,
      label: entry.label,
      flipCount: entry.count,
    }))
    .sort((a, b) => b.flipCount - a.flipCount);

  return {
    baselineWinner,
    isStable: changeCount === 0,
    changeCount,
    testCount,
    changeRate,
    flipStats,
    perCriterion: tests,
  };
};
