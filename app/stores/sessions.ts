import { defineStore, skipHydrate } from "pinia";
import type {
  ComparisonSession,
  Country,
  CountryScore,
  Criterion,
} from "~/types/countryRoyale";
import { type CriteriaSet, PRESET_CRITERIA } from "~/data/criteria";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const makeId = () => crypto.randomUUID();

const scoreKey = (countryCode: string, criterionId: string) =>
  `${countryCode}::${criterionId}`;

const STORAGE_KEY = "country-royale:sessions:v1";

const DEFAULT_CATEGORIES = [
  "Legal & Admin",
  "Money",
  "Work & Opportunity",
  "Infrastructure & Practicalities",
  "Lifestyle & Social",
  "Health & Environment",
  "Risk",
];

export const useSessionsStore = defineStore("sessions", () => {
  const sessions = ref<ComparisonSession[]>([]);
  const activeSessionId = ref<string | null>(null);
  const isHydrated = skipHydrate(ref(false));
  const customCountries = ref<Country[]>([]);
  const masterCountries = ref<Country[]>([]);
  const userPresets = ref<CriteriaSet[]>([]);
  const masterCriteria = ref<Criterion[]>(
    import.meta.server
      ? PRESET_CRITERIA.map((pc) => ({ ...pc, id: makeId() }))
      : [],
  );
  const masterCategories = ref<string[]>([]);

  const activeSession = computed(
    () => sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
  );

  const createSession = (title: string) => {
    const session: ComparisonSession = {
      id: makeId(),
      title: title.trim() || "Untitled comparison",
      countryCodes: [],
      criteria: [],
      scores: [],
      notes: {},
      createdAt: new Date().toISOString(),
    };
    sessions.value = [session, ...sessions.value];
    activeSessionId.value = session.id;
    return session.id;
  };

  const setActiveSession = (id: string) => {
    activeSessionId.value = id;
  };

  const renameActiveSession = (title: string) => {
    if (!activeSession.value) return;
    activeSession.value.title = title.trim() || "Untitled comparison";
    return true;
  };

  const addCustomCountry = (country: Country) => {
    if (customCountries.value.some((c) => c.code === country.code)) return;
    customCountries.value = [...customCountries.value, country];
  };

  const upsertMasterCountry = (country: Country) => {
    const idx = masterCountries.value.findIndex((c) => c.code === country.code);
    if (idx === -1) {
      masterCountries.value = [...masterCountries.value, country];
    } else {
      masterCountries.value = masterCountries.value.map((c) =>
        c.code === country.code ? country : c,
      );
    }
  };

  const deleteMasterCountry = (code: string) => {
    masterCountries.value = masterCountries.value.filter(
      (c) => c.code !== code,
    );
  };

  const duplicateSession = (sourceId: string) => {
    const source = sessions.value.find((s) => s.id === sourceId);
    if (!source) return null;

    const cloned: ComparisonSession = {
      id: makeId(),
      title: `${source.title} (copy)`,
      countryCodes: [...source.countryCodes],
      criteria: source.criteria.map((c) => ({ ...c, id: makeId() })),
      scores: [],
      notes: source.notes ? { ...source.notes } : {},
      createdAt: new Date().toISOString(),
    };

    // Important: criteria ids changed, so we must remap scores to new criterion ids
    const criterionIdMap = new Map<string, string>();
    source.criteria.forEach((oldC, idx) => {
      criterionIdMap.set(oldC.id, cloned.criteria[idx]!.id);
    });

    cloned.scores = source.scores.map((sc) => ({
      countryCode: sc.countryCode,
      criterionId: criterionIdMap.get(sc.criterionId) ?? sc.criterionId,
      score: sc.score,
    }));

    sessions.value = [cloned, ...sessions.value];
    activeSessionId.value = cloned.id;

    return cloned.id;
  };

  const setCountries = (countryCodes: string[]) => {
    if (!activeSession.value) return;
    activeSession.value.countryCodes = [...new Set(countryCodes)];
    // optional: remove scores for countries that were removed
    activeSession.value.scores = activeSession.value.scores.filter((s) =>
      activeSession.value?.countryCodes.includes(s.countryCode),
    );
  };

  const upsertCriterion = (
    criterion: Omit<Criterion, "id"> & { id?: string },
  ) => {
    if (!activeSession.value) return;
    const id = criterion.id ?? makeId();
    const next: Criterion = {
      id,
      label: criterion.label.trim() || "Unnamed criterion",
      description: criterion.description?.trim() || undefined,
      weight: clamp(criterion.weight, 1, 10),
      direction: criterion.direction ?? "higher-is-better",
      category: criterion.category,
      mode: criterion.mode ?? "manual",
      sourceKey: criterion.sourceKey,
      lastFetched: criterion.lastFetched,
    };

    const idx = activeSession.value.criteria.findIndex((c) => c.id === id);
    if (idx === -1)
      activeSession.value.criteria = [...activeSession.value.criteria, next];
    else
      activeSession.value.criteria = activeSession.value.criteria.map((c) =>
        c.id === id ? next : c,
      );

    return id;
  };

  const removeCriterion = (criterionId: string) => {
    if (!activeSession.value) return;
    activeSession.value.criteria = activeSession.value.criteria.filter(
      (c) => c.id !== criterionId,
    );
    activeSession.value.scores = activeSession.value.scores.filter(
      (s) => s.criterionId !== criterionId,
    );
  };

  const setScore = (
    countryCode: string,
    criterionId: string,
    score: number,
    rawValue?: string | number,
  ) => {
    if (!activeSession.value) return;
    const nextScore: CountryScore = {
      countryCode,
      criterionId,
      score: clamp(score, 1, 10),
      rawValue,
    };

    const idx = activeSession.value.scores.findIndex(
      (s) =>
        scoreKey(s.countryCode, s.criterionId) ===
        scoreKey(countryCode, criterionId),
    );

    if (idx === -1)
      activeSession.value.scores = [...activeSession.value.scores, nextScore];
    else
      activeSession.value.scores = activeSession.value.scores.map((s) =>
        scoreKey(s.countryCode, s.criterionId) ===
        scoreKey(countryCode, criterionId)
          ? nextScore
          : s,
      );
  };

  const upsertMasterCriterion = (
    criterion: Omit<Criterion, "id"> & { id?: string },
  ) => {
    const id = criterion.id ?? makeId();
    const next: Criterion = {
      ...criterion,
      id,
      label: criterion.label.trim() || "Unnamed criterion",
      description: criterion.description?.trim() || undefined,
      weight: clamp(criterion.weight, 1, 10),
      direction: criterion.direction ?? "higher-is-better",
      mode: criterion.mode ?? "manual",
    };

    const idx = masterCriteria.value.findIndex((c) => c.id === id);
    if (idx === -1) masterCriteria.value = [...masterCriteria.value, next];
    else {
      masterCriteria.value = masterCriteria.value.map((c) =>
        c.id === id ? next : c,
      );
      // Propagate changes to all sessions if the criterion exists there
      sessions.value.forEach((s) => {
        s.criteria = s.criteria.map((c) => {
          if (
            c.label === next.label ||
            (criterion.id && c.id === criterion.id)
          ) {
            return { ...c, ...next, id: c.id };
          }
          return c;
        });
      });
    }

    return id;
  };

  const deleteMasterCriterion = (id: string) => {
    masterCriteria.value = masterCriteria.value.filter((c) => c.id !== id);
  };

  const addMasterCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || masterCategories.value.includes(trimmed)) return;
    masterCategories.value = [...masterCategories.value, trimmed];
  };

  const renameMasterCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || masterCategories.value.includes(trimmed)) return;
    masterCategories.value = masterCategories.value.map((c) =>
      c === oldName ? trimmed : c,
    );
    masterCriteria.value = masterCriteria.value.map((c) =>
      c.category === oldName ? { ...c, category: trimmed } : c,
    );
  };

  const deleteMasterCategory = (name: string) => {
    masterCategories.value = masterCategories.value.filter((c) => c !== name);
    // Criteria in this category become uncategorized
    masterCriteria.value = masterCriteria.value.map((c) =>
      c.category === name ? { ...c, category: undefined } : c,
    );
  };

  const moveMasterCriterion = (id: string, newCategory: string | undefined) => {
    masterCriteria.value = masterCriteria.value.map((c) =>
      c.id === id ? { ...c, category: newCategory } : c,
    );
  };

  const reorderMasterCriteria = (criteria: Criterion[]) => {
    masterCriteria.value = criteria;
  };

  const saveToStorage = () => {
    if (!import.meta.client) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value));
    localStorage.setItem(
      `${STORAGE_KEY}:custom-countries`,
      JSON.stringify(customCountries.value),
    );
    localStorage.setItem(
      `${STORAGE_KEY}:master-countries`,
      JSON.stringify(masterCountries.value),
    );
    localStorage.setItem(
      `${STORAGE_KEY}:user-presets`,
      JSON.stringify(userPresets.value),
    );
    localStorage.setItem(
      `${STORAGE_KEY}:master-criteria`,
      JSON.stringify(masterCriteria.value),
    );
    localStorage.setItem(
      `${STORAGE_KEY}:master-categories`,
      JSON.stringify(masterCategories.value),
    );
  };

  const exportSessionJson = (id: string) => {
    const s = sessions.value.find((x) => x.id === id);
    if (!s) return null;
    return JSON.stringify(s, null, 2);
  };

  const importSessionJson = (json: string) => {
    const parsed = JSON.parse(json) as ComparisonSession;

    // light validation (enough to prevent obvious junk)
    if (!parsed || typeof parsed !== "object") return null;
    if (
      !("title" in parsed) ||
      !("countryCodes" in parsed) ||
      !("criteria" in parsed) ||
      !("scores" in parsed)
    )
      return null;

    const imported: ComparisonSession = {
      ...parsed,
      id: makeId(), // new id so it doesn't collide
      title: `${String((parsed as any).title ?? "Imported")} (import)`,
      createdAt: new Date().toISOString(),
      countryCodes: Array.isArray((parsed as any).countryCodes)
        ? (parsed as any).countryCodes
        : [],
      criteria: Array.isArray((parsed as any).criteria)
        ? (parsed as any).criteria
        : [],
      scores: Array.isArray((parsed as any).scores)
        ? (parsed as any).scores
        : [],
      notes:
        (parsed as any).notes && typeof (parsed as any).notes === "object"
          ? (parsed as any).notes
          : {},
    };

    sessions.value = [imported, ...sessions.value];
    activeSessionId.value = imported.id;
    return imported.id;
  };

  const deleteSession = (id: string) => {
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (activeSessionId.value === id) {
      activeSessionId.value = sessions.value[0]?.id ?? null;
    }
  };

  const saveUserPreset = (name: string) => {
    if (!activeSession.value) return null;
    const preset: CriteriaSet = {
      id: makeId(),
      name: name.trim() || "My Preset",
      criteria: activeSession.value.criteria.map((c) => ({
        label: c.label,
        description: c.description || "",
        weight: c.weight,
        direction: c.direction,
        category: c.category as any,
        mode: c.mode,
        sourceKey: c.sourceKey,
      })),
    };
    userPresets.value = [preset, ...userPresets.value];
    return preset.id;
  };

  const deleteUserPreset = (id: string) => {
    userPresets.value = userPresets.value.filter((p) => p.id !== id);
  };

  const setCountryNote = (countryCode: string, note: string) => {
    if (!activeSession.value) return;
    if (!activeSession.value.notes) activeSession.value.notes = {};
    activeSession.value.notes[countryCode] = note;
  };

  const clearCountryNote = (countryCode: string) => {
    if (!activeSession.value?.notes) return;
    delete activeSession.value.notes[countryCode];
  };

  const clearAllSessions = () => {
    sessions.value = [];
    customCountries.value = [];
    masterCountries.value = [];
    userPresets.value = [];
    activeSessionId.value = null;
  };

  const bootstrapFromPersisted = (data: {
    sessions: ComparisonSession[];
    customCountries: Country[];
    masterCountries?: Country[];
    userPresets?: CriteriaSet[];
    masterCriteria?: Criterion[];
    masterCategories?: string[];
    hydrated: boolean;
  }) => {
    sessions.value = data.sessions ?? [];
    customCountries.value = data.customCountries ?? [];
    masterCountries.value = data.masterCountries ?? [];
    userPresets.value = data.userPresets ?? [];

    // Initialize Library if empty
    if (!data.masterCriteria || data.masterCriteria.length === 0) {
      masterCriteria.value = PRESET_CRITERIA.map((pc) => ({
        ...pc,
        id: makeId(),
      }));
    } else {
      // Sync preset changes to master criteria (e.g. if a preset changed from manual to auto)
      const existingCriteria = [...data.masterCriteria];

      PRESET_CRITERIA.forEach((pc) => {
        const existing = existingCriteria.find((mc) => mc.label === pc.label);
        if (existing) {
          // Update mode and sourceKey if they changed in presets
          if (pc.mode && existing.mode !== pc.mode) {
            existing.mode = pc.mode;
          }
          if (pc.sourceKey && existing.sourceKey !== pc.sourceKey) {
            existing.sourceKey = pc.sourceKey;
          }
          // Also sync category if it's defined in preset but not in existing (or if it changed and we want to enforce it)
          if (pc.category && existing.category !== pc.category) {
            existing.category = pc.category;
          }
        } else {
          // Add missing preset criteria to the library
          existingCriteria.push({
            ...pc,
            id: makeId(),
          });
        }
      });
      masterCriteria.value = existingCriteria;
    }

    if (!data.masterCategories || data.masterCategories.length === 0) {
      masterCategories.value = [...DEFAULT_CATEGORIES];
    } else {
      masterCategories.value = data.masterCategories;
    }

    isHydrated.value = data.hydrated ?? true;
  };

  watch(
    [
      sessions,
      customCountries,
      masterCountries,
      userPresets,
      masterCriteria,
      masterCategories,
    ],
    () => {
      if (!isHydrated.value) return;
      saveToStorage();
    },
    { deep: true },
  );

  return {
    sessions,
    activeSessionId,
    activeSession,
    isHydrated,
    customCountries,
    masterCountries,
    userPresets,
    masterCriteria,
    masterCategories,
    renameActiveSession,
    createSession,
    setActiveSession,
    duplicateSession,
    setCountries,
    addCustomCountry,
    upsertMasterCountry,
    deleteMasterCountry,
    upsertCriterion,
    removeCriterion,
    setScore,
    saveUserPreset,
    deleteUserPreset,
    exportSessionJson,
    importSessionJson,
    deleteSession,
    setCountryNote,
    clearCountryNote,
    clearAllSessions,
    bootstrapFromPersisted,
    upsertMasterCriterion,
    deleteMasterCriterion,
    addMasterCategory,
    renameMasterCategory,
    deleteMasterCategory,
    moveMasterCriterion,
    reorderMasterCriteria,
  };
});
