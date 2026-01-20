import type {
  ComparisonSession,
  Country,
  Criterion,
} from "~/types/countryRoyale";
import type { CriteriaSet } from "~/data/criteria";

export const useSessionsPersistedState = () =>
  useState<{
    sessions: ComparisonSession[];
    masterCountries: Country[];
    userPresets: CriteriaSet[];
    masterCriteria: Criterion[];
    masterCategories: string[];
    hydrated: boolean;
  }>("country-royale:persisted", () => ({
    sessions: [],
    masterCountries: [],
    userPresets: [],
    masterCriteria: [],
    masterCategories: [],
    hydrated: false,
  }));
