<template>
  <UCard :ui="{ body: 'p-2 sm:p-2.5' }">
    <div class="space-y-3">
      <div class="flex flex-col gap-2 md:flex-row md:items-center">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex-1 min-w-0 flex flex-col">
            <div class="flex items-center w-full">
              <div
                class="hidden sm:flex p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0 mr-2"
              >
                <UIcon
                  class="w-3.5 h-3.5 text-primary-600"
                  name="i-lucide-earth"
                />
              </div>

              <ClientOnly>
                <UInput
                  v-model="localTitle"
                  class="w-full max-w-sm"
                  input-class="text-primary-600 dark:text-primary-400 font-bold text-base"
                  placeholder="Session title"
                  size="md"
                  variant="none"
                  @blur="commitTitle"
                  @keydown.enter.prevent="commitTitle"
                />
                <template #fallback>
                  <div
                    class="h-8 w-full max-w-sm bg-gray-100 dark:bg-gray-800 animate-pulse rounded opacity-50"
                  ></div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            size="xs"
            variant="ghost"
            @click="isDeleteModalOpen = true"
          />
        </div>
      </div>

      <div class="space-y-2">
        <div class="grid grid-cols-4 gap-2">
          <UButton
            v-for="step in steps"
            :key="step.key"
            :class="[
              'h-8 sm:h-10 flex-col transition-all duration-300 group/step',
              step.isActive ? 'ring-2 ring-primary-500 ring-offset-1' : '',
            ]"
            :color="
              step.isActive ? 'primary' : step.isDone ? 'success' : 'neutral'
            "
            :variant="step.isActive ? 'solid' : step.isDone ? 'subtle' : 'soft'"
            @click="go(step.to)"
          >
            <!-- Content -->
            <div
              class="flex flex-col items-center justify-center gap-1 w-full h-full"
            >
              <span
                class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-center px-1"
              >
                {{ step.label }}
              </span>
            </div>

            <!-- Progress Indicator Dot (small) -->
            <div v-if="step.isDone" class="absolute top-1 right-1">
              <UIcon class="w-3 h-3" name="i-lucide-check-circle" />
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

    <div v-if="isDeleteModalOpen">
      <ConfirmModal
        v-model:open="isDeleteModalOpen"
        confirm-color="error"
        confirm-label="Delete"
        message="Are you sure you want to delete this session? This will permanently delete this session and all its data."
        title="Delete Session"
        @confirm="confirmDelete"
      />
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const store = useSessionsStore();
const router = useRouter();
const route = useRoute();

const localTitle = ref("");
const isDeleteModalOpen = ref(false);
const toast = useToast();

const confirmDelete = () => {
  if (sessionId.value) {
    store.deleteSession(sessionId.value);
    toast.add({
      title: "Session deleted",
      color: "neutral",
    });
    router.push("/");
  }
};

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
    return {
      ...s,
      to,
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
