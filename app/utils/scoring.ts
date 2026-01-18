import type { ComparisonSession } from "~/types/countryRoyale";

const normalize = (
  rawScore: number,
  direction: "higher-is-better" | "lower-is-better",
) => {
  const norm = rawScore / 10; // 1..10 -> 0.1..1.0
  return direction === "higher-is-better" ? norm : 1.1 - norm;
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
