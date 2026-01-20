import type { ComparisonSession } from "~/types/countryRoyale";
import { rankCountries } from "~/utils/scoring";

export interface MarginInsight {
  winner: string | null;
  runnerUp: string | null;
  winnerTotal: number;
  runnerUpTotal: number;
  margin: number;
  marginPctOfWinner: number; // 0..1
}

export interface DriverInsight {
  criterionId: string;
  label: string;
  weight: number;
  direction: "higher-is-better" | "lower-is-better";
  winnerRaw: number;
  runnerUpRaw: number;
  scoreDelta: number; // raw difference (winner - runner-up)
  // positive = helped winner vs runner-up, negative = helped runner-up
  deltaContribution: number;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

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

const normalizedAdjusted = (
  rawScore: number,
  _direction: "higher-is-better" | "lower-is-better",
) => {
  // Same fix as in scoring.ts: input is already a 1-10 goodness score
  const norm = (clamp(rawScore, 1, 10) - 1) / 9;
  return norm;
};

export const getMarginInsight = (
  session: ComparisonSession,
): MarginInsight | null => {
  const ranking = rankCountries(session);
  if (ranking.length === 0) return null;

  const winner = ranking[0] ?? null;
  const runnerUp = ranking[1] ?? null;

  const winnerCode = winner?.countryCode ?? null;
  const runnerUpCode = runnerUp?.countryCode ?? null;

  const winnerTotal = winner?.total ?? 0;
  const runnerUpTotal = runnerUp?.total ?? 0;

  const margin = winnerTotal - runnerUpTotal;
  const marginPctOfWinner = winnerTotal === 0 ? 0 : margin / winnerTotal;

  return {
    winner: winnerCode,
    runnerUp: runnerUpCode,
    winnerTotal,
    runnerUpTotal,
    margin,
    marginPctOfWinner,
  };
};

export const getTopDrivers = (
  session: ComparisonSession,
  defaultScore = 5,
  topN = 5,
): DriverInsight[] => {
  const ranking = rankCountries(session);
  const winner = ranking[0]?.countryCode;
  const runnerUp = ranking[1]?.countryCode;
  if (!winner || !runnerUp) return [];

  const drivers: DriverInsight[] = session.criteria.map((c) => {
    const wRaw = getRawScoreOrDefault(session, winner, c.id, defaultScore);
    const rRaw = getRawScoreOrDefault(session, runnerUp, c.id, defaultScore);

    const wAdj = normalizedAdjusted(wRaw, c.direction);
    const rAdj = normalizedAdjusted(rRaw, c.direction);

    const deltaContribution = (wAdj - rAdj) * c.weight;
    const scoreDelta = wRaw - rRaw;

    return {
      criterionId: c.id,
      label: c.label,
      weight: c.weight,
      direction: c.direction,
      winnerRaw: wRaw,
      runnerUpRaw: rRaw,
      scoreDelta,
      deltaContribution,
    };
  });

  // Sort by absolute impact (biggest “swing”)
  return drivers
    .sort(
      (a, b) => Math.abs(b.deltaContribution) - Math.abs(a.deltaContribution),
    )
    .slice(0, topN);
};
