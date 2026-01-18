<template>
  <UModal v-model:open="open" :description="description" :title="title">
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
