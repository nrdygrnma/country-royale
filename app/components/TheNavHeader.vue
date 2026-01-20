<template>
  <header
    class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50"
  >
    <div
      class="container mx-auto px-4 h-16 flex items-center justify-between gap-4"
    >
      <NuxtLink class="flex items-center gap-2 group" to="/">
        <div
          class="p-2 bg-primary-500 rounded-lg group-hover:bg-primary-600 transition-colors flex items-center justify-center"
        >
          <UIcon class="w-6 h-6 text-white" name="i-lucide-earth" />
        </div>
        <div>
          <h1
            class="text-xl font-semibold text-gray-900 dark:text-white leading-tight"
          >
            Country Royale
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Move Abroad Decision Engine
          </p>
        </div>
      </NuxtLink>

      <nav class="flex items-center gap-4">
        <UNavigationMenu :items="items" arrow content-orientation="vertical" />
        <UColorModeButton />
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Home",
    icon: "i-lucide-home",
    to: "/",
  },
  {
    label: "Docs",
    icon: "i-lucide-book-open",
    to: "/docs",
  },
  {
    label: "Admin",
    icon: "i-lucide-settings",
    active: route.path.startsWith("/admin"),
    children: [
      {
        label: "Countries",
        icon: "i-lucide-earth",
        to: "/admin/countries",
      },
      {
        label: "Criteria Library",
        icon: "i-lucide-library",
        to: "/admin/criteria",
      },
    ],
  },
]);
</script>
