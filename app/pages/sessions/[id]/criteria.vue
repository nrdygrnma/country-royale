<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
    <SessionWizardHeader />

    <div class="flex items-center justify-between gap-4 py-1">
      <div class="space-y-0.5">
        <h1
          class="text-lg font-bold text-gray-900 dark:text-white leading-none"
        >
          Define criteria
        </h1>
        <p class="text-[10px] text-gray-500 font-medium">
          Decide what matters and how much
        </p>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="soft" @click="goBack">Back</UButton>
        <UButton
          :disabled="(store.activeSession?.criteria.length ?? 0) === 0"
          size="sm"
          @click="goNext"
        >
          Continue
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <UCard v-if="!sessionExists">
        <div class="space-y-2">
          <div class="font-medium">Session not found</div>
          <div class="text-sm opacity-70">
            That session id doesn’t exist. Go back and create one.
          </div>
          <UButton class="mt-2" @click="goHome">Go home</UButton>
        </div>
      </UCard>

      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <!-- Main Content (Left) -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Existing criteria -->
            <div class="space-y-3">
              <div class="flex items-center justify-between px-1">
                <div
                  class="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"
                >
                  Criteria ({{ store.activeSession?.criteria.length ?? 0 }})
                  <UTooltip
                    text="Weights determine how much each criterion pulls the final result. 10 is max priority."
                  >
                    <UIcon
                      class="w-3.5 h-3.5 text-gray-400 cursor-help"
                      name="i-lucide-info"
                    />
                  </UTooltip>
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    v-if="(store.activeSession?.criteria.length ?? 0) > 0"
                    color="error"
                    icon="i-lucide-trash-2"
                    size="xs"
                    variant="ghost"
                    @click="isClearCriteriaOpen = true"
                  >
                    Clear all
                  </UButton>
                  <UButton
                    v-if="(store.activeSession?.criteria.length ?? 0) > 0"
                    icon="i-lucide-save"
                    size="xs"
                    variant="ghost"
                    @click="isSavePresetModalOpen = true"
                  >
                    Save as preset
                  </UButton>
                </div>
              </div>

              <div
                v-for="c in store.activeSession?.criteria ?? []"
                :key="c.id"
                class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary-500/30 transition-all shadow-sm"
              >
                <div
                  class="flex-1 min-w-0 flex items-center justify-between gap-4"
                >
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <div class="font-bold text-gray-900 dark:text-white">
                        {{ c.label }}
                      </div>
                      <UBadge
                        v-if="c.mode === 'auto'"
                        color="secondary"
                        size="xs"
                        variant="soft"
                      >
                        Auto
                      </UBadge>
                    </div>
                    <div
                      v-if="c.description"
                      class="text-xs text-gray-500 line-clamp-1"
                    >
                      {{ c.description }}
                    </div>
                  </div>
                  <UIcon
                    v-if="c.sourceKey"
                    class="w-5 h-5 text-blue-500 shrink-0"
                    name="i-lucide-database"
                  />
                </div>

                <div
                  class="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0"
                >
                  <!-- Weight Control -->
                  <div class="flex flex-col gap-1.5">
                    <div
                      class="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-0.5"
                    >
                      <span>Importance</span>
                      <span class="text-primary-600 font-black">{{
                        c.weight
                      }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-24 sm:w-32">
                        <USlider
                          :max="10"
                          :min="1"
                          :model-value="c.weight"
                          size="sm"
                          @update:model-value="
                            (v: number | undefined) =>
                              v !== undefined && updateWeight(c.id, v)
                          "
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Direction Toggle -->
                  <div class="flex flex-col gap-1.5">
                    <div
                      class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-0.5"
                    >
                      Direction
                    </div>
                    <UButton
                      :color="
                        c.direction === 'higher-is-better'
                          ? 'primary'
                          : 'warning'
                      "
                      :icon="
                        c.direction === 'higher-is-better'
                          ? 'i-lucide-trending-up'
                          : 'i-lucide-trending-down'
                      "
                      size="xs"
                      variant="soft"
                      @click="toggleDirection(c)"
                    >
                      {{
                        c.direction === "higher-is-better"
                          ? "Higher is better"
                          : "Lower is better"
                      }}
                    </UButton>
                  </div>

                  <!-- Delete -->
                  <div class="sm:pt-4">
                    <UTooltip text="Delete criterion">
                      <UButton
                        class="text-gray-400 hover:text-red-500 transition-colors"
                        color="neutral"
                        icon="i-lucide-trash-2"
                        size="sm"
                        variant="ghost"
                        @click="store.removeCriterion(c.id)"
                      />
                    </UTooltip>
                  </div>
                </div>
              </div>

              <UCard v-if="(store.activeSession?.criteria.length ?? 0) === 0">
                <div class="opacity-70">
                  No criteria yet. Add one (or use the suggestions).
                </div>
              </UCard>
            </div>
          </div>

          <!-- Sidebar (Right) -->
          <aside class="space-y-4">
            <!-- Quick Presets -->
            <UCard
              :ui="{
                body: isQuickPresetsOpen ? 'p-3' : 'hidden',
                header:
                  'py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              }"
              @click="isQuickPresetsOpen = !isQuickPresetsOpen"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <div
                    class="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"
                  >
                    <UIcon class="w-4 h-4" name="i-lucide-layout-template" />
                    Quick Presets
                  </div>
                  <UIcon
                    :class="{ 'rotate-180': isQuickPresetsOpen }"
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    name="i-lucide-chevron-down"
                  />
                </div>
              </template>

              <div v-if="isQuickPresetsOpen" class="space-y-3" @click.stop>
                <div class="px-1 text-[10px] text-gray-400">
                  Replace all criteria with a theme
                </div>

                <div class="grid grid-cols-1 gap-1.5">
                  <!-- System Presets -->
                  <UButton
                    v-for="set in CRITERIA_SETS"
                    :key="set.id"
                    :color="isPresetActive(set) ? 'primary' : 'neutral'"
                    :variant="isPresetActive(set) ? 'soft' : 'ghost'"
                    class="justify-start h-auto py-1.5 px-2"
                    @click="applyPresetSet(set)"
                  >
                    <div
                      class="text-left flex items-center justify-between w-full"
                    >
                      <div>
                        <div
                          class="font-bold text-[11px] group-hover:text-primary-600 transition-colors flex items-center gap-1.5"
                        >
                          {{ set.name }}
                          <UIcon
                            v-if="
                              set.criteria.some(
                                (c) => c.mode === 'auto' || c.sourceKey,
                              )
                            "
                            class="w-3.5 h-3.5 text-blue-500"
                            name="i-lucide-database"
                          />
                        </div>
                        <div class="text-[9px] opacity-50 font-medium">
                          {{ set.criteria.length }} criteria
                        </div>
                      </div>
                      <UIcon
                        v-if="isPresetActive(set)"
                        class="w-3.5 h-3.5 text-primary-500"
                        name="i-lucide-check"
                      />
                    </div>
                  </UButton>

                  <!-- User Presets -->
                  <div
                    v-for="p in store.userPresets"
                    :key="p.id"
                    class="flex items-center group/item"
                  >
                    <UButton
                      :color="isPresetActive(p) ? 'primary' : 'neutral'"
                      :variant="isPresetActive(p) ? 'soft' : 'ghost'"
                      class="flex-1 justify-start h-auto py-1.5 px-2 transition-all duration-200"
                      @click="applyPresetSet(p)"
                    >
                      <div
                        class="text-left flex items-center justify-between w-full"
                      >
                        <div>
                          <div
                            class="font-bold text-[11px] flex items-center gap-1.5"
                          >
                            {{ p.name }}
                            <UIcon
                              v-if="
                                p.criteria.some(
                                  (c) => c.mode === 'auto' || c.sourceKey,
                                )
                              "
                              class="w-3.5 h-3.5 text-blue-500"
                              name="i-lucide-database"
                            />
                          </div>
                          <div class="text-[9px] opacity-50 font-medium">
                            {{ p.criteria.length }} criteria
                          </div>
                        </div>
                        <UIcon
                          v-if="isPresetActive(p)"
                          class="w-3.5 h-3.5 text-primary-500"
                          name="i-lucide-check"
                        />
                      </div>
                    </UButton>
                    <UButton
                      class="opacity-0 group-hover/item:opacity-100 transition-opacity"
                      color="error"
                      icon="i-lucide-trash-2"
                      size="xs"
                      variant="ghost"
                      @click.stop="store.deleteUserPreset(p.id)"
                    />
                  </div>
                </div>
              </div>
            </UCard>

            <!-- From Library -->
            <UCard
              :ui="{
                body: isLibraryOpen ? 'p-3' : 'hidden',
                header:
                  'py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              }"
              @click="isLibraryOpen = !isLibraryOpen"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <div
                    class="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"
                  >
                    <UIcon class="w-4 h-4" name="i-lucide-library" />
                    Library
                  </div>
                  <UIcon
                    :class="{ 'rotate-180': isLibraryOpen }"
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    name="i-lucide-chevron-down"
                  />
                </div>
              </template>

              <div v-if="isLibraryOpen" class="space-y-3" @click.stop>
                <div class="px-1 text-[10px] text-gray-400">
                  Replace all criteria with a theme
                </div>
                <div class="flex items-center justify-between px-1">
                  <div class="flex gap-1">
                    <UButton
                      class="px-2 h-auto"
                      color="primary"
                      icon="i-lucide-plus"
                      size="xs"
                      variant="ghost"
                      @click="addAllFromLibrary"
                    >
                      Add all
                    </UButton>

                    <span class="text-gray-300">|</span>
                    <UButton
                      class="px-2 h-auto"
                      color="primary"
                      icon="i-lucide-edit"
                      size="xs"
                      to="/admin/criteria"
                      variant="ghost"
                    >
                      Edit Library
                    </UButton>
                  </div>
                </div>

                <div class="space-y-1">
                  <div
                    v-for="(cat, idx) in libraryCategories"
                    :key="cat"
                    :class="{
                      'border-t border-gray-100 dark:border-gray-800 pt-1 mt-1':
                        idx > 0,
                    }"
                    class="space-y-1"
                  >
                    <div
                      class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 px-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/cat rounded-md"
                      @click="toggleLibraryCategory(cat)"
                    >
                      <span>{{ cat || "Uncategorized" }}</span>
                      <UIcon
                        :class="{ 'rotate-180': openLibraryCategories[cat] }"
                        class="w-3 h-3 transition-transform duration-200"
                        name="i-lucide-chevron-down"
                      />
                    </div>
                    <div
                      v-if="openLibraryCategories[cat]"
                      class="grid grid-cols-1 gap-1 pb-2"
                    >
                      <UButton
                        v-for="c in libraryCriteriaByCategory(cat)"
                        :key="c.id"
                        :disabled="isPresetAdded(c.label)"
                        class="justify-start h-auto py-1.5 px-2 transition-all duration-200"
                        color="neutral"
                        variant="ghost"
                        @click="addCriterionFromLibrary(c)"
                      >
                        <div class="text-left overflow-hidden w-full">
                          <div
                            class="font-medium text-[11px] flex items-center justify-between gap-1.5"
                          >
                            <div class="flex items-center gap-1.5 truncate">
                              <span class="truncate">{{ c.label }}</span>
                              <UIcon
                                v-if="c.sourceKey"
                                class="w-3.5 h-3.5 text-blue-500 shrink-0"
                                name="i-lucide-database"
                              />
                            </div>
                            <UIcon
                              v-if="isPresetAdded(c.label)"
                              class="w-3.5 h-3.5 text-primary-500 shrink-0"
                              name="i-lucide-check-circle-2"
                            />
                            <UIcon
                              v-else
                              class="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 shrink-0"
                              name="i-lucide-plus-circle"
                            />
                          </div>
                        </div>
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </aside>
        </div>
      </template>

      <template #fallback>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div class="lg:col-span-3 space-y-6">
            <UCard v-for="i in 3" :key="i" class="animate-pulse h-24" />
          </div>
          <aside class="space-y-4">
            <UCard class="animate-pulse h-80" />
            <UCard class="animate-pulse h-48" />
            <UCard class="animate-pulse h-64" />
          </aside>
        </div>
      </template>
    </ClientOnly>

    <div v-if="isHydrated">
      <ConfirmModal
        v-model:open="isClearCriteriaOpen"
        confirm-color="error"
        confirm-label="Clear All"
        description="This will remove ALL criteria from your session and clear all associated scores."
        message="Are you sure you want to clear all criteria?"
        title="Clear All Criteria?"
        @confirm="confirmClearCriteria"
      />

      <ConfirmModal
        v-model:open="isConfirmModalOpen"
        confirm-color="error"
        confirm-label="Replace Criteria"
        description="Confirm action to replace criteria set"
        message="This will REPLACE your current criteria set and CLEAR ALL EXISTING SCORES for this session. Are you sure?"
        title="Apply Preset?"
        @confirm="confirmApplyPreset"
      />

      <!-- Save Preset Modal -->
      <AppModal
        v-model:open="isSavePresetModalOpen"
        description="Give your current criteria set a name to reuse it in other sessions."
        title="Save Current Criteria as Preset"
      >
        <div class="p-4 space-y-4">
          <div class="space-y-1.5">
            <div
              class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1"
            >
              Preset Name
            </div>
            <UInput
              v-model="newPresetName"
              class="w-full"
              placeholder="e.g. My Digital Nomad Mix"
              size="sm"
              @keydown.enter="confirmSavePreset"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isSavePresetModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              :disabled="!newPresetName.trim()"
              color="primary"
              @click="confirmSavePreset"
            >
              Save Preset
            </UButton>
          </div>
        </template>
      </AppModal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  CRITERIA_SETS,
  type CriteriaSet,
  type PresetCriterion,
} from "~/data/criteria";

