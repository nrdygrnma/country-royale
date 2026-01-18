<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
    <SessionWizardHeader />

    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Scoring
        </h1>
        <p class="text-xs text-gray-500">One criterion at a time</p>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="soft" @click="goBack">Back</UButton>
        <UButton :disabled="!isReady" size="sm" @click="goNext"
          >See results</UButton
        >
      </div>
    </div>

    <ClientOnly>
      <UCard v-if="!session">
        <div class="space-y-2">
          <div class="font-medium">Session not found</div>
          <div class="text-sm opacity-70">
            That session id doesn’t exist. Go back and create one.
          </div>
          <UButton class="mt-2" @click="goHome">Go home</UButton>
        </div>
      </UCard>

      <UCard v-else-if="!isReady">
        <div class="space-y-2">
          <div class="font-medium">Not ready to score yet</div>
          <div class="text-sm opacity-70">
            You need at least one country and one criterion.
          </div>

          <div class="flex gap-2 pt-2">
            <UButton variant="soft" @click="goCountries"
              >Pick countries</UButton
            >
            <UButton variant="soft" @click="goCriteria"
              >Define criteria</UButton
            >
          </div>
        </div>
      </UCard>

      <template v-else>
        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <div
            class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="text-base font-semibold">
                  {{ activeCriterion?.label }}
                </div>
                <UBadge size="xs" variant="subtle"
                  >w{{ activeCriterion?.weight }}</UBadge
                >
                <UBadge
                  :color="
                    activeCriterion?.direction === 'higher-is-better'
                      ? 'primary'
                      : 'warning'
                  "
                  size="xs"
                  variant="soft"
                >
                  {{
                    activeCriterion?.direction === "higher-is-better"
                      ? "↑ higher is better"
                      : "↓ lower is better"
                  }}
                </UBadge>
              </div>
              <div
                v-if="activeCriterion?.description"
                class="text-xs opacity-60"
              >
                {{ activeCriterion.description }}
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge size="xs" variant="soft">
                {{ storedCountCurrent }}/{{ session.countryCodes.length }}
              </UBadge>

              <UBadge
                v-if="isCurrentComplete"
                color="success"
                size="xs"
                variant="soft"
              >
                complete
              </UBadge>

              <USelectMenu
                :items="criterionOptions"
                :model-value="currentCriterion"
                class="w-40"
                size="xs"
                @update:model-value="(v: any) => setCriterionFromSelect(v)"
              />
              <UButton
                :disabled="!hasPrev"
                size="xs"
                variant="soft"
                @click="goPrevCriterion"
                >Prev</UButton
              >
              <UButton
                :disabled="!hasNext"
                size="xs"
                variant="soft"
                @click="goNextCriterion"
                >Next</UButton
              >
              <UTooltip text="Jump to first incomplete">
                <UButton
                  :disabled="!firstIncompleteCriterionId"
                  icon="i-lucide-list-todo"
                  size="xs"
                  variant="ghost"
                  @click="jumpToFirstIncomplete"
                />
              </UTooltip>
              <UButton size="xs" variant="ghost" @click="fillThisCriterionWith5"
                >Fill 5</UButton
              >
              <UTooltip text="Toggle Battle Mode">
                <UButton
                  :color="battleMode ? 'primary' : 'neutral'"
                  icon="i-lucide-swords"
                  size="xs"
                  variant="ghost"
                  @click="toggleBattleMode"
                >
                  Battle
                </UButton>
              </UTooltip>
            </div>
          </div>
        </UCard>

        <!-- Battle Mode UI -->
        <UCard v-if="battleMode" :ui="{ body: 'p-4' }">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div
                class="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"
              >
                <UIcon class="w-4 h-4" name="i-lucide-swords" />
                Pairwise Battle
                <UPopover :popper="{ placement: 'bottom-start' }">
                  <UButton
                    color="neutral"
                    icon="i-lucide-info"
                    size="xs"
                    variant="ghost"
                  />
                  <template #content>
                    <div class="p-4 w-64 text-xs space-y-2">
                      <p class="font-bold">How Battle Mode works:</p>
                      <p>
                        Clicking on a country's name button adds
                        <span class="font-bold text-primary-500">+1 point</span
                        >. You can also use the
                        <span class="font-bold text-error-500">-</span> button
                        to <span class="font-bold text-error-500">reduce</span>
                        its score.
                      </p>
                      <p>
                        This is a great way to break ties or refine your ranking
                        by comparing countries head-to-head.
                      </p>
                    </div>
                  </template>
                </UPopover>
              </div>
              <div class="text-[10px] text-gray-400">
                Pick the winner for
                <span class="font-bold text-primary-500">{{
                  activeCriterion?.label
                }}</span>
              </div>
            </div>

            <div class="flex items-center justify-center gap-4 py-4">
              <!-- Country A -->
              <div class="flex-1 space-y-3">
                <USelectMenu
                  :items="
                    session.countryCodes.map((c) => ({
                      label: codeToName.get(c) ?? c,
                      value: c,
                    }))
                  "
                  :model-value="
                    session.countryCodes
                      .map((c) => ({ label: codeToName.get(c) ?? c, value: c }))
                      .find((i) => i.value === battleCountries[0])
                  "
                  class="w-full"
                  @update:model-value="
                    (v: any) => selectBattleCountry(0, v.value)
                  "
                />
                <div class="flex items-center gap-2">
                  <UButton
                    block
                    class="flex-1 h-24 text-lg font-bold"
                    color="primary"
                    variant="subtle"
                    @click="recordBattleWin(battleCountries[0]!)"
                  >
                    {{
                      codeToName.get(battleCountries[0]!) ?? battleCountries[0]
                    }}
                  </UButton>
                  <UButton
                    class="h-24 w-12 shrink-0"
                    color="error"
                    icon="i-lucide-minus"
                    variant="soft"
                    @click="recordBattleLoss(battleCountries[0]!)"
                  />
                </div>
                <div class="text-center text-xs opacity-50 tabular-nums">
                  Current: {{ getScore(battleCountries[0]!) }}
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="text-xl font-black italic opacity-20">VS</div>
                <UButton size="xs" variant="ghost" @click="recordBattleTie">
                  Tie
                </UButton>
              </div>

              <!-- Country B -->
              <div class="flex-1 space-y-3">
                <USelectMenu
                  :items="
                    session.countryCodes.map((c) => ({
                      label: codeToName.get(c) ?? c,
                      value: c,
                    }))
                  "
                  :model-value="
                    session.countryCodes
                      .map((c) => ({ label: codeToName.get(c) ?? c, value: c }))
                      .find((i) => i.value === battleCountries[1])
                  "
                  class="w-full"
                  @update:model-value="
                    (v: any) => selectBattleCountry(1, v.value)
                  "
                />
                <div class="flex items-center gap-2">
                  <UButton
                    block
                    class="flex-1 h-24 text-lg font-bold"
                    color="primary"
                    variant="subtle"
                    @click="recordBattleWin(battleCountries[1]!)"
                  >
                    {{
                      codeToName.get(battleCountries[1]!) ?? battleCountries[1]
                    }}
                  </UButton>
                  <UButton
                    class="h-24 w-12 shrink-0"
                    color="error"
                    icon="i-lucide-minus"
                    variant="soft"
                    @click="recordBattleLoss(battleCountries[1]!)"
                  />
                </div>
                <div class="text-center text-xs opacity-50 tabular-nums">
                  Current: {{ getScore(battleCountries[1]!) }}
                </div>
              </div>
            </div>

            <div class="text-[10px] text-center opacity-60">
              Winning a battle increases that country's score by +1. Ties
              average them.
            </div>
          </div>
        </UCard>

        <!-- Scoring list (country rows) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <UCard>
              <div class="space-y-3">
                <div class="text-sm opacity-80">
                  Score each country from
                  <span class="font-semibold">1</span> (worst) to
                  <span class="font-semibold">10</span> (best). Direction is
                  handled automatically.
                </div>

                <div class="grid gap-2">
                  <div
                    v-for="code in session.countryCodes"
                    :key="code"
                    :class="[
                      selectedCountry === code
                        ? 'border-primary-500 bg-primary-50/30 dark:border-primary-800 dark:bg-primary-950/20'
                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
                    ]"
                    class="flex flex-col gap-2 rounded-lg border p-2 md:flex-row md:items-center md:justify-between transition-all duration-200"
                    role="button"
                    tabindex="0"
                    @click="selectedCountry = code"
                    @keydown.enter.prevent="selectedCountry = code"
                  >
                    <div class="min-w-0 px-1">
                      <div class="font-semibold text-sm truncate leading-tight">
                        {{ codeToName.get(code) ?? code }}
                      </div>
                    </div>

                    <div class="flex items-center gap-3 md:w-120">
                      <div
                        class="tabular-nums w-8 text-center text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 rounded py-0.5"
                      >
                        {{ getScore(code) }}
                      </div>

                      <USlider
                        :key="`${currentCriterionId}::${code}`"
                        :max="10"
                        :min="1"
                        :model-value="getScore(code)"
                        class="flex-1"
                        size="sm"
                        @update:model-value="(v: unknown) => setScore(code, v)"
                      />

                      <UTooltip text="Reset to default (5)">
                        <UButton
                          icon="i-lucide-rotate-ccw"
                          size="xs"
                          variant="ghost"
                          @click="setScore(code, 5)"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <div class="lg:col-span-1 space-y-6">
            <UCard v-if="selectedCountry">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs uppercase tracking-wide opacity-60">
                      Selected country
                    </div>
                    <div class="text-lg font-semibold">
                      {{ codeToName.get(selectedCountry!) ?? selectedCountry }}
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <UButton size="sm" variant="soft" @click="selectPrevCountry"
                      >Prev</UButton
                    >
                    <UButton size="sm" variant="soft" @click="selectNextCountry"
                      >Next</UButton
                    >
                  </div>
                </div>

                <div class="grid gap-2">
                  <div
                    v-for="c in session.criteria"
                    :key="c.id"
                    class="flex flex-col gap-2 rounded-md border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="min-w-0">
                        <div class="font-medium truncate">{{ c.label }}</div>
                        <div class="text-xs opacity-60">
                          w{{ c.weight }} ·
                          <span
                            :class="
                              c.direction === 'higher-is-better'
                                ? 'text-primary-500'
                                : 'text-warning-500'
                            "
                            class="font-medium"
                          >
                            {{
                              c.direction === "higher-is-better"
                                ? "↑ higher"
                                : "↓ lower"
                            }}
                          </span>
                        </div>
                      </div>

                      <UBadge
                        class="tabular-nums w-12 justify-center"
                        variant="soft"
                      >
                        {{ getScoreFor(selectedCountry!, c.id) }}
                      </UBadge>
                    </div>

                    <USlider
                      :max="10"
                      :min="1"
                      :model-value="getScoreFor(selectedCountry!, c.id)"
                      @update:model-value="
                        (v: unknown) => setScoreFor(selectedCountry!, c.id, v)
                      "
                    />
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <UCard :ui="{ body: 'p-3 sm:p-4' }">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="font-medium text-sm">Progress overview</div>
                <UBadge size="xs" variant="soft">
                  {{ criterionProgress.filter((p) => p.done).length }}/{{
                    criterionProgress.length
                  }}
                  complete
                </UBadge>
              </div>
              <UButton
                :icon="
                  isProgressOpen
                    ? 'i-lucide-chevron-up'
                    : 'i-lucide-chevron-down'
                "
                size="xs"
                variant="ghost"
                @click="isProgressOpen = !isProgressOpen"
              >
                {{ isProgressOpen ? "Hide" : "Show details" }}
              </UButton>
            </div>
          </template>

          <template #default>
            <div v-if="isProgressOpen" class="space-y-3">
              <div class="grid gap-2">
                <button
                  v-for="p in criterionProgress"
                  :key="p.id"
                  class="w-full text-left rounded-md border border-gray-100 px-3 py-1.5 text-xs dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  type="button"
                  @click="setCriterion(p.id)"
                >
                  <span class="flex items-center justify-between gap-2">
                    <span class="flex items-center gap-2 truncate">
                      <span
                        :class="p.done ? 'bg-success-500' : 'bg-warning-500'"
                        class="w-2 h-2 rounded-full"
                      />
                      <span class="font-medium truncate">{{ p.label }}</span>
                    </span>

                    <span class="opacity-70 tabular-nums shrink-0">
                      {{ p.stored }}/{{ p.total }}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </template>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm opacity-80">
              Progress:
              <span class="font-semibold">{{ currentIndex + 1 }}</span> /
              <span class="font-semibold">{{ session.criteria.length }}</span>
            </div>

            <div class="flex gap-2">
              <UButton
                :disabled="!hasPrev"
                variant="soft"
                @click="goPrevCriterion"
              >
                Prev
              </UButton>
              <UButton :disabled="!hasNext" @click="goNextCriterion">
                Next
              </UButton>
            </div>
          </div>
        </UCard>
      </template>

      <template #fallback>
        <div class="space-y-6">
          <UCard>
            <div class="animate-pulse space-y-4">
              <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
              <div
                class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"
              ></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
            </div>
          </UCard>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <UCard>
                <div class="animate-pulse space-y-3">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="h-12 bg-gray-100 dark:bg-gray-800 rounded"
                  ></div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { COUNTRIES } from "~/data/countries";

