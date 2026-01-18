<template>
  <UCard :ui="{ body: 'p-3 sm:p-4' }">
    <div class="space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex-1 min-w-0 flex flex-col">
            <div class="flex items-center w-full">
              <div
                class="hidden sm:flex p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0 mr-2"
              >
                <UIcon class="w-4 h-4 text-primary-600" name="i-lucide-earth" />
              </div>

              <ClientOnly>
                <UInput
                  v-model="localTitle"
                  class="w-full max-w-sm"
                  input-class="text-primary-600 dark:text-primary-400 font-semibold text-lg"
                  placeholder="Session title"
                  size="lg"
                  variant="none"
                  @blur="commitTitle"
                  @keydown.enter.prevent="commitTitle"
                />
                <template #fallback>
                  <div
                    class="h-10 w-full max-w-sm bg-gray-100 dark:bg-gray-800 animate-pulse rounded opacity-50"
                  ></div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-4 gap-2">
          <UButton
            v-for="step in steps"
            :key="step.key"
            :class="[
              'relative h-16 sm:h-20 flex-col overflow-hidden transition-all duration-300 group/step',
              step.isActive
                ? 'ring-2 ring-primary-500 ring-offset-2'
                : 'grayscale hover:grayscale-0',
            ]"
            variant="ghost"
            @click="go(step.to)"
          >
            <!-- Background Image -->
            <div
              :class="`step-bg-${step.key}`"
              class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/step:scale-110"
            />
            <!-- Overlay -->
            <div
              :class="[
                'absolute inset-0 transition-colors duration-300',
                step.isActive
                  ? 'bg-primary-900/40'
                  : 'bg-black/60 group-hover/step:bg-black/40',
              ]"
            />

            <!-- Content -->
            <div
              class="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full text-white"
            >
              <span
                :class="[
                  'text-[10px] sm:text-xs font-black uppercase tracking-widest text-center px-1',
                  step.isActive ? 'text-white' : 'text-white/80',
                ]"
              >
                {{ step.label }}
              </span>
            </div>

            <!-- Progress Indicator Dot (small) -->
            <div v-if="step.isDone" class="absolute top-1 right-1 z-20">
              <UIcon
                class="w-4 h-4 text-success-500 bg-white rounded-full p-0.5 shadow-sm"
                name="i-lucide-check-circle"
              />
            </div>
          </UButton>
        </div>

        <div class="flex items-center gap-1 px-0.5">
          <div
            v-for="step in steps"
            :key="step.key"
            :class="[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              step.isDone || step.isActive
                ? 'bg-primary-500'
                : 'bg-gray-100 dark:bg-gray-800',
            ]"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const store = useSessionsStore();
const router = useRouter();
const route = useRoute();

const localTitle = ref("");
const toast = useToast();

type StepKey = "countries" | "criteria" | "scoring" | "results";

const sessionId = computed(() => String(route.params.id ?? ""));
const path = computed(() => route.path);

const stepDefs: Array<{
  key: StepKey;
  label: string;
  segment: string;
}> = [
  { key: "countries", label: "Countries", segment: "/countries" },
  { key: "criteria", label: "Criteria", segment: "/criteria" },
  { key: "scoring", label: "Scoring", segment: "/scoring" },
  { key: "results", label: "Results", segment: "/results" },
];

const commitTitle = () => {
  const newTitle = localTitle.value.trim() || "Untitled comparison";
  if (store.activeSession?.title === newTitle) return;

  const renamed = store.renameActiveSession(newTitle);
  if (renamed) {
    toast.add({
      title: "Session renamed",
      description: `Session "${newTitle}" saved.`,
      color: "success",
    });
  }
};

const currentIndex = computed(() => {
  const p = path.value;
  const idx = stepDefs.findIndex((s) => p.includes(s.segment));
  return idx === -1 ? 0 : idx;
});

const steps = computed(() => {
  const idx = currentIndex.value;

  return stepDefs.map((s, i) => {
    const to = `/sessions/${sessionId.value}${s.segment}`;
    const isActive = i === idx;
    const isDone = i < idx;

    let variant: "solid" | "soft" | "ghost" | "outline" | "subtle" = "ghost";
    if (isActive) variant = "solid";
    else if (isDone) variant = "soft";

    return {
      ...s,
      to,
      variant,
      isActive,
      isDone,
    };
  });
});

const go = (to: string) => {
  router.push(to);
};

watch(
  () => store.activeSession?.title,
  (t) => {
    localTitle.value = t ?? "";
  },
  { immediate: true },
);
</script>

<style scoped>
.step-bg-countries {
  background-image: url("~/assets/images/wizard_countries.png");
}
.step-bg-criteria {
  background-image: url("~/assets/images/wizard_criteria.png");
}
.step-bg-scoring {
  background-image: url("~/assets/images/wizard_scoring.png");
}
.step-bg-results {
  background-image: url("~/assets/images/wizard_results.png");
}
</style>
