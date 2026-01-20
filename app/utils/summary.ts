import type { ComparisonSession } from "~/types/countryRoyale";
import { rankCountries } from "~/utils/scoring";
import { getMarginInsight, getTopDrivers } from "~/utils/insights";

export interface DecisionChapter {
  title: string;
  content: string;
  type?: "advantage" | "risk" | "neutral";
}

export interface DecisionSummary {
  headline: string;
  summary: string;
  chapters: DecisionChapter[];
  why: string[]; // Keep for backward compatibility or small lists
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
  const drivers = getTopDrivers(session, defaultScore, 15);

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
    if (gap > 1.5) {
      summary = `${winnerName} dominates this comparison with a substantial lead of ${format(gap)} points. It consistently outperforms ${runnerUpName} across most high-priority criteria, suggesting a strong fit for your specific requirements.`;
    } else if (gap > 0.5) {
      summary = `${winnerName} is a solid choice, maintaining a healthy margin over ${runnerUpName}. While ${runnerUpName} is competitive, ${winnerName}'s strengths in key areas make it the more balanced option for your goals.`;
    } else {
      summary = `It's a very tight race! ${winnerName} edges out ${runnerUpName} by a razor-thin margin of ${format(gap)} points. Your decision might come down to a single criterion or a qualitative "gut feeling" tie-breaker.`;
    }
  } else {
    summary = `${winnerName} stands alone as the primary choice for your criteria. Its profile aligns most closely with your defined priorities.`;
  }

  const chapters: DecisionChapter[] = [];

  // Chapter 1: The Winning Case
  if (positives.length > 0 && positives[0]) {
    const top3 = positives.slice(0, 3);
    const names = top3.map((p) => p.label).join(", ");
    const primaryDriver = positives[0];
    chapters.push({
      title: "The Winning Case",
      content: `${winnerName}'s victory is primarily driven by its performance in ${names}. In these areas, it provides a cumulative advantage that ${runnerUpName || "other candidates"} struggle to match. Specifically, ${primaryDriver.label} contributes a significant +${format(primaryDriver.scoreDelta)} score difference to the final result.`,
      type: "advantage",
    });
  }

  // Chapter 2: Comparative Trade-offs
  if (negatives.length > 0 && negatives[0]) {
    const topNeg = negatives[0];
    const performanceWord =
      topNeg.direction === "lower-is-better" ? "higher" : "lower";
    chapters.push({
      title: "Critical Trade-offs",
      content: `No destination is perfect. Choosing ${winnerName} means accepting that ${runnerUpName || "competitors"} might actually be superior in ${topNeg.label} (where they achieved ${performanceWord} results). If this specific factor is more critical than its weight suggest, you should carefully weigh it against ${winnerName}'s other benefits.`,
      type: "risk",
    });
  }

  // Chapter 3: Category Breakdown (Simulated based on top drivers)
  const categories = [
    ...new Set(session.criteria.map((c) => c.category).filter(Boolean)),
  ];
  if (categories.length > 0) {
    const categoryAnalysis = categories
      .map((cat) => {
        const catCriteria = session.criteria.filter((c) => c.category === cat);
        const catDrivers = drivers.filter((d) =>
          catCriteria.some((cc) => cc.id === d.criterionId),
        );
        const catImpact = catDrivers.reduce(
          (acc, d) => acc + d.deltaContribution,
          0,
        );

        if (Math.abs(catImpact) > 0.1) {
          return `${cat} is a ${catImpact > 0 ? "strength" : "relative weakness"} for ${winnerName}${catImpact > 0 ? ", helping" : " although it slightly trails"} compared to ${runnerUpName}.`;
        }
        return null;
      })
      .filter(Boolean);

    if (categoryAnalysis.length > 0) {
      chapters.push({
        title: "Thematic Analysis",
        content: `Breaking down the results by category, we see that ${categoryAnalysis.join(" ")}`,
        type: "neutral",
      });
    }
  }

  const why: string[] = positives
    .slice(0, 3)
    .map(
      (p) =>
        `${p.label} is a major advantage for ${winnerName}, providing a +${format(p.scoreDelta)} score lead over ${runnerUpName} for this criterion.`,
    );

  const risks: string[] = negatives.slice(0, 2).map((n) => {
    const perf = n.direction === "lower-is-better" ? "higher" : "lower";
    return `${runnerUpName} actually performs better in ${n.label} (achieving ${perf} values, Δ ${format(Math.abs(n.scoreDelta))} score points). If this matters more than you estimated, reconsider.`;
  });

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

  return { headline, summary, chapters, why, risks, tradeoffs };
};
