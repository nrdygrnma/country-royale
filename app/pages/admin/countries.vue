<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="flex-1">
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <UIcon class="text-primary-500" name="i-lucide-earth" />
          Countries Management
        </h1>
        <p class="text-sm text-gray-500">
          Manage your global list of countries and their codes
        </p>
      </div>

      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <UInput
          v-model="searchQuery"
          class="sm:w-64"
          icon="i-lucide-search"
          placeholder="Search countries..."
          size="sm"
        />
        <UButton icon="i-lucide-plus" size="sm" @click="openAddCountry">
          Add Country
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <div
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
      >
        <UTable :columns="columns" :data="filteredCountries" class="w-full">
          <template #name-cell="{ row }">
            <div
              class="font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              {{ (row.original as Country).name }}
            </div>
          </template>

          <template #code-cell="{ row }">
            <UBadge class="font-mono" size="xs" variant="subtle">
              {{ (row.original as Country).code }}
            </UBadge>
          </template>

          <template #region-cell="{ row }">
            <span class="text-xs text-gray-500">
              {{ (row.original as Country).region }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-1">
              <UButton
                color="neutral"
                icon="i-lucide-edit-2"
                size="xs"
                variant="ghost"
                @click="openEditCountry(row.original as Country)"
              />
              <UButton
                color="error"
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                @click="confirmDeleteCountry(row.original as Country)"
              />
            </div>
          </template>

          <template #empty-state>
            <div
              class="py-12 flex flex-col items-center justify-center text-gray-400 gap-2"
            >
              <UIcon class="w-12 h-12 opacity-20" name="i-lucide-globe" />
              <div class="text-sm">No countries added yet</div>
              <UButton
                class="mt-2"
                size="sm"
                variant="soft"
                @click="openAddCountry"
                >Add your first country</UButton
              >
            </div>
          </template>
        </UTable>
      </div>

      <template #fallback>
        <div class="animate-pulse space-y-4">
          <div class="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
          <div
            v-for="i in 5"
            :key="i"
            class="h-16 bg-gray-100 dark:bg-gray-800 rounded w-full"
          ></div>
        </div>
      </template>
    </ClientOnly>

    <div v-if="isHydrated">
      <!-- Add/Edit Country Modal -->
      <AppModal
        v-model:open="isCountryModalOpen"
        :title="editingCountry ? 'Edit Country' : 'Add Country'"
        description="Enter a country name to search and verify"
      >
        <div class="p-4 space-y-4">
          <UFormField label="Country Name">
            <div class="flex gap-2">
              <UInput
                v-model="countryDraft.name"
                class="flex-1"
                placeholder="e.g. Costa Rica"
                @keydown.enter="searchCountry"
              />
              <UButton
                :loading="isSearching"
                icon="i-lucide-search"
                @click="searchCountry"
              >
                Search
              </UButton>
            </div>
          </UFormField>

          <div v-if="verificationResults.length > 0" class="space-y-2">
            <div
              class="text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              Matches found
            </div>
            <div
              class="max-h-48 overflow-y-auto space-y-2 border border-gray-100 dark:border-gray-800 rounded-xl p-2"
            >
              <div
                v-for="c in verificationResults"
                :key="c.cca2"
                class="flex items-center justify-between p-2 border border-transparent hover:border-primary-500/30 hover:bg-primary-50/50 dark:hover:bg-primary-950/10 rounded-lg cursor-pointer transition-all group"
                @click="selectVerifiedCountry(c)"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ c.flag }}</span>
                  <div>
                    <div class="font-bold text-sm">{{ c.name.common }}</div>
                    <div class="text-[10px] text-gray-500">
                      {{ c.region }} • {{ c.cca2 }}
                    </div>
                  </div>
                </div>
                <UIcon
                  class="w-4 h-4 text-primary-500 opacity-0 group-hover:opacity-100"
                  name="i-lucide-check"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="ISO Code">
              <UInput
                v-model="countryDraft.code"
                class="font-mono"
                placeholder="e.g. CR"
              />
            </UFormField>
            <UFormField label="Region">
              <UInput
                v-model="countryDraft.region"
                placeholder="e.g. Americas"
              />
            </UFormField>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isCountryModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              :disabled="!countryDraft.name || !countryDraft.code"
              @click="saveCountry"
            >
              {{ editingCountry ? "Update" : "Add" }}
            </UButton>
          </div>
        </template>
      </AppModal>

      <!-- Generic Confirmation Modal -->
      <ConfirmModal
        v-model:open="isConfirmOpen"
        :confirm-color="confirmColor"
        :message="confirmMessage"
        :title="confirmTitle"
        description="Confirm action"
        @confirm="onConfirm?.()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Country } from "~/types/countryRoyale";