const store = useSessionsStore();
const router = useRouter();
const route = useRoute();

const sessionId = computed(() => String(route.params.id ?? ""));

onMounted(() => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});

watch(sessionId, () => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});

const session = computed(() => store.activeSession);

const selectedCountry = ref<string | null>(null);

watch(
  () => session.value?.countryCodes,
  (codes) => {
    if (!codes || codes.length === 0) {
      selectedCountry.value = null;
      return;
    }
    if (!selectedCountry.value || !codes.includes(selectedCountry.value)) {
      selectedCountry.value = codes[0] ?? null;
    }
  },
  { immediate: true },
);

const isReady = computed(() => {
  const s = session.value;
  if (!s) return false;
  return s.countryCodes.length > 0 && s.criteria.length > 0;
});

const codeToName = computed(() => {
  const map = new Map<string, string>();
  for (const c of COUNTRIES) map.set(c.code, c.name);
  for (const c of store.customCountries) map.set(c.code, c.name);
  return map;
});

/**
 * Criterion selection via query param
 */
const currentCriterionId = computed(() => String(route.query.criterion ?? ""));

const criterionOptions = computed(() => {
  const s = session.value;
  if (!s) return [];
  return s.criteria.map((c: any) => ({ label: c.label, value: c.id }));
});

