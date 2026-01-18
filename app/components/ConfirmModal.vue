<template>
  <AppModal v-model:open="open" :description="description" :title="title">
    <div v-if="message" class="p-4">
      <p class="text-sm text-gray-500">{{ message }}</p>
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