const toast = useToast();
const store = useSessionsStore();
const router = useRouter();
const route = useRoute();
const isHydrated = ref(false);

onMounted(() => {
  isHydrated.value = true;
});

const isLibraryOpen = ref(true);
const isQuickPresetsOpen = ref(true);
const openLibraryCategories = ref<Record<string, boolean>>({});

const toggleLibraryCategory = (cat: string) => {
  openLibraryCategories.value[cat] = !openLibraryCategories.value[cat];
};

const libraryCategories = computed(() => {
  return [...store.masterCategories, ""];
});

const libraryCriteriaByCategory = (cat: string) => {
  return store.masterCriteria.filter((c) => (c.category || "") === cat);
};

const isSavePresetModalOpen = ref(false);
const isClearCriteriaOpen = ref(false);
const newPresetName = ref("");

const confirmClearCriteria = () => {
  if (store.activeSession) {
    store.activeSession.criteria = [];
    store.activeSession.scores = [];
    toast.add({
      title: "Criteria cleared",
      color: "neutral",
    });
  }
  isClearCriteriaOpen.value = false;
};

const confirmSavePreset = () => {
  if (!newPresetName.value.trim()) return;
  const id = store.saveUserPreset(newPresetName.value);
  if (id) {
    toast.add({
      title: "Preset saved",
      description: `"${newPresetName.value}" is now available in Quick Presets.`,
      color: "success",
    });
    isSavePresetModalOpen.value = false;
    newPresetName.value = "";
  }
};