const ensureCriterionQuery = () => {
  const s = session.value;
  if (!s || s.criteria.length === 0) return;
  const exists = s.criteria.some((c: any) => c.id === currentCriterionId.value);
  const fallbackId = s.criteria[0]!.id;

  if (!currentCriterionId.value || !exists) {
    router.replace({
      path: route.path,
      query: { ...route.query, criterion: fallbackId },
    });
  }
};

watch(
  [session, () => route.query.criterion],
  () => {
    if (!isReady.value) return;
    ensureCriterionQuery();
  },
  { immediate: true },
);

const currentCriterion = computed(() => {
  const c = activeCriterion.value;
  if (!c) return undefined;
  return { label: c.label, value: c.id };
});

const activeCriterion = computed(() => {
  const s = session.value;
  if (!s) return null;
  return (
    s.criteria.find((c: any) => c.id === currentCriterionId.value) ??
    s.criteria[0] ??
    null
  );
});

const currentIndex = computed(() => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return 0;
  const idx = s.criteria.findIndex((c: any) => c.id === cc.value);
  return idx === -1 ? 0 : idx;
});

const totalCountries = computed(() => session.value?.countryCodes.length ?? 0);

const storedCountForCriterion = (criterionId: string) => {
  const s = session.value;
  if (!s) return 0;
  const set = new Set<string>();
  for (const sc of s.scores) {
    if (
      sc.criterionId === criterionId &&
      s.countryCodes.includes(sc.countryCode)
    ) {
      set.add(sc.countryCode);
    }
  }
  return set.size;
};

