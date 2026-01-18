<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <ClientOnly>
      <div v-if="isHydrated" class="space-y-6">
        <!-- Hero Section -->
        <div
          :class="[
            'relative overflow-hidden transition-all duration-700 bg-gray-900',
            store.sessions.length === 0
              ? 'rounded-3xl px-6 py-20 shadow-2xl sm:px-12 sm:py-32 lg:px-20'
              : 'rounded-2xl p-6 shadow-xl sm:px-8 sm:py-10',
          ]"
        >
          <img
            :src="`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=60&w=1200&auto=format&fit=crop&client_id=${UNSPLASH_CLIENT_ID}`"
            alt=""
            class="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
            @error="(e: any) => (e.target.style.display = 'none')"
          />
          <div :class="['relative mx-auto max-w-2xl text-center']">
            <h2
              :class="[
                'font-bold tracking-tight text-white transition-all',
                store.sessions.length === 0
                  ? 'text-3xl sm:text-4xl'
                  : 'text-xl sm:text-2xl',
              ]"
            >
              Discover your perfect match.
            </h2>
            <p
              v-if="store.sessions.length === 0"
              class="mt-6 text-lg leading-8 text-gray-300"
            >
              Country Royale helps you make objective decisions about where to
              live, work, or travel. Define what matters, compare candidates,
              and see your rankings.
            </p>
            <div
              :class="[
                'flex items-center gap-x-6 transition-all justify-center',
                store.sessions.length === 0 ? 'mt-10' : 'mt-6',
              ]"
            >
              <div
                class="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 shadow-xl backdrop-blur-md focus-within:ring-2 focus-within:ring-primary-500 transition-all w-full max-w-md"
              >
                <UInput
                  v-model="title"
                  class="flex-1 hero-input"
                  placeholder="What are you comparing?"
                  size="xl"
                  variant="none"
                  @keydown.enter="onCreate"
                />
                <UButton size="xl" @click="onCreate">Get Started</UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Features (only if no sessions) -->
        <div
          v-if="store.sessions.length === 0"
          class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          <div class="flex flex-col items-center text-center space-y-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500"
            >
              <UIcon class="w-6 h-6" name="i-lucide-list-checks" />
            </div>
            <h3 class="text-lg font-bold">Define Criteria</h3>
            <p class="text-sm text-gray-500">
              Pick from our library or create your own custom metrics.
            </p>
          </div>
          <div class="flex flex-col items-center text-center space-y-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500"
            >
              <UIcon class="w-6 h-6" name="i-lucide-database" />
            </div>
            <h3 class="text-lg font-bold">Auto-Data Sync</h3>
            <p class="text-sm text-gray-500">
              Fetch real-world stats for GDP, cost of living, and more.
            </p>
          </div>
          <div class="flex flex-col items-center text-center space-y-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500"
            >
              <UIcon class="w-6 h-6" name="i-lucide-file-text" />
            </div>
            <h3 class="text-lg font-bold">Detailed Reports</h3>
            <p class="text-sm text-gray-500">
              Get an executive summary and in-depth thematic analysis.
            </p>
          </div>
        </div>

        <!-- Session List -->
        <div v-else class="space-y-6 pt-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <h1
                class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <UIcon class="text-primary-500" name="i-lucide-layers" />
                Recent Sessions
              </h1>
              <p class="text-xs text-gray-500">
                Pick up where you left off or clear your history
              </p>
            </div>

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
          </div>

          <div class="grid gap-4">
            <TransitionGroup
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              name="list"
              tag="div"
            >
              <UCard
                v-for="s in sortedSessions"
                :key="s.id"
                :ui="{
                  body: 'p-0',
                  root: 'overflow-hidden group hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer',
                }"
                @click="goToSession(s.id)"
              >
                <div
                  class="relative h-32 overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    v-if="getSessionImage(s)"
                    :src="getSessionImage(s)"
                    alt=""
                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    @error="(e: any) => (e.target.style.display = 'none')"
                  />
                  <div
                    class="absolute inset-0 bg-linear-to-t from-gray-900/80 to-transparent"
                  ></div>
                  <div
                    v-if="s.coverImageAttribution"
                    class="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm bg-black/40 backdrop-blur-xs text-[8px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Photo by {{ s.coverImageAttribution }}
                  </div>
                  <div
                    class="absolute bottom-3 left-3 right-3 flex items-end justify-between"
                  >
                    <div class="flex -space-x-2">
                      <div
                        v-for="code in s.countryCodes.slice(0, 3)"
                        :key="code"
                        class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold overflow-hidden"
                      >
                        <img
                          :alt="code"
                          :src="`https://flagcdn.com/w40/${code.toLowerCase()}.png`"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-if="s.countryCodes.length > 3"
                        class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[8px] font-bold"
                      >
                        +{{ s.countryCodes.length - 3 }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div
                        class="font-bold truncate text-base text-gray-900 dark:text-white"
                      >
                        {{ s.title }}
                      </div>
                      <div
                        class="text-[10px] text-gray-500 mt-1 flex items-center gap-1"
                      >
                        <UIcon class="w-3 h-3" name="i-lucide-calendar" />
                        {{ formatDate(s.createdAt) }}
                      </div>
                    </div>

                    <div
                      class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UTooltip text="Delete session">
                        <UButton
                          color="error"
                          icon="i-lucide-trash-2"
                          size="xs"
                          variant="ghost"
                          @click.stop="askDelete(s.id)"
                        />
                      </UTooltip>
                    </div>
                  </div>

                  <div class="mt-4 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1 text-gray-500">
                        <UIcon class="w-3.5 h-3.5" name="i-lucide-globe" />
                        {{ s.countryCodes.length }}
                      </div>
                      <div class="flex items-center gap-1 text-gray-500">
                        <UIcon
                          class="w-3.5 h-3.5"
                          name="i-lucide-list-checks"
                        />
                        {{ s.criteria.length }}
                      </div>
                    </div>
                    <UButton
                      size="xs"
                      variant="soft"
                      @click.stop="goToSession(s.id)"
                    >
                      Continue
                    </UButton>
                  </div>
                </div>
              </UCard>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <template #fallback>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="i in 3" :key="i" :ui="{ body: 'p-4' }">
            <div class="animate-pulse space-y-4">
              <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div class="space-y-2">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"
                ></div>
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"
                ></div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </ClientOnly>

    <div v-if="isHydrated">
      <ConfirmModal
        v-model:open="isDeleteOpen"
        :description="`Are you sure you want to delete \&quot;${store.sessions.find((s) => s.id === pendingDeleteId)?.title}\&quot;? This cannot be undone.`"
        confirm-color="error"
        confirm-label="Delete"
        title="Delete this session?"
        @confirm="confirmDelete"
      />

      <ConfirmModal
        v-model:open="isClearOpen"
        confirm-color="error"
        confirm-label="Clear all"
        description="This deletes everything stored locally. This action is irreversible."
        title="Clear all sessions?"
        @confirm="confirmClearAll"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { fetchCountryImage, UNSPLASH_CLIENT_ID } from "~/utils/unsplash";

const store = useSessionsStore();
const router = useRouter();
const isHydrated = ref(false);

const title = ref("");
const isDeleteOpen = ref(false);
const isClearOpen = ref(false);
const pendingDeleteId = ref<string | null>(null);

const sortedSessions = computed(() => {
  return [...store.sessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
});

const codeToName = computed(() => {
  const map = new Map<string, string>();
  store.masterCountries.forEach((c) => map.set(c.code, c.name));
  store.customCountries.forEach((c) => map.set(c.code, c.name));
  return map;
});

const getSessionImage = (session: any) => {
  if (session.coverImage) return session.coverImage;

  if (session.countryCodes && session.countryCodes.length > 0) {
    const code = session.countryCodes[0];
    const name = codeToName.value.get(code) || code;

    // We trigger the fetch in the background and update the session store
    if (import.meta.client) {
      fetchCountryImage(name).then((imageData) => {
        if (imageData) {
          store.sessions = store.sessions.map((s) =>
            s.id === session.id
              ? {
                  ...s,
                  coverImage: imageData.url,
                  coverImageAttribution: imageData.attribution,
                }
              : s,
          );
        }
      });
    }
  }

  // Use a stable, lower-res default image for better performance
  return `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=60&w=800&auto=format&fit=crop&client_id=${UNSPLASH_CLIENT_ID}`;
};

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
