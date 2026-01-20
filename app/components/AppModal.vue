<template>
  <UModal
    v-model:open="open"
    :aria-describedby="undefined"
    :description="description"
    :title="title"
  >
    <template #description></template>
    <template #content>
      <UCard :ui="ui">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">{{ title }}</h3>
            <UButton
              color="neutral"
              icon="i-lucide-x"
              variant="ghost"
              @click="open = false"
            />
          </div>
        </template>

        <div v-if="description" class="px-6 py-2">
          <p class="text-sm text-gray-500">{{ description }}</p>
        </div>

        <slot />

        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open", { required: true });

defineProps<{
  title?: string;
  description?: string;
  ui?: any;
}>();
</script>
