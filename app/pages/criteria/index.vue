<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="flex-1">
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <UIcon class="text-primary-500" name="i-lucide-library" />
          Criteria Library
        </h1>
        <p class="text-sm text-gray-500">
          Manage global criteria and categories for all your sessions
        </p>
      </div>

      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <UInput
          v-model="searchQuery"
          class="sm:w-64"
          icon="i-lucide-search"
          placeholder="Search criteria..."
          size="sm"
        />
        <div class="flex gap-2">
          <UButton icon="i-lucide-plus" size="sm" @click="openAddCriterion">
            Add Criterion
          </UButton>
          <UButton
            icon="i-lucide-folder-plus"
            size="sm"
            variant="soft"
            @click="isAddCategoryModalOpen = true"
          >
            Add Category
          </UButton>
        </div>
      </div>
    </div>

    <ClientOnly>
      <div class="space-y-10">
        <!-- Categories and Criteria -->
        <div v-for="cat in allCategories" :key="cat" class="space-y-4">
          <div
            v-if="criteriaByCategory[cat]?.length"
            class="flex items-center justify-between border-b-2 border-gray-100 dark:border-gray-800 pb-2"
            @drop="onDropCriterion(cat)"
            @dragover.prevent
          >
            <div class="flex items-center gap-2">
              <h2
                class="text-sm font-black uppercase tracking-widest text-gray-500"
              >
                {{ cat || "Uncategorized" }}
              </h2>
              <UBadge color="neutral" size="xs" variant="soft">
                {{ criteriaByCategory[cat]?.length || 0 }}
              </UBadge>
            </div>
            <div v-if="cat" class="flex gap-1">
              <UButton
                color="neutral"
                icon="i-lucide-edit-2"
                size="xs"
                variant="ghost"
                @click="openRenameCategory(cat)"
              />
              <UButton
                color="error"
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                @click="confirmDeleteCategory(cat)"
              />
            </div>
          </div>

          <div
            v-if="criteriaByCategory[cat]?.length"
            class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
            @drop="onDropCriterion(cat)"
            @dragover.prevent
          >
            <UTable
              :columns="columns"
              :data="criteriaByCategory[cat] || []"
              class="w-full"
            >
              <template #label-cell="{ row }">
                <div
                  class="font-bold text-gray-900 dark:text-white flex items-center justify-between gap-2 cursor-move group/row w-full"
                  draggable="true"
                  @dragstart="onDragStart($event, row.original as Criterion)"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      class="w-4 h-4 text-gray-300 group-hover/row:text-gray-500"
                      name="i-lucide-grip-vertical"
                    />
                    {{ (row.original as Criterion).label }}
                  </div>
                  <UIcon
                    v-if="(row.original as Criterion).sourceKey"
                    class="w-5 h-5 text-blue-500"
                    name="i-lucide-database"
                  />
                </div>
              </template>

              <template #description-cell="{ row }">
                <div class="flex flex-col gap-0.5 max-w-xs">
                  <span class="text-xs text-gray-500 line-clamp-1">{{
                    (row.original as Criterion).description || "—"
                  }}</span>
                  <UTooltip>
                    <template #text>
                      <div class="flex flex-col gap-1 max-w-xs">
                        <span class="font-bold">{{
                          DATA_SOURCES.find(
                            (s) =>
                              s.value === (row.original as Criterion).sourceKey,
                          )?.label || (row.original as Criterion).sourceKey
                        }}</span>
                        <span
                          v-if="
                            DATA_SOURCES.find(
                              (s) =>
                                s.value ===
                                (row.original as Criterion).sourceKey,
                            )?.description
                          "
                          class="text-[10px] opacity-80 leading-tight"
                        >
                          {{
                            DATA_SOURCES.find(
                              (s) =>
                                s.value ===
                                (row.original as Criterion).sourceKey,
                            )?.description
                          }}
                        </span>
                      </div>
                    </template>
                    <span
                      v-if="(row.original as Criterion).mode === 'auto'"
                      class="text-[10px] text-blue-500 font-medium flex items-center gap-1"
                    >
                      <UIcon class="w-3 h-3" name="i-lucide-database" />
                      {{
                        DATA_SOURCES.find(
                          (s) =>
                            s.value === (row.original as Criterion).sourceKey,
                        )?.label || (row.original as Criterion).sourceKey
                      }}
                    </span>
                  </UTooltip>
                </div>
              </template>

              <template #mode-cell="{ row }">
                <UBadge
                  :color="
                    (row.original as Criterion).mode === 'auto'
                      ? 'secondary'
                      : 'neutral'
                  "
                  size="xs"
                  variant="soft"
                >
                  {{
                    (row.original as Criterion).mode === "auto"
                      ? "Auto"
                      : "Manual"
                  }}
                </UBadge>
              </template>

              <template #weight-cell="{ row }">
                <UBadge class="font-mono" size="xs" variant="subtle"
                  >w{{ (row.original as Criterion).weight }}</UBadge
                >
              </template>

              <template #direction-cell="{ row }">
                <UBadge
                  :color="
                    (row.original as Criterion).direction === 'higher-is-better'
                      ? 'primary'
                      : 'warning'
                  "
                  size="xs"
                  variant="soft"
                >
                  {{
                    (row.original as Criterion).direction === "higher-is-better"
                      ? "Higher"
                      : "Lower"
                  }}
                </UBadge>
              </template>

              <template #actions-cell="{ row }">
                <div class="flex justify-end gap-1">
                  <UButton
                    color="neutral"
                    icon="i-lucide-edit-2"
                    size="xs"
                    variant="ghost"
                    @click="openEditCriterion(row.original as Criterion)"
                  />
                  <UButton
                    color="error"
                    icon="i-lucide-trash-2"
                    size="xs"
                    variant="ghost"
                    @click="confirmDeleteCriterion(row.original as Criterion)"
                  />
                </div>
              </template>

              <template #empty-state>
                <div
                  class="py-8 flex flex-col items-center justify-center text-gray-400 gap-2"
                >
                  <UIcon class="w-8 h-8 opacity-20" name="i-lucide-inbox" />
                  <span class="text-xs">Drag criteria here or add one</span>
                </div>
              </template>
            </UTable>
          </div>
        </div>
      </div>

      <template #fallback>
        <div class="animate-pulse space-y-8">
          <div v-for="i in 3" :key="i" class="space-y-4">
            <div class="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="j in 3"
                :key="j"
                class="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"
              ></div>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>

    <div v-if="isHydrated">
      <!-- Add/Edit Criterion Modal -->
      <AppModal
        v-model:open="isCriterionModalOpen"
        :title="editingCriterion ? 'Edit Criterion' : 'Add Criterion'"
        description="Provide a label and description for the criterion"
      >
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Category">
              <USelectMenu
                :items="categoryOptions"
                :model-value="
                  categoryOptions.find(
                    (o) => o.value === criterionDraft.category,
                  )
                "
                class="w-full"
                placeholder="Select category..."
                @update:model-value="
                  (v: any) => {
                    criterionDraft.category = v?.value;
                  }
                "
              />
            </UFormField>

            <UFormField label="Label">
              <UInput
                v-model="criterionDraft.label"
                class="w-full"
                placeholder="e.g. Speed of Internet"
              />
            </UFormField>
          </div>

          <UFormField label="Description">
            <UInput
              v-model="criterionDraft.description"
              class="w-full"
              placeholder="Optional details..."
            />
          </UFormField>

          <UFormField label="Mode">
            <USelectMenu
              :items="[
                { label: 'Manual Scoring', value: 'manual' },
                {
                  label: 'Auto-Data Mode',
                  value: 'auto',
                },
              ]"
              :model-value="
                [
                  { label: 'Manual Scoring', value: 'manual' },
                  { label: 'Auto-Data Mode', value: 'auto' },
                ].find((i) => i.value === criterionDraft.mode)
              "
              class="w-full"
              @update:model-value="
                (v: any) => {
                  criterionDraft.mode = v?.value;
                  if (v?.value === 'auto' && !criterionDraft.sourceKey) {
                    toast.add({
                      title: 'Select a data source',
                      description:
                        'Auto-mode requires a data source to be selected.',
                      color: 'warning',
                    });
                  }
                }
              "
            />
          </UFormField>

          <UFormField label="Data Source">
            <template
              v-if="
                DATA_SOURCES.find((s) => s.value === criterionDraft.sourceKey)
                  ?.description
              "
              #description
            >
              <span class="text-[10px] leading-tight text-gray-400">
                {{
                  DATA_SOURCES.find((s) => s.value === criterionDraft.sourceKey)
                    ?.description
                }}
              </span>
            </template>
            <USelectMenu
              :items="[
                { label: 'None (Manual only)', value: undefined },
                ...DATA_SOURCES,
              ]"
              :model-value="
                [
                  { label: 'None (Manual only)', value: undefined },
                  ...DATA_SOURCES,
                ].find((s) => s.value === criterionDraft.sourceKey)
              "
              class="w-full"
              placeholder="Select source..."
              value-attribute="value"
              @update:model-value="
                (v: any) => {
                  criterionDraft.sourceKey = v?.value;
                  if (!v?.value) criterionDraft.mode = 'manual';
                  else criterionDraft.mode = 'auto';
                }
              "
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField>
              <template #label>
                <div class="flex items-center justify-between w-full">
                  <span>Weight</span>
                  <span class="text-primary-500 font-bold">{{
                    criterionDraft.weight
                  }}</span>
                </div>
              </template>
              <USlider
                v-model="criterionDraft.weight"
                :max="10"
                :min="1"
                class="mt-2"
              />
            </UFormField>

            <UFormField label="Direction">
              <USelectMenu
                :items="[
                  { label: 'Higher is better', value: 'higher-is-better' },
                  { label: 'Lower is better', value: 'lower-is-better' },
                ]"
                :model-value="
                  [
                    { label: 'Higher is better', value: 'higher-is-better' },
                    { label: 'Lower is better', value: 'lower-is-better' },
                  ].find((i) => i.value === criterionDraft.direction)
                "
                class="w-full"
                @update:model-value="
                  (v: any) => {
                    criterionDraft.direction = v?.value;
                  }
                "
              />
            </UFormField>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isCriterionModalOpen = false"
              >Cancel</UButton
            >
            <UButton
              :disabled="
                !criterionDraft.label ||
                (criterionDraft.mode === 'auto' && !criterionDraft.sourceKey)
              "
              @click="saveCriterion"
            >
              {{ editingCriterion ? "Update" : "Add" }}
            </UButton>
          </div>
        </template>
      </AppModal>

      <!-- Add Category Modal -->
      <AppModal
        v-model:open="isAddCategoryModalOpen"
        description="Provide a category name"
        title="Add Category"
      >
        <div class="p-4">
          <UFormField label="Category Name">
            <UInput
              v-model="newCategoryName"
              class="w-full"
              placeholder="e.g. Education"
              @keydown.enter="addCategory"
            />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isAddCategoryModalOpen = false"
              >Cancel</UButton
            >
            <UButton :disabled="!newCategoryName" @click="addCategory"
              >Add</UButton
            >
          </div>
        </template>
      </AppModal>

      <!-- Rename Category Modal -->
      <AppModal
        v-model:open="isRenameCategoryModalOpen"
        description="Provide a new category name"
        title="Rename Category"
      >
        <div class="p-4">
          <UFormField label="New Name">
            <UInput
              v-model="renameCategoryName"
              :placeholder="oldCategoryName"
              class="w-full"
              @keydown.enter="renameCategory"
            />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isRenameCategoryModalOpen = false"
              >Cancel</UButton
            >
            <UButton :disabled="!renameCategoryName" @click="renameCategory"
              >Rename</UButton
            >
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
import type { Criterion } from "~/types/countryRoyale";
import type { TableColumn } from "@nuxt/ui";