const storedCountCurrent = computed(() => {
  const cc = currentCriterion.value;
  if (!cc) return 0;
  return storedCountForCriterion(cc.value);
});

const isCurrentComplete = computed(
  () =>
    totalCountries.value > 0 &&
    storedCountCurrent.value === totalCountries.value,
);

const criterionProgress = computed(() => {
  const s = session.value;
  if (!s) return [];

  const codes = s.countryCodes;
  return s.criteria.map((c: any) => {
    const stored = storedCountForCriterion(c.id);
    const total = codes.length;
    // Done only if we have at least one country and we've scored ALL of them
    const done = total > 0 && stored === total;

    return {
      id: c.id,
      label: c.label,
      stored,
      total,
      done,
    };
  });
});

const firstIncompleteCriterionId = computed(() => {
  const row = criterionProgress.value.find((p: any) => !p.done);
  return row?.id ?? null;
});

const isProgressOpen = ref(false);

const battleMode = ref(false);
const battleCountries = ref<string[]>([]); // [codeA, codeB]

const toggleBattleMode = () => {
  battleMode.value = !battleMode.value;
  if (
    battleMode.value &&
    session.value &&
    session.value.countryCodes.length >= 2
  ) {
    battleCountries.value = [
      session.value.countryCodes[0]!,
      session.value.countryCodes[1]!,
    ];
  }
};

