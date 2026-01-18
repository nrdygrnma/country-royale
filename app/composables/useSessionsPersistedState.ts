import type {
  ComparisonSession,
  Country,
  Criterion,
} from "~/types/countryRoyale";
import type { CriteriaSet } from "~/data/criteria";

export const useSessionsPersistedState = () =>
  useState<{
    sessions: ComparisonSession[];
    customCountries: Country[];
    userPresets: CriteriaSet[];
    masterCriteria: Criterion[];
    masterCategories: string[];
    hydrated: boolean;
  }>("country-royale:persisted", () => ({
    sessions: [],
    customCountries: [],
    userPresets: [],
    masterCriteria: [],
    masterCategories: [],
    hydrated: false,
  }));