const sessionId = computed(() => String(route.params.id ?? ""));

const sessionExists = computed(() =>
  store.sessions.some((s) => s.id === sessionId.value),
);

const isConfirmModalOpen = ref(false);
const pendingPresetSet = ref<CriteriaSet | null>(null);

const applyPresetSet = (set: CriteriaSet) => {
  pendingPresetSet.value = set;
  isConfirmModalOpen.value = true;
};

const confirmApplyPreset = () => {
  if (!pendingPresetSet.value) return;

  const set = pendingPresetSet.value;

  if (store.activeSession) {
    store.activeSession.criteria = set.criteria.map((c: PresetCriterion) => {
      // Find matching master criterion to restore mode/sourceKey if missing in preset
      const master = store.masterCriteria.find(
        (m) => m.label.toLowerCase() === c.label.toLowerCase(),
      );

      return {
        description: c.description || master?.description || "",
        weight: c.weight,
        direction: c.direction || master?.direction || "higher-is-better",
        category: c.category || master?.category,
        ...c,
        id: crypto.randomUUID(),
        mode:
          c.mode ||
          master?.mode ||
          (c.sourceKey || master?.sourceKey ? "auto" : "manual"),
        sourceKey: c.sourceKey || master?.sourceKey,
      };
    });

    store.activeSession.scores = [];
  }

  toast.add({
    title: `Preset "${set.name}" applied`,
    description: "Criteria replaced and scores cleared.",
    color: "success",
  });

  isConfirmModalOpen.value = false;
  pendingPresetSet.value = null;
};

