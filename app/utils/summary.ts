import type { ComparisonSession } from "~/types/countryRoyale";
import { rankCountries } from "~/utils/scoring";
import { getMarginInsight, getTopDrivers } from "~/utils/insights";

export interface DecisionSummary {
  headline: string;
  summary: string;
  why: string[];
  risks: string[];
  tradeoffs: string[];
}

const format = (n: number) => n.toFixed(2);

export const buildDecisionSummary = (
  session: ComparisonSession,
  defaultScore = 5,
  formatter?: (code: string) => string,
): DecisionSummary | null => {
  const ranking = rankCountries(session, defaultScore);
  if (ranking.length === 0) return null;

  const winner = ranking[0]?.countryCode ?? null;
  const runnerUp = ranking[1]?.countryCode ?? null;
  if (!winner) return null;

  const margin = getMarginInsight(session);
  const drivers = getTopDrivers(session, defaultScore, 10);

  const positives = drivers.filter((d) => d.deltaContribution > 0);
  const negatives = drivers.filter((d) => d.deltaContribution < 0);

  const winnerName = formatter ? formatter(winner) : winner;
  const runnerUpName = runnerUp
    ? formatter
      ? formatter(runnerUp)
      : runnerUp
    : null;

  const headline =
    runnerUpName && margin
      ? `${winnerName} takes the lead over ${runnerUpName}`
      : `${winnerName} is the clear winner`;

  let summary = "";
  if (runnerUpName && margin) {
    const gap = margin.margin;
    if (gap > 15) {
      summary = `${winnerName} dominates this comparison with a substantial lead of ${format(gap)} points. It consistently outperforms ${runnerUpName} across most high-priority criteria.`;
    } else if (gap > 5) {
      summary = `${winnerName} is a solid choice, maintaining a healthy margin over ${runnerUpName}. While ${runnerUpName} is competitive, ${winnerName}'s strengths in key areas make it the more balanced option.`;
    } else {
      summary = `It's a very tight race! ${winnerName} edges out ${runnerUpName} by a razor-thin margin of ${format(gap)} points. Your decision might come down to a single criterion or a tie-breaker.`;
    }
  } else {
    summary = `${winnerName} stands alone as the primary choice for your criteria.`;
  }

  const why: string[] = positives
    .slice(0, 3)
    .map(
      (p) =>
        `${p.label} is a major advantage for ${winnerName}, providing a +${format(p.deltaContribution)} swing over ${runnerUpName}.`,
    );

  const risks: string[] = negatives
    .slice(0, 2)
    .map(
      (n) =>
        `${runnerUpName} actually performs better in ${n.label} (Δ ${format(Math.abs(n.deltaContribution))}). If this matters more than you estimated, reconsider.`,
    );

  const tradeoffs: string[] = [];
  if (positives.length > 0 && negatives.length > 0) {
    const topPos = positives[0]!;
    const topNeg = negatives[0]!;
    tradeoffs.push(
      `Choosing ${winnerName} means prioritizing ${topPos.label} over ${topNeg.label}, where ${runnerUpName} has the upper hand.`,
    );
  }

  if (tradeoffs.length === 0) {
    tradeoffs.push(
      `No significant trade-offs identified. ${winnerName} leads consistently.`,
    );
  }

  return { headline, summary, why, risks, tradeoffs };
};
