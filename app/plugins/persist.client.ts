import type {
  ComparisonSession,
  Country,
  Criterion,
} from "~/types/countryRoyale";
import type { CriteriaSet } from "~/data/criteria";

const STORAGE_KEY = "country-royale:sessions:v1";

export default defineNuxtPlugin((nuxtApp) => {
  const persisted = useSessionsPersistedState();

  // Load from localStorage after mount to avoid hydration mismatches
  nuxtApp.hook("app:mounted", () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      persisted.value.sessions = raw
        ? (JSON.parse(raw) as ComparisonSession[])
        : [];

      const rawMasterCountries = localStorage.getItem(
        `${STORAGE_KEY}:master-countries`,
      );
      persisted.value.masterCountries = rawMasterCountries
        ? (JSON.parse(rawMasterCountries) as Country[])
        : [];

      const rawPresets = localStorage.getItem(`${STORAGE_KEY}:user-presets`);
      persisted.value.userPresets = rawPresets
        ? (JSON.parse(rawPresets) as CriteriaSet[])
        : [];

      const rawMaster = localStorage.getItem(`${STORAGE_KEY}:master-criteria`);
      persisted.value.masterCriteria = rawMaster
        ? (JSON.parse(rawMaster) as Criterion[])
        : [];

      const rawCats = localStorage.getItem(`${STORAGE_KEY}:master-categories`);
      persisted.value.masterCategories = rawCats
        ? (JSON.parse(rawCats) as string[])
        : [];
    } catch {
      persisted.value.sessions = [];
      persisted.value.masterCountries = [];
      persisted.value.userPresets = [];
      persisted.value.masterCriteria = [];
      persisted.value.masterCategories = [];
    } finally {
      persisted.value.hydrated = true;
    }

    // Now sync into Pinia store
    const store = useSessionsStore();
    store.bootstrapFromPersisted(persisted.value);
  });
});
