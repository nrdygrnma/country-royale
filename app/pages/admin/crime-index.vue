<script lang="ts" setup>
const crimeIndexJson = ref("");
const status = ref<{
  type: "success" | "error" | "loading" | null;
  message: string;
}>({
  type: null,
  message: "",
});

const fetchCurrentData = async () => {
  try {
    const { data }: any = await $fetch("/api/admin/crime-index");
    if (data) {
      crimeIndexJson.value = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    console.error("Failed to fetch current data", e);
  }
};

onMounted(fetchCurrentData);

const updateCrimeIndex = async () => {
  status.value = { type: "loading", message: "Updating data..." };
  try {
    let parsedData;
    try {
      parsedData = JSON.parse(crimeIndexJson.value);
    } catch (e) {
      throw new Error("Invalid JSON format");
    }

    await $fetch("/api/admin/crime-index", {
      method: "POST",
      body: { data: parsedData },
    });

    status.value = {
      type: "success",
      message: "Crime Index data updated successfully!",
    };

    // Clear status after 3 seconds
    setTimeout(() => {
      status.value = { type: null, message: "" };
    }, 3000);
  } catch (e: any) {
    status.value = {
      type: "error",
      message: e.message || "Failed to update data",
    };
  }
};

useHead({
  title: "Crime Index Management | Country Royale",
});
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="flex-1">
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <UIcon class="text-primary-500" name="i-lucide-shield-alert" />
          Crime Index Management
        </h1>
        <p class="text-sm text-gray-500">
          Paste the Crime Index JSON data here to update the static values used
          for the Crime Criteria.
        </p>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm p-6"
    >
      <div class="space-y-4">
        <UFormField label="Crime Index JSON">
          <template #description>
            The data will be automatically mapped to 2-character country codes.
          </template>
          <UTextarea
            v-model="crimeIndexJson"
            :rows="20"
            autoresize
            class="font-mono text-sm w-full"
            placeholder='{ "indicators": { "2": { "2025": { "countries": { ... } } } } }'
          />
        </UFormField>

        <div class="flex items-center justify-between gap-4">
          <div v-if="status.type" class="flex-1">
            <UAlert
              :color="
                status.type === 'success'
                  ? 'success'
                  : status.type === 'error'
                    ? 'error'
                    : 'primary'
              "
              :description="status.message"
              icon="i-lucide-info"
              variant="soft"
            />
          </div>
          <div v-else class="flex-1"></div>

          <UButton
            :disabled="status.type === 'loading'"
            :loading="status.type === 'loading'"
            icon="i-lucide-save"
            size="md"
            @click="updateCrimeIndex"
          >
            Update Data
          </UButton>
        </div>
      </div>
    </div>

    <UCard
      :ui="{
        body: 'p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',
      }"
    >
      <div class="flex gap-3">
        <UIcon class="w-5 h-5 text-blue-500 shrink-0" name="i-lucide-info" />
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-200">
            Formatting Tips
          </h2>
          <ul
            class="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-1 text-sm"
          >
            <li>
              The JSON should follow the structure provided in the task
              description.
            </li>
            <li>
              It must contain an <code>indicators</code> object with key
              <code>"2"</code>.
            </li>
            <li>
              Inside indicator "2", it expects <code>"2025"</code> with a
              <code>countries</code> object.
            </li>
            <li>Country codes should be 3-character ISO codes (e.g., AFG).</li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>
