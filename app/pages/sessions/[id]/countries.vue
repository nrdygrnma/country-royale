<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
    <SessionWizardHeader />

    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Pick countries
        </h1>
        <p class="text-xs text-gray-500">Choose your candidates</p>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="soft" @click="goHome">Back</UButton>
        <UButton
          :disabled="selectedCodes.length === 0"
          size="sm"
          @click="onContinue"
        >
          Continue
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <div
        v-if="sessionExists"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        <div class="lg:col-span-2 space-y-6">
          <UCard :ui="{ body: 'p-6' }">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div
                  class="text-sm font-bold uppercase tracking-wider text-gray-500"
                >
                  Candidate Selection
                </div>
                <UBadge
                  v-if="selectedCodes.length > 0"
                  color="primary"
                  size="xs"
                  variant="soft"
                >
                  {{ selectedCodes.length }} selected
                </UBadge>
              </div>

              <!-- Selected Countries Badges ABOVE the SelectMenu to avoid being covered -->
              <div
                v-if="selectedCodes.length > 0"
                class="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <UBadge
                  v-for="item in selectedCodes"
                  :key="item.value"
                  class="pl-2 pr-1 py-1"
                  color="primary"
                  variant="subtle"
                >
                  {{ item.label }}
                  <UButton
                    class="ml-1 -my-1"
                    color="primary"
                    icon="i-lucide-x"
                    size="xs"
                    variant="ghost"
                    @click="removeCountry(item.value)"
                  />
                </UBadge>
              </div>

              <USelectMenu
                v-model="selectedCodes"
                :items="countryItems"
                class="w-full"
                create-item
                multiple
                placeholder="Search and add countries..."
                searchable
                size="md"
                @create="handleCreateCountry"
              >
                <template #create-item-label="{ item }">
                  Add custom country:
                  <span class="font-medium italic">{{ item }}</span>
                </template>
              </USelectMenu>
            </div>
          </UCard>

          <!-- Country Notes moved to Main Column for better optimization -->
          <div v-if="selectedCodes.length > 0" class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <div
                class="font-bold text-xs uppercase tracking-wider text-gray-500"
              >
                Country notes
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UCard
                v-for="code in actualCodes"
                :key="code"
                :ui="{ body: 'p-4' }"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-bold truncate pr-2">
                    {{ codeToName.get(code) ?? code }}
                  </div>
                  <UButton
                    color="neutral"
                    size="xs"
                    variant="ghost"
                    @click="clearNote(code)"
                  >
                    Clear
                  </UButton>
                </div>

                <UTextarea
                  :model-value="getNote(code)"
                  :rows="3"
                  autoresize
                  class="text-xs w-full"
                  placeholder="What makes this country a candidate?"
                  size="sm"
                  @update:model-value="(v: unknown) => setNote(code, v)"
                />
              </UCard>
            </div>
          </div>
        </div>

        <!-- Sidebar (Right) -->
        <aside class="lg:col-span-1 space-y-4">
          <UCard :ui="{ body: 'p-4' }">
            <div class="space-y-4">
              <div
                class="flex items-center gap-2 text-primary-600 dark:text-primary-400"
              >
                <UIcon class="w-5 h-5" name="i-lucide-lightbulb" />
                <h3 class="text-sm font-bold uppercase tracking-wider">Tips</h3>
              </div>

              <div class="text-xs text-gray-500 leading-relaxed space-y-3">
                <p>
                  <strong>Compare at least 2 countries</strong> to see a
                  meaningful ranking in the results.
                </p>
                <p>
                  <strong>Custom countries</strong> can be added if your
                  specific destination isn't in the list—just type the name and
                  press Enter.
                </p>
                <p>
                  <strong>Notes</strong> are optional but helpful for the final
                  report to remember your qualitative reasoning.
                </p>
              </div>
            </div>
          </UCard>
        </aside>
      </div>

      <UCard v-else>
        <div class="space-y-2">
          <div class="font-medium">Session not found</div>
          <div class="text-sm opacity-70">
            That session id doesn’t exist (yet). Go back and create one.
          </div>
          <UButton class="mt-2" @click="goHome">Go home</UButton>
        </div>
      </UCard>

      <template #fallback>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-6">
            <UCard :ui="{ body: 'p-4' }">
              <div class="animate-pulse space-y-4">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"
                ></div>
                <div
                  class="h-8 bg-gray-200 dark:bg-gray-800 rounded w-full"
                ></div>
              </div>
            </UCard>
          </div>
          <div class="lg:col-span-1">
            <UCard :ui="{ body: 'p-4' }">
              <div class="animate-pulse space-y-2">
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full"
                ></div>
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"
                ></div>
              </div>
            </UCard>
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
const selectedCodes = ref<Array<{ label: string; value: string }>>([]);

