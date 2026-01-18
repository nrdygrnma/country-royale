<template>
  <div class="flex gap-4">
    <div
      class="shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold"
    >
      {{ number }}
    </div>
    <div>
      <h4 class="font-bold">{{ title }}</h4>
      <p class="text-sm">
        <slot />
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  number: number | string;
  title: string;
}>();
</script>
