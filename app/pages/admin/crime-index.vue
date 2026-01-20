<script lang="ts" setup>
const crimeIndexJson = ref("");
const status = ref<{ type: "success" | "error" | "loading" | null; message: string }>({
  type: null,
  message: ""
});

const fetchCurrentData = async () => {
  try {
    const { data } = await $fetch("/api/admin/crime-index");
    if (data) {
      crimeIndexJson.value = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    console.error("Failed to fetch current data", e);
  }
};

onMounted(fetchCurrentData);

const updateCrimeIndex = async () => {
  status.value = { type: "loading", message: "Updating..." };
  try {
    let parsedData;
    try {
      parsedData = JSON.parse(crimeIndexJson.value);
    } catch (e) {
      throw new Error("Invalid JSON format");
    }

    await $fetch("/api/admin/crime-index", {
      method: "POST",
      body: { data: parsedData }
    });

    status.value = { type: "success", message: "Crime Index data updated successfully!" };
  } catch (e: any) {
    status.value = { type: "error", message: e.message || "Failed to update data" };
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <header class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Crime Index Management</h1>
      <p class="text-gray-600">
        Paste the Crime Index JSON data here to update the static values used for the Crime Criteria.
        The data will be automatically mapped to 2-character country codes.
      </p>
    </header>

    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2" for="json-input">
          Crime Index JSON
        </label>
        <textarea
          id="json-input"
          v-model="crimeIndexJson"
          class="w-full font-mono text-sm border rounded-md p-4 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder='{ "indicators": { "2": { "2025": { "countries": { ... } } } } }'
          rows="20"
        ></textarea>
      </div>

      <div class="flex items-center justify-between">
        <div v-if="status.type" :class="[
          'text-sm px-4 py-2 rounded-md',
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700'
        ]">
          {{ status.message }}
        </div>
        <div v-else></div>

        <button
          :disabled="status.type === 'loading'"
          class="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          @click="updateCrimeIndex"
        >
          {{ status.type === "loading" ? "Updating..." : "Update Data" }}
        </button>
      </div>
    </div>

    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-blue-900 mb-2">Formatting Tips</h2>
      <ul class="list-disc list-inside text-blue-800 space-y-1 text-sm">
        <li>The JSON should follow the structure provided in the task description.</li>
        <li>It must contain an <code>indicators</code> object with key <code>"2"</code>.</li>
        <li>Inside indicator "2", it expects <code>"2025"</code> with a <code>countries</code> object.</li>
        <li>Country codes should be 3-character ISO codes (e.g., AFG, ALB).</li>
      </ul>
    </div>
  </div>
</template>
