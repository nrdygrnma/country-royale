<script lang="ts" setup>
import VueApexCharts from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";

defineProps<{
  options: ApexOptions;
  series: any[];
  height?: string | number;
}>();
</script>

<template>
  <VueApexCharts
    :height="height || '100%'"
    :options="options"
    :series="series"
    type="radar"
  />
</template>