const sessionId = computed(() => String(route.params.id ?? ""));

const allAvailableCountries = computed(() => {
  return [...COUNTRIES, ...store.customCountries];
});

// Build the dropdown items
const countryItems = computed(() =>
  allAvailableCountries.value.map((c) => ({ label: c.name, value: c.code })),
);

// Quick lookup for badges
const codeToName = computed(() => {
  const map = new Map<string, string>();
  for (const c of allAvailableCountries.value) map.set(c.code, c.name);
  return map;
});

const actualCodes = computed(() => {
  return selectedCodes.value
    .map((v) => (typeof v === "object" && v !== null ? v.value : v))
    .filter(Boolean);
});

const handleCreateCountry = (name: string) => {
  if (!name) return;

  // Derive a unique code
  const base = name.replace(/\s+/g, " ").toUpperCase();
  let code = base.slice(0, 3);
  const existing = new Set(allAvailableCountries.value.map((c) => c.code));
  let i = 1;
  while (existing.has(code)) {
    code = base.slice(0, 2) + String(i);
    i++;
  }

  // 1. Add to persistent store (this updates allAvailableCountries -> countryItems)
  const newCountry = { name, code, region: "Custom" as const };
  store.addCustomCountry(newCountry);

  // 2. Create the item object
  const newItem = { label: name, value: code };

  // 3. Update the v-model (selectedCodes)
  // Since we are multiple, we push or re-assign
  const alreadySelected = selectedCodes.value.some(
    (x) => (typeof x === "object" && x !== null ? x.value : x) === code,
  );
  if (!alreadySelected) {
    selectedCodes.value = [...selectedCodes.value, newItem];
  }
};

const getNote = (code: string) => {
  return store.activeSession?.notes?.[code] ?? "";
};

const setNote = (code: string, v: unknown) => {
  const note = typeof v === "string" ? v : "";
  store.setCountryNote(code, note);
};

const clearNote = (code: string) => {
  store.clearCountryNote(code);
};

const sessionExists = computed(() =>
  store.sessions.some((s: any) => s.id === sessionId.value),
);

const hydrateFromStore = () => {
  const s = store.sessions.find((x: any) => x.id === sessionId.value);
  if (!s) return;
  // Map codes back to objects for USelectMenu
  const codesInSession = s.countryCodes || [];
  selectedCodes.value = codesInSession.map((code: string) => {
    const country = allAvailableCountries.value.find((c) => c.code === code);
    return {
      label: country?.name ?? code,
      value: code,
    };
  });
};

const removeCountry = (code: string) => {
  selectedCodes.value = selectedCodes.value.filter(
    (item) => item.value !== code,
  );
};

const onContinue = () => {
  const codes = selectedCodes.value
    .map((v) => (typeof v === "object" && v !== null ? v.value : v))
    .filter(Boolean);
  store.setCountries(codes);
  router.push(`/sessions/${sessionId.value}/criteria`);
};

const goHome = () => {
  router.push("/");
};

watch(sessionId, () => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
  hydrateFromStore();
});

onMounted(() => {
  // Mark session active
  if (sessionId.value) store.setActiveSession(sessionId.value);
  // Pre-fill selected codes if user comes back to this page
  // Delay a bit to ensure store is hydrated if arriving via direct link
  if (store.isHydrated) {
    hydrateFromStore();
  } else {
    const unwatch = watch(
      () => store.isHydrated,
      (h) => {
        if (h) {
          hydrateFromStore();
          unwatch();
        }
      },
    );
  }
});
</script>