const recordBattleWin = (winnerCode: string) => {
  const current = getScore(winnerCode);
  if (current < 10) {
    setScore(winnerCode, current + 1);
  }
};

const recordBattleLoss = (code: string) => {
  const current = getScore(code);
  if (current > 1) {
    setScore(code, current - 1);
  }
};

const recordBattleTie = () => {
  // No change? Or maybe set both to 5 if they were far apart?
  // Usually tie means they are equal, so maybe average them?
  const sA = getScore(battleCountries.value[0]!);
  const sB = getScore(battleCountries.value[1]!);
  const avg = Math.round((sA + sB) / 2);
  setScore(battleCountries.value[0]!, avg);
  setScore(battleCountries.value[1]!, avg);
};

const selectBattleCountry = (idx: number, code: string) => {
  battleCountries.value[idx] = code;
};

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => {
  const s = session.value;
  if (!s) return false;
  return currentIndex.value < s.criteria.length - 1;
});

const setCriterion = (criterionId: string) => {
  router.push({
    path: route.path,
    query: { ...route.query, criterion: criterionId },
  });
};

const jumpToFirstIncomplete = () => {
  if (!firstIncompleteCriterionId.value) return;
  setCriterion(firstIncompleteCriterionId.value);
};

const goPrevCriterion = () => {
  const s = session.value;
  if (!s) return;
  const idx = currentIndex.value;
  if (idx <= 0) return;
  setCriterion(s.criteria[idx - 1]!.id);
};

const goNextCriterion = () => {
  const s = session.value;
  if (!s) return;
  const idx = currentIndex.value;
  if (idx >= s.criteria.length - 1) return;
  setCriterion(s.criteria[idx + 1]!.id);
};

const setCriterionFromSelect = (v: any) => {
  const id = typeof v === "string" ? v : v?.value;
  if (!id) return;
  setCriterion(id);
};

/**
 * Scoring helpers for current criterion
 * Default score shown = 5 (engine also defaults to 5 now).
 */
const getScore = (countryCode: string) => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return 5;
  const found = s.scores.find(
    (x: any) => x.countryCode === countryCode && x.criterionId === cc.value,
  );
  return found?.score ?? 5;
};

const setScore = (countryCode: string, v: unknown) => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return;

  const score = Array.isArray(v) ? v[0] : v;
  if (typeof score !== "number") return;

  store.setScore(countryCode, cc.value, score);
};

const fillThisCriterionWith5 = () => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return;
  for (const code of s.countryCodes) {
    store.setScore(code, cc.value, 5);
  }
};

const getScoreFor = (countryCode: string, criterionId: string) => {
  const s = session.value;
  if (!s) return 5;
  const found = s.scores.find(
    (x: any) => x.countryCode === countryCode && x.criterionId === criterionId,
  );
  return found?.score ?? 5;
};

const setScoreFor = (countryCode: string, criterionId: string, v: unknown) => {
  const score = Array.isArray(v) ? v[0] : v;
  if (typeof score !== "number") return;
  store.setScore(countryCode, criterionId, score);
};

const selectPrevCountry = () => {
  const s = session.value;
  if (!s || !selectedCountry.value) return;
  const idx = s.countryCodes.indexOf(selectedCountry.value);
  if (idx <= 0) return;
  selectedCountry.value = s.countryCodes[idx - 1]!;
};

const selectNextCountry = () => {
  const s = session.value;
  if (!s || !selectedCountry.value) return;
  const idx = s.countryCodes.indexOf(selectedCountry.value);
  if (idx === -1 || idx >= s.countryCodes.length - 1) return;
  selectedCountry.value = s.countryCodes[idx + 1]!;
};

/**
 * Navigation
 */
const goBack = () => {
  router.push(`/sessions/${sessionId.value}/criteria`);
};

const goNext = () => {
  router.push(`/sessions/${sessionId.value}/results`);
};

const goCountries = () => {
  router.push(`/sessions/${sessionId.value}/countries`);
};

const goCriteria = () => {
  router.push(`/sessions/${sessionId.value}/criteria`);
};

const goHome = () => {
  router.push("/");
};
</script>
