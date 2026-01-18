<template>
  <UCard class="flex flex-col items-center text-center space-y-2">
    <div
      v-if="icon"
      class="items-center justify-center flex bg-primary-500/10 px-3 py-1 rounded-full text-primary-500 mb-2"
    >
      <UIcon :name="icon" class="w-6 h-6" />
    </div>
    <h3 v-if="title" class="font-bold">{{ title }}</h3>
    <p v-if="description" class="text-sm text-gray-500">
      {{ description }}
    </p>
    <slot />
  </UCard>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
  description?: string;
  icon?: string;
}>();
</script>
