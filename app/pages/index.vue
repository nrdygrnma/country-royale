<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Sessions
        </h2>
        <p class="text-xs text-gray-500 leading-tight">
          Manage your comparisons
        </p>
      </div>

      <div class="flex items-center gap-2">
        <div
          class="flex items-center gap-2 bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all"
        >
          <UInput
            v-model="title"
            class="w-40 sm:w-64"
            placeholder="New comparison..."
            size="sm"
            variant="none"
          />
          <UButton size="sm" @click="onCreate">Create</UButton>
        </div>
        <ClientOnly>
          <UTooltip text="Clear all sessions">
            <UButton
              :disabled="!isHydrated || store.sessions.length === 0"
              color="error"
              icon="i-lucide-trash-2"
              size="sm"
              variant="ghost"
              @click="askClearAll"
            />
          </UTooltip>
        </ClientOnly>
      </div>
    </div>

    <div class="grid gap-3">
      <ClientOnly>
        <TransitionGroup
          v-if="store.sessions.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          name="list"
          tag="div"
        >
          <UCard v-for="s in store.sessions" :key="s.id" :ui="{ body: 'p-3' }">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="font-medium truncate text-sm">{{ s.title }}</div>
                <div class="text-[10px] opacity-60">
                  {{ formatDate(s.createdAt) }}
                </div>
              </div>

              <div class="flex items-center gap-1">
                <UButton size="xs" variant="soft" @click="goToSession(s.id)"
                  >Open</UButton
                >
                <UTooltip text="Delete session">
                  <UButton
                    color="neutral"
                    icon="i-lucide-trash-2"
                    size="xs"
                    variant="ghost"
                    @click="askDelete(s.id)"
                  />
                </UTooltip>
              </div>
            </div>
          </UCard>
        </TransitionGroup>

        <UCard v-else-if="isHydrated">
          <div class="opacity-70">No sessions yet. Create one to begin.</div>
        </UCard>

        <template #fallback>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <!-- SSR-safe skeleton -->
            <UCard v-for="i in 3" :key="i" :ui="{ body: 'p-3' }">
              <div class="animate-pulse flex space-x-4">
                <div class="flex-1 space-y-4 py-1">
                  <div
                    class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"
                  ></div>
                  <div class="space-y-2">
                    <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </template>
      </ClientOnly>
    </div>
    <div v-if="isHydrated">
      <ConfirmModal
        v-model:open="isDeleteOpen"
        confirm-color="error"
        confirm-label="Delete"
        description="This cannot be undone (unless you exported it)."
        title="Delete this session?"
        @confirm="confirmDelete"
      />

      <ConfirmModal
        v-model:open="isClearOpen"
        confirm-color="error"
        confirm-label="Clear all"
        description="This deletes everything stored locally."
        title="Clear all sessions?"
        @confirm="confirmClearAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const store = useSessionsStore();
const router = useRouter();
const isHydrated = ref(false);

const title = ref("");
const isDeleteOpen = ref(false);
const isClearOpen = ref(false);
const pendingDeleteId = ref<string | null>(null);

onMounted(() => {
  isHydrated.value = true;
  const share = router.currentRoute.value.query.share;
  if (share && typeof share === "string") {
    try {
      const json = Buffer.from(share, "base64").toString("utf8");
      const data = JSON.parse(json);

      // Map back to ComparisonSession
      const criteria = (data.cr || []).map((c: any) => ({
        id: crypto.randomUUID(),
        label: c[0],
        description: c[1] || undefined,
        weight: c[2],
        direction: c[3] as "higher-is-better" | "lower-is-better",
      }));

      // Need a map for criterion IDs since we regenerated them
      const criterionMap = new Map();
      (data.cr || []).forEach((c: any, i: number) => {
        criterionMap.set(c[0], criteria[i].id);
      });

      const scores = (data.s || []).map((s: any) => ({
        countryCode: s[0],
        criterionId: criterionMap.get(s[1]) || s[1], // Try map by label/id
        score: s[2],
      }));

      const newId = store.createSession(data.t || "Shared Comparison");
      const session = store.sessions.find((s) => s.id === newId);
      if (session) {
        session.countryCodes = data.c || [];
        session.criteria = criteria;
        session.scores = scores;
        session.notes = data.n || {};
      }

      // Clear query param
      router.replace("/");

      useToast().add({
        title: "Session shared",
        description: `Imported "${data.t}" via link.`,
        color: "success",
      });
    } catch (e) {
      console.error("Failed to import share link", e);
    }
  }
});

const onCreate = () => {
  const id = store.createSession(title.value);
  title.value = "";
  router.push(`/sessions/${id}/countries`);
};

const formatDate = (iso: string) => {
  // SSR-safe formatting (same on server and client)
  return new Date(iso).toISOString().slice(0, 16).replace("T", " ");
};

const askDelete = (id: string) => {
  pendingDeleteId.value = id;
  isDeleteOpen.value = true;
};

const confirmDelete = () => {
  if (!pendingDeleteId.value) return;
  store.deleteSession(pendingDeleteId.value);
  pendingDeleteId.value = null;
  isDeleteOpen.value = false;
};

const askClearAll = () => {
  isClearOpen.value = true;
};

const confirmClearAll = () => {
  store.clearAllSessions();
  isClearOpen.value = false;
};

const goToSession = (id: string) => {
  store.setActiveSession(id);
  router.push(`/sessions/${id}/countries`);
};

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    isDeleteOpen.value = false;
    isClearOpen.value = false;
  },
);
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
