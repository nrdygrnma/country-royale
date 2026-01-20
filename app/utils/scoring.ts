import type { ComparisonSession } from "~/types/countryRoyale";

export const normalize = (
  rawScore: number,
  _direction: "higher-is-better" | "lower-is-better",
) => {
  // IMPORTANT: The stored rawScore is already a "goodness" score from 1-10
  // (where 10 is best), calculated during the scoring phase.
  // Re-applying direction here would cause double inversion for "lower-is-better".
  return (rawScore - 1) / 9; // 1..10 -> 0..1
};

/**
 * Returns a score from 1-10 where 10 is always "best" regardless of direction.
 */
export const getAdjustedScore = (
  rawScore: number,
  direction: "higher-is-better" | "lower-is-better",
) => {
  return Math.round((normalize(rawScore, direction) * 9 + 1) * 10) / 10;
};

const getRawScoreOrDefault = (
  session: ComparisonSession,
  countryCode: string,
  criterionId: string,
  defaultScore: number,
) => {
  const found = session.scores.find(
    (s) => s.countryCode === countryCode && s.criterionId === criterionId,
  );
  return found?.score ?? defaultScore;
};

export const rankCountries = (session: ComparisonSession, defaultScore = 5) => {
  const totals = new Map<string, number>();

  for (const countryCode of session.countryCodes) totals.set(countryCode, 0);

  for (const countryCode of session.countryCodes) {
    let total = 0;

    for (const c of session.criteria) {
      const raw = getRawScoreOrDefault(
        session,
        countryCode,
        c.id,
        defaultScore,
      );
      const normalized = normalize(raw, c.direction);
      total += normalized * c.weight;
    }

    totals.set(countryCode, total);
  }

  return [...totals.entries()]
    .map(([countryCode, total]) => ({ countryCode, total }))
    .sort((a, b) => b.total - a.total);
};