import { DATA_SOURCES } from "~/data/sources";

const store = useSessionsStore();
const toast = useToast();
const isHydrated = ref(false);
const searchQuery = ref("");

onMounted(() => {
  isHydrated.value = true;
});

const columns: TableColumn<Criterion>[] = [
  { id: "label", header: "Criterion" },
  { id: "description", header: "Description" },
  { id: "mode", header: "Mode" },
  { id: "weight", header: "Weight" },
  { id: "direction", header: "Direction" },
  { id: "actions" },
];

const allCategories = computed(() => {
  return [...store.masterCategories, ""];
});

const filteredCriteria = computed(() => {
  if (!searchQuery.value.trim()) return store.masterCriteria;
  const q = searchQuery.value.toLowerCase();
  return store.masterCriteria.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q),
  );
});

const criteriaByCategory = computed(() => {
  const map: Record<string, Criterion[]> = {};
  filteredCriteria.value.forEach((c) => {
    const cat = c.category || "";
    if (!map[cat]) map[cat] = [];
    map[cat].push(c);
  });
  return map;
});

const categoryOptions = computed(() => {
  return store.masterCategories.map((c) => ({ label: c, value: c }));
});

// Criterion CRUD
const isCriterionModalOpen = ref(false);
const editingCriterion = ref<Criterion | null>(null);
const criterionDraft = reactive({
  label: "",
  description: "",
  weight: 5,
  direction: "higher-is-better" as "higher-is-better" | "lower-is-better",
  category: undefined as string | undefined,
  mode: "manual" as "manual" | "auto",
  sourceKey: undefined as string | undefined,
});