import type { TableColumn } from "@nuxt/ui";
import { COUNTRIES } from "~/data/countries";

const store = useSessionsStore();
const toast = useToast();
const isHydrated = ref(false);
const searchQuery = ref("");

onMounted(() => {
  isHydrated.value = true;
});

const columns: TableColumn<Country>[] = [
  { id: "name", header: "Country" },
  { id: "code", header: "Code" },
  { id: "region", header: "Region" },
  { id: "actions" },
];

const allCountries = computed(() => {
  // Combine default countries and master countries from store
  // Avoid duplicates by code
  const combined = [...COUNTRIES, ...store.masterCountries];
  const unique = new Map<string, Country>();
  combined.forEach((c) => unique.set(c.code, c));
  return Array.from(unique.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
});

const filteredCountries = computed(() => {
  if (!searchQuery.value.trim()) return allCountries.value;
  const q = searchQuery.value.toLowerCase();
  return allCountries.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q),
  );
});

// Country CRUD
const isCountryModalOpen = ref(false);
const editingCountry = ref<Country | null>(null);
const isSearching = ref(false);
const verificationResults = ref<any[]>([]);

const countryDraft = reactive({
  name: "",
  code: "",
  region: "",
});

const openAddCountry = () => {
  editingCountry.value = null;
  countryDraft.name = "";
  countryDraft.code = "";
  countryDraft.region = "";
  verificationResults.value = [];
  isCountryModalOpen.value = true;
};

const openEditCountry = (c: Country) => {
  editingCountry.value = c;
  countryDraft.name = c.name;
  countryDraft.code = c.code;
  countryDraft.region = c.region;
  verificationResults.value = [];
  isCountryModalOpen.value = true;
};

const searchCountry = async () => {
  if (!countryDraft.name) return;
  isSearching.value = true;
  verificationResults.value = [];

  try {
    const data: any[] = await $fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryDraft.name)}`,
    );
    if (data && data.length > 0) {
      verificationResults.value = data;
    } else {
      toast.add({ title: "No matches found", color: "warning" });
    }
  } catch (e) {
    toast.add({
      title: "Search failed",
      description: "Could not connect to RestCountries API",
      color: "error",
    });
  } finally {
    isSearching.value = false;
  }
};

const selectVerifiedCountry = (c: any) => {
  countryDraft.name = c.name.common;
  countryDraft.code = c.cca2;
  countryDraft.region = c.region;
  verificationResults.value = [];
};

const saveCountry = () => {
  store.upsertMasterCountry({
    name: countryDraft.name,
    code: countryDraft.code,
    region: countryDraft.region,
  });
  isCountryModalOpen.value = false;
  toast.add({
    title: editingCountry.value ? "Country updated" : "Country added",
    color: "success",
  });
};

const isConfirmOpen = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmColor = ref<
  "error" | "info" | "success" | "primary" | "secondary" | "warning" | "neutral"
>("primary");
const onConfirm = ref<(() => void) | null>(null);

const confirmDeleteCountry = (c: Country) => {
  // Check if it's a default country
  const isDefault = COUNTRIES.some((dc) => dc.code === c.code);
  if (isDefault) {
    toast.add({
      title: "Cannot delete default country",
      description: "This country is part of the system defaults.",
      color: "warning",
    });
    return;
  }

  confirmTitle.value = "Delete Country";
  confirmMessage.value = `Are you sure you want to delete "${c.name}" from your library?`;
  confirmColor.value = "error";
  onConfirm.value = () => {
    store.deleteMasterCountry(c.code);
    toast.add({ title: "Country deleted", color: "neutral" });
    isConfirmOpen.value = false;
  };
  isConfirmOpen.value = true;
};
</script>
