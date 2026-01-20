<template>
  <AppModal v-model:open="open" :title="title">
    <div v-if="description || message" class="px-6 pb-4">
      <p class="text-sm text-gray-500">{{ description || message }}</p>
    </div>
    <slot />

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="open = false">
          {{ cancelLabel }}
        </UButton>
        <UButton
          :color="confirmColor"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open", { required: true });

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?:
      | "error"
      | "info"
      | "success"
      | "primary"
      | "secondary"
      | "warning"
      | "neutral";
    loading?: boolean;
  }>(),
  {
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    confirmColor: "primary",
    loading: false,
  },
);

defineEmits(["confirm"]);
</script>
