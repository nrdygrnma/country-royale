<template>
  <section :id="id" class="space-y-6">
    <div
      class="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-2"
    >
      <UIcon v-if="icon" :name="icon" class="w-8 h-8 text-primary-500" />
      <h2 class="text-2xl font-bold">{{ title }}</h2>
    </div>
    <div class="prose dark:prose-invert max-w-none space-y-4">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  id: string;
  title: string;
  icon?: string;
}>();
</script>