const openAddCriterion = () => {
  editingCriterion.value = null;
  criterionDraft.label = "";
  criterionDraft.description = "";
  criterionDraft.weight = 5;
  criterionDraft.direction = "higher-is-better";
  criterionDraft.category = undefined;
  criterionDraft.mode = "manual";
  criterionDraft.sourceKey = undefined;
  isCriterionModalOpen.value = true;
};

const openEditCriterion = (c: Criterion) => {
  editingCriterion.value = c;
  criterionDraft.label = c.label;
  criterionDraft.description = c.description || "";
  criterionDraft.weight = c.weight;
  criterionDraft.direction = c.direction;
  criterionDraft.category = c.category;
  criterionDraft.mode = c.mode || "manual";
  criterionDraft.sourceKey = c.sourceKey;
  isCriterionModalOpen.value = true;
};

const saveCriterion = () => {
  store.upsertMasterCriterion({
    id: editingCriterion.value?.id,
    label: criterionDraft.label,
    description: criterionDraft.description,
    weight: criterionDraft.weight,
    direction: criterionDraft.direction,
    category: criterionDraft.category,
    mode: criterionDraft.mode,
    sourceKey: criterionDraft.sourceKey,
  });
  isCriterionModalOpen.value = false;
  toast.add({
    title: editingCriterion.value ? "Criterion updated" : "Criterion added",
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

const confirmDeleteCriterion = (c: Criterion) => {
  confirmTitle.value = "Delete Criterion";
  confirmMessage.value = `Are you sure you want to delete "${c.label}"?`;
  confirmColor.value = "error";
  onConfirm.value = () => {
    store.deleteMasterCriterion(c.id);
    toast.add({ title: "Criterion deleted", color: "neutral" });
    isConfirmOpen.value = false;
  };
  isConfirmOpen.value = true;
};

// Category CRUD
const isAddCategoryModalOpen = ref(false);
const newCategoryName = ref("");

const addCategory = () => {
  store.addMasterCategory(newCategoryName.value);
  newCategoryName.value = "";
  isAddCategoryModalOpen.value = false;
  toast.add({ title: "Category added", color: "success" });
};

const isRenameCategoryModalOpen = ref(false);
const oldCategoryName = ref("");
const renameCategoryName = ref("");

const openRenameCategory = (cat: string) => {
  oldCategoryName.value = cat;
  renameCategoryName.value = cat;
  isRenameCategoryModalOpen.value = true;
};

const renameCategory = () => {
  store.renameMasterCategory(oldCategoryName.value, renameCategoryName.value);
  isRenameCategoryModalOpen.value = false;
  toast.add({ title: "Category renamed", color: "success" });
};

const confirmDeleteCategory = (cat: string) => {
  confirmTitle.value = "Delete Category";
  confirmMessage.value = `Are you sure you want to delete category "${cat}"? Criteria will become uncategorized.`;
  confirmColor.value = "error";
  onConfirm.value = () => {
    store.deleteMasterCategory(cat);
    toast.add({ title: "Category deleted", color: "neutral" });
    isConfirmOpen.value = false;
  };
  isConfirmOpen.value = true;
};

// Drag and Drop
const draggedCriterion = ref<Criterion | null>(null);

const onDragStart = (e: DragEvent, c: Criterion) => {
  draggedCriterion.value = c;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", c.id);
  }
};

const onDropCriterion = (targetCategory: string) => {
  if (draggedCriterion.value) {
    store.moveMasterCriterion(
      draggedCriterion.value.id,
      targetCategory || undefined,
    );
    draggedCriterion.value = null;
    toast.add({ title: "Criterion moved", color: "success" });
  }
};
</script>