const isPresetAdded = (label: string) => {
  return (
    store.activeSession?.criteria.some(
      (c) => c.label.toLowerCase() === label.toLowerCase(),
    ) ?? false
  );
};

const isPresetActive = (set: CriteriaSet) => {
  if (
    !store.activeSession ||
    store.activeSession.criteria.length !== set.criteria.length
  ) {
    return false;
  }

  return set.criteria.every((pc) => {
    const sc = store.activeSession?.criteria.find(
      (s) => s.label.toLowerCase() === pc.label.toLowerCase(),
    );
    return sc && sc.weight === pc.weight;
  });
};

const addCriterionFromLibrary = (c: any) => {
  store.upsertCriterion({
    label: c.label,
    description: c.description,
    weight: c.weight,
    direction: c.direction,
    category: c.category,
    mode: c.mode,
    sourceKey: c.sourceKey,
  });
};

const addAllFromLibrary = () => {
  store.masterCriteria.forEach((c) => {
    if (!isPresetAdded(c.label)) {
      addCriterionFromLibrary(c);
    }
  });
  toast.add({
    title: "Criteria added",
    description: "All library criteria have been added to your session.",
    color: "success",
  });
};

const updateWeight = (criterionId: string, weight: number) => {
  const c = store.activeSession?.criteria.find((x) => x.id === criterionId);
  if (!c) return;
  store.upsertCriterion({ ...c, weight });
};

const toggleDirection = (c: any) => {
  store.upsertCriterion({
    ...c,
    direction:
      c.direction === "higher-is-better"
        ? "lower-is-better"
        : "higher-is-better",
  });
};

const goBack = () => {
  router.push(`/sessions/${sessionId.value}/countries`);
};

const goNext = () => {
  router.push(`/sessions/${sessionId.value}/scoring`);
};

const goHome = () => {
  router.push("/");
};

watch(sessionId, () => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});

onMounted(() => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});
</script>
