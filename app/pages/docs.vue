<template>
  <div class="space-y-12 max-w-4xl mx-auto py-10 px-4">
    <!-- Header -->
    <section class="text-center space-y-4">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">
        Documentation
      </h1>
      <p class="text-xl text-gray-500">
        Everything you need to know about Country Royale
      </p>
    </section>

    <!-- Navigation -->
    <nav class="flex flex-wrap justify-center gap-4 no-print">
      <UButton
        v-for="section in sections"
        :key="section.id"
        :icon="section.icon"
        color="neutral"
        size="sm"
        variant="soft"
        @click="scrollTo(section.id)"
      >
        {{ section.title }}
      </UButton>
    </nav>

    <!-- Content Sections -->
    <div class="space-y-16">
      <!-- Getting Started -->
      <DocsSection
        id="getting-started"
        icon="i-lucide-rocket"
        title="Getting Started"
      >
        <p>
          Country Royale is a decision-making engine designed to help you choose
          your next destination based on objective data and personal
          preferences.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <DocsCard
            description="Give your comparison a name like 'Thailand vs. Vietnam 2026'."
            icon="i-lucide-plus-circle"
            title="1. Create a Session"
          />
          <DocsCard
            description="Choose from our database or add your own custom locations."
            icon="i-lucide-globe"
            title="2. Select Countries"
          />
          <DocsCard
            description="Decide what matters most: Taxes, Safety, Climate, etc."
            icon="i-lucide-list-checks"
            title="3. Define Criteria"
          />
        </div>
      </DocsSection>

      <!-- Automated Data -->
      <DocsSection
        id="automation"
        icon="i-lucide-database"
        title="Automated Data Sync"
      >
        <p>
          Stop manual research. We fetch real-time data from global
          organizations to ensure your decisions are based on the latest
          statistics.
        </p>
        <div
          class="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <h4 class="font-bold mb-4 flex items-center gap-2">
            <UIcon class="text-primary-500" name="i-lucide-link" />
            Integrated Sources
          </h4>
          <ul
            class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 list-none p-0"
          >
            <li class="flex items-center gap-2 text-sm">
              <UIcon class="text-green-500" name="i-lucide-check" />
              <strong>World Bank:</strong> GDP, Stability, Internet, Education,
              Taxes, Rule of Law
            </li>
            <li class="flex items-center gap-2 text-sm">
              <UIcon class="text-green-500" name="i-lucide-check" />
              <strong>REST Countries:</strong> Visa Ease, Population, Languages,
              Timezones
            </li>
            <li class="flex items-center gap-2 text-sm">
              <UIcon class="text-green-500" name="i-lucide-check" />
              <strong>Numbeo:</strong> Cost of Living, Crime Index
            </li>
            <li class="flex items-center gap-2 text-sm">
              <UIcon class="text-green-500" name="i-lucide-check" />
              <strong>Unsplash:</strong> High-quality visual context
            </li>
          </ul>
        </div>
        <p class="text-sm text-gray-500 italic">
          Note: For data points like languages or timezones, the app might ask
          you a quick follow-up question to calculate a personalized score
          (e.g., "What is your base timezone?").
        </p>
      </DocsSection>

      <!-- Scoring Logic -->
      <DocsSection
        id="scoring"
        icon="i-lucide-calculator"
        title="How Scoring Works"
      >
        <p>
          The final ranking is determined by a weighted multi-criteria decision
          analysis (MCDA) approach.
        </p>
        <div class="space-y-4">
          <DocsStep number="1" title="Normalization">
            Raw values (like $60,000 GDP) are normalized into a 1-10 scale. We
            use global benchmarks (e.g., $500 to $100,000) or relative
            comparison depending on the source.
          </DocsStep>
          <DocsStep number="2" title="Weighting">
            Each criterion has a weight (1-10). If "Safety" is weight 10 and
            "Driving Side" is weight 3, safety has over 3x more impact on the
            final score.
          </DocsStep>
          <DocsStep number="3" title="Aggregation">
            The weighted average is calculated for each country. The result is a
            total score out of 100, represented in our Leaderboard.
          </DocsStep>
        </div>
      </DocsSection>

      <!-- Reporting -->
      <DocsSection
        id="reporting"
        icon="i-lucide-file-text"
        title="Decision Reports"
      >
        <p>
          Once your comparison is complete, you can review a professional
          decision report.
        </p>
        <ul class="space-y-2">
          <li>
            <strong>AI Insights:</strong> Our engine analyzes the data to find
            strengths, weaknesses, and potential trade-offs.
          </li>
          <li>
            <strong>Radar Charts:</strong> Visualizes how the top contenders
            compare across different thematic categories.
          </li>
          <li>
            <strong>PDF Export:</strong> Save your final rankings and insights
            as a professional, printable report.
          </li>
        </ul>
      </DocsSection>

      <!-- FAQ -->
      <DocsSection
        id="faq"
        icon="i-lucide-help-circle"
        title="Frequently Asked Questions"
      >
        <div class="space-y-4">
          <UCard v-for="q in faqs" :key="q.question">
            <h4 class="font-bold text-gray-900 dark:text-white mb-2">
              {{ q.question }}
            </h4>
            <p class="text-sm text-gray-500">{{ q.answer }}</p>
          </UCard>
        </div>
      </DocsSection>
    </div>

    <!-- Footer -->
    <footer
      class="text-center pt-10 border-t border-gray-200 dark:border-gray-800"
    >
      <p class="text-sm text-gray-500">
        Country Royale &copy; {{ new Date().getFullYear() }} — Built with Nuxt 4
        & Nuxt UI
      </p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
const sections = [
  { id: "getting-started", title: "Start", icon: "i-lucide-rocket" },
  { id: "automation", title: "Automation", icon: "i-lucide-database" },
  { id: "scoring", title: "Scoring", icon: "i-lucide-calculator" },
  { id: "reporting", title: "Reporting", icon: "i-lucide-file-text" },
  { id: "faq", title: "FAQ", icon: "i-lucide-help-circle" },
];

const faqs = [
  {
    question: "Where is my data stored?",
    answer:
      "Everything is stored locally in your browser's LocalStorage. No data is sent to our servers except for proxying API requests to World Bank or REST Countries.",
  },
  {
    question: "Can I add countries that are not in the list?",
    answer:
      "Yes! In the Countries step, use the 'Add Custom Country' button. You'll just need to provide a 2-letter ISO code if you want to use automated data fetching.",
  },
  {
    question: "Is there a limit to how many sessions I can have?",
    answer:
      "Only the storage limit of your browser (usually around 5-10MB). Since we only store text and small settings, you can have hundreds of sessions.",
  },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

useHead({
  title: "Documentation | Country Royale",
  meta: [
    {
      name: "description",
      content:
        "Learn how to use Country Royale to make better move-abroad decisions.",
    },
  ],
});
</script>

<style scoped>
.prose h4 {
  margin-top: 0;
}
</style>
