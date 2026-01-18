<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
    <SessionWizardHeader />

    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          Results
        </h1>
        <p class="text-xs text-gray-500">The crown goes to the best fit</p>
      </div>

      <div class="flex gap-2 no-print">
        <UButton
          icon="i-lucide-file-down"
          size="sm"
          variant="soft"
          @click="exportToPdf"
        >
          Export PDF
        </UButton>
        <UButton size="sm" variant="soft" @click="goBack">Back</UButton>
        <UButton size="sm" variant="soft" @click="goHome">Home</UButton>
      </div>
    </div>

    <ClientOnly>
      <div class="no-print space-y-6">
        <UCard v-if="!session">
          <div class="space-y-2">
            <div class="font-medium">Session not found</div>
            <div class="text-sm opacity-70">
              That session id doesn’t exist. Go back and create one.
            </div>
            <UButton class="mt-2" @click="goHome">Go home</UButton>
          </div>
        </UCard>

        <template v-else>
          <UCard v-if="!isReady">
            <div class="space-y-2">
              <div class="font-medium">Not ready to calculate</div>
              <div class="text-sm opacity-70">
                You need at least one country and one criterion. Scoring is
                optional, but recommended (otherwise everything defaults to 5 in
                the UI, but we only calculate what exists in stored scores).
              </div>

              <div class="flex gap-2 pt-2">
                <UButton variant="soft" @click="goCountries"
                  >Pick countries</UButton
                >
                <UButton variant="soft" @click="goCriteria"
                  >Define criteria</UButton
                >
                <UButton @click="goScoring">Go to scoring</UButton>
              </div>
            </div>
          </UCard>

          <template v-else>
            <!-- Top Section: AI Insights -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 space-y-6">
                <UCard
                  v-if="summary"
                  :ui="{
                    body: 'p-6',
                    header: 'border-b border-gray-100 dark:border-gray-800',
                  }"
                  class="overflow-hidden"
                >
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon
                        class="w-5 h-5 text-primary-500"
                        name="i-lucide-file-text"
                      />
                      <h2 class="text-lg font-bold">Decision Report</h2>
                    </div>
                  </template>

                  <div class="space-y-6">
                    <div>
                      <h3
                        class="text-2xl font-extrabold text-gray-900 dark:text-white mb-2"
                      >
                        {{ summary.headline }}
                      </h3>
                      <p
                        class="text-gray-600 dark:text-gray-400 leading-relaxed"
                      >
                        {{ summary.summary }}
                      </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-3">
                        <div
                          class="text-[10px] font-bold uppercase tracking-widest text-success-600 dark:text-success-400 flex items-center gap-1.5"
                        >
                          <UIcon class="w-3 h-3" name="i-lucide-check-circle" />
                          Why it won
                        </div>
                        <ul class="space-y-2">
                          <li
                            v-for="(line, i) in summary.why"
                            :key="`why-${i}`"
                            class="text-sm text-gray-700 dark:text-gray-300 flex gap-2"
                          >
                            <span class="text-success-500 shrink-0">•</span>
                            {{ line }}
                          </li>
                        </ul>
                      </div>

                      <div class="space-y-3">
                        <div
                          class="text-[10px] font-bold uppercase tracking-widest text-warning-600 dark:text-warning-400 flex items-center gap-1.5"
                        >
                          <UIcon
                            class="w-3 h-3"
                            name="i-lucide-alert-triangle"
                          />
                          Key Trade-offs
                        </div>
                        <ul class="space-y-2">
                          <li
                            v-for="(line, i) in summary.tradeoffs"
                            :key="`trade-${i}`"
                            class="text-sm text-gray-700 dark:text-gray-300 flex gap-2"
                          >
                            <span class="text-warning-500 shrink-0">•</span>
                            {{ line }}
                          </li>
                          <li
                            v-for="(line, i) in summary.risks"
                            :key="`risk-${i}`"
                            class="text-sm text-gray-700 dark:text-gray-300 flex gap-2"
                          >
                            <span class="text-warning-500 shrink-0">•</span>
                            {{ line }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </UCard>

                <!-- Radar Chart: Winner vs Runner Up -->
                <UCard
                  v-if="ranking.length >= 2"
                  :ui="{ body: 'py-2 px-6', header: 'py-3 px-6' }"
                >
                  <template #header>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <h3
                          class="text-sm font-bold uppercase tracking-wider text-gray-500"
                        >
                          Head-to-Head Comparison
                        </h3>
                        <UPopover :popper="{ placement: 'bottom-start' }">
                          <UButton
                            color="neutral"
                            icon="i-lucide-help-circle"
                            size="xs"
                            variant="ghost"
                          />
                          <template #content>
                            <div class="p-4 w-80 text-xs space-y-4">
                              <div v-if="radarComparisonInsight">
                                <p
                                  class="font-bold text-gray-900 dark:text-white mb-2"
                                >
                                  Data Analysis:
                                  {{ radarComparisonInsight.wName }} vs
                                  {{ radarComparisonInsight.rName }}
                                </p>
                                <div class="space-y-3">
                                  <div
                                    v-if="
                                      radarComparisonInsight.wAdvantages
                                        .length > 0
                                    "
                                  >
                                    <p
                                      class="text-primary-600 dark:text-primary-400 font-semibold mb-1 flex items-center gap-1"
                                    >
                                      <UIcon
                                        class="w-3 h-3"
                                        name="i-lucide-award"
                                      />
                                      Where
                                      {{ radarComparisonInsight.wName }} wins:
                                    </p>
                                    <p class="text-gray-600 dark:text-gray-400">
                                      {{
                                        radarComparisonInsight.wAdvantages
                                          .map((a) => a.label)
                                          .join(", ")
                                      }}.
                                    </p>
                                  </div>
                                  <div
                                    v-if="
                                      radarComparisonInsight.rAdvantages
                                        .length > 0
                                    "
                                  >
                                    <p
                                      class="text-gray-500 font-semibold mb-1 flex items-center gap-1"
                                    >
                                      <UIcon
                                        class="w-3 h-3"
                                        name="i-lucide-trending-up"
                                      />
                                      Where
                                      {{ radarComparisonInsight.rName }} excels:
                                    </p>
                                    <p class="text-gray-600 dark:text-gray-400">
                                      {{
                                        radarComparisonInsight.rAdvantages
                                          .map((a) => a.label)
                                          .join(", ")
                                      }}.
                                    </p>
                                  </div>
                                  <p
                                    class="text-[11px] leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800 italic"
                                  >
                                    {{ radarComparisonInsight.summary }}
                                  </p>
                                </div>
                              </div>
                              <div
                                class="pt-2 border-t border-gray-100 dark:border-gray-800"
                              >
                                <p
                                  class="font-bold text-gray-900 dark:text-white mb-1"
                                >
                                  How to read this chart
                                </p>
                                <p class="text-gray-500">
                                  Each spoke represents a criterion. Points
                                  further from the center indicate higher raw
                                  scores (1-10). Pink represents the overall
                                  winner, while slate-gray is the runner-up.
                                </p>
                              </div>
                            </div>
                          </template>
                        </UPopover>
                      </div>
                      <div class="flex items-center gap-4 text-xs">
                        <div
                          v-if="ranking[0]"
                          class="flex items-center gap-1.5"
                        >
                          <div
                            class="w-3 h-3 rounded-full bg-primary-500"
                          ></div>
                          <span>{{
                            nameFor(ranking[0]?.countryCode || null)
                          }}</span>
                        </div>
                        <div
                          v-if="ranking[1]"
                          class="flex items-center gap-1.5"
                        >
                          <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                          <span>{{
                            nameFor(ranking[1]?.countryCode || null)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <div class="h-48 w-full flex items-center justify-center">
                    <apexchart
                      :options="radarOptions"
                      :series="radarSeries"
                      height="150%"
                      type="radar"
                    />
                  </div>
                </UCard>
              </div>

              <!-- Sidebar: Scores & Sensitivity -->
              <div class="space-y-6">
                <UCard
                  :ui="{ body: 'p-6' }"
                  class="bg-primary-50 dark:bg-primary-950/10 border-primary-100 dark:border-primary-900"
                >
                  <div class="text-center space-y-4">
                    <div
                      class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400"
                    >
                      Overall Champion
                    </div>
                    <div
                      class="text-4xl font-black text-primary-700 dark:text-primary-300"
                    >
                      {{ winnerName }}
                    </div>
                    <div
                      class="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-800 shadow-sm"
                    >
                      <span
                        class="text-2xl font-bold tabular-nums text-primary-600"
                      >
                        {{ formatTotal(winnerTotal) }}
                      </span>
                      <span
                        class="ml-2 text-xs text-gray-500 font-medium uppercase tracking-wider"
                        >Points</span
                      >
                    </div>

                    <div
                      v-if="marginInsight && marginInsight.runnerUp"
                      class="text-xs text-gray-500"
                    >
                      Lead of
                      <span class="font-bold text-gray-900 dark:text-white">{{
                        formatTotal(marginInsight.margin)
                      }}</span>
                      over {{ nameFor(marginInsight.runnerUp) }}
                    </div>
                  </div>
                </UCard>

                <UCard v-if="topDrivers.length > 0" :ui="{ body: 'p-5' }">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div
                        class="text-xs font-bold uppercase tracking-wider text-gray-500"
                      >
                        Key Drivers
                      </div>
                      <UTooltip text="Criterion impact on winner's lead">
                        <UIcon
                          class="w-3.5 h-3.5 text-gray-400"
                          name="i-lucide-help-circle"
                        />
                      </UTooltip>
                    </div>

                    <div class="space-y-2">
                      <div
                        v-for="d in topDrivers"
                        :key="d.criterionId"
                        class="group relative flex items-center justify-between gap-3 p-2 rounded-lg border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
                      >
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-medium truncate">
                            {{ d.label }}
                          </div>
                          <div class="flex items-center gap-2 mt-0.5">
                            <div
                              class="h-1 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                            >
                              <div
                                :class="
                                  d.deltaContribution >= 0
                                    ? 'bg-success-500'
                                    : 'bg-warning-500'
                                "
                                :style="{
                                  width: `${Math.min(100, (Math.abs(d.deltaContribution) / 10) * 100)}%`,
                                }"
                                class="h-full rounded-full"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div class="shrink-0 text-right">
                          <div
                            :class="
                              d.deltaContribution >= 0
                                ? 'text-success-600'
                                : 'text-warning-600'
                            "
                            class="text-[10px] font-bold tabular-nums"
                          >
                            {{ d.deltaContribution >= 0 ? "+" : ""
                            }}{{ formatTotal(d.deltaContribution) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </UCard>

                <UCard v-if="sensitivity" :ui="{ body: 'p-5' }">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div
                        class="text-xs font-bold uppercase tracking-wider text-gray-500"
                      >
                        Reliability
                      </div>
                      <UBadge
                        :color="sensitivity.isStable ? 'success' : 'warning'"
                        size="xs"
                        variant="soft"
                      >
                        {{ stabilityLabel }}
                      </UBadge>
                    </div>

                    <p class="text-[11px] text-gray-500 leading-relaxed">
                      Winner stability tested against weight fluctuations (±1).
                      <span
                        v-if="sensitivity.isStable"
                        class="text-success-600 dark:text-success-400 font-medium"
                        >Results are highly robust.</span
                      >
                      <span
                        v-else
                        class="text-warning-600 dark:text-warning-400 font-medium"
                        >Winner could flip in
                        {{ sensitivity.changeCount }} scenarios.</span
                      >
                    </p>
                  </div>
                </UCard>
              </div>
            </div>

            <!-- Charts & Leaderboard Section -->
            <div class="space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Ranking Chart -->
                <UCard :ui="{ body: 'p-6' }" class="lg:col-span-1">
                  <template #header>
                    <h3
                      class="text-xs font-bold uppercase tracking-wider text-gray-500"
                    >
                      Ranking Distribution
                    </h3>
                  </template>
                  <div class="h-64 w-full">
                    <apexchart
                      :options="barOptions"
                      :series="barSeries"
                      height="100%"
                      type="bar"
                    />
                  </div>
                </UCard>

                <!-- Leaderboard -->
                <UCard :ui="{ body: 'p-4' }" class="lg:col-span-2">
                  <div class="space-y-4">
                    <div
                      class="text-xs font-bold uppercase tracking-wider text-gray-500"
                    >
                      Full Leaderboard
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        v-for="(r, idx) in ranking"
                        :key="r.countryCode"
                        class="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                      >
                        <div class="flex items-center gap-3 min-w-0">
                          <div
                            :class="[
                              idx === 0
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700',
                            ]"
                            class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border shrink-0 shadow-sm"
                          >
                            {{ idx + 1 }}
                          </div>
                          <div class="min-w-0">
                            <div
                              class="font-bold text-sm truncate group-hover:text-primary-600 transition-colors"
                            >
                              {{ nameFor(r.countryCode) }}
                            </div>
                            <div class="text-[10px] text-gray-400 font-medium">
                              {{ r.countryCode }}
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-3 shrink-0">
                          <div class="text-right">
                            <div
                              class="text-sm font-black tabular-nums text-gray-900 dark:text-white"
                            >
                              {{ formatTotal(r.total) }}
                            </div>
                            <div
                              v-if="idx > 0"
                              class="text-[9px] text-gray-400 font-bold"
                            >
                              -{{ formatTotal(ranking[0]!.total - r.total) }}
                            </div>
                          </div>
                          <UIcon
                            class="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                            name="i-lucide-chevron-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </UCard>
              </div>

              <!-- Data Map -->
              <UCard :ui="{ body: 'p-4' }">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div
                      class="text-xs font-bold uppercase tracking-wider text-gray-500"
                    >
                      Data Map
                    </div>
                    <div class="text-[10px] text-gray-400">
                      Heatmap of raw scores (1-10)
                    </div>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-[10px] border-collapse">
                      <thead>
                        <tr>
                          <th
                            class="p-1 border border-gray-100 dark:border-gray-800 text-left min-w-20"
                          >
                            Country
                          </th>
                          <th
                            v-for="c in sortedCriteria"
                            :key="c.id"
                            class="p-1 border border-gray-100 dark:border-gray-800 text-center font-medium"
                          >
                            <div
                              class="-rotate-45 whitespace-nowrap h-12 flex items-end justify-center pb-1"
                            >
                              {{ c.label }}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="r in ranking" :key="r.countryCode">
                          <td
                            class="p-1 border border-gray-100 dark:border-gray-800 font-medium truncate"
                          >
                            {{ nameFor(r.countryCode) }}
                          </td>
                          <td
                            v-for="c in sortedCriteria"
                            :key="c.id"
                            class="p-0 border border-gray-100 dark:border-gray-800 text-center"
                          >
                            <button
                              :class="[
                                explicitScoreMap.has(
                                  `${r.countryCode}::${c.id}`,
                                )
                                  ? ''
                                  : 'opacity-20',
                              ]"
                              :style="{
                                backgroundColor: `rgba(59, 130, 246, ${getRawScore(r.countryCode, c.id) / 10})`,
                              }"
                              class="w-full h-8 flex items-center justify-center transition-colors hover:ring-1 hover:ring-primary-500"
                              @click="jumpToScoring(c.id, r.countryCode)"
                            >
                              {{ getRawScore(r.countryCode, c.id) }}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Detailed Breakdown -->
            <div class="space-y-4">
              <div class="flex items-center justify-between px-1">
                <h3
                  class="text-xs font-bold uppercase tracking-widest text-gray-500"
                >
                  In-Depth Analysis
                </h3>
                <UButton
                  v-if="session && session.criteria.length > 4"
                  :icon="showAllCriteria ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  size="xs"
                  variant="ghost"
                  @click="showAllCriteria = !showAllCriteria"
                >
                  {{ showAllCriteria ? "Show less" : "Show all criteria" }}
                </UButton>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <UCard
                  v-for="r in ranking"
                  :key="r.countryCode"
                  :ui="{
                    body: 'p-0',
                    header: 'p-4 border-b border-gray-100 dark:border-gray-800',
                    footer: 'p-4 bg-gray-50/50 dark:bg-gray-900/50',
                  }"
                  class="group overflow-hidden hover:ring-2 hover:ring-primary-500/20 transition-all"
                >
                  <template #header>
                    <div class="flex items-center justify-between">
                      <div class="min-w-0">
                        <h4 class="font-black text-base truncate">
                          {{ nameFor(r.countryCode) }}
                        </h4>
                        <p
                          class="text-[10px] text-gray-400 uppercase font-bold tracking-widest"
                        >
                          Ranked #{{ ranking.indexOf(r) + 1 }}
                        </p>
                      </div>
                      <div
                        class="text-xl font-black text-primary-600 tabular-nums"
                      >
                        {{ formatTotal(r.total) }}
                      </div>
                    </div>
                  </template>

                  <div class="p-4 space-y-4">
                    <div
                      v-if="session.notes?.[r.countryCode]"
                      class="relative p-3 rounded-lg bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/50"
                    >
                      <UIcon
                        class="absolute -top-2 -left-1 w-4 h-4 text-primary-200 dark:text-primary-800"
                        name="i-lucide-quote"
                      />
                      <p
                        class="text-xs italic text-gray-600 dark:text-gray-400 line-clamp-3"
                      >
                        {{ session.notes[r.countryCode] }}
                      </p>
                    </div>

                    <div
                      v-if="strengthsAndWeaknesses.has(r.countryCode)"
                      class="grid grid-cols-2 gap-3"
                    >
                      <div class="space-y-2">
                        <div
                          class="text-[9px] font-black uppercase tracking-widest text-success-600 dark:text-success-400"
                        >
                          Strengths
                        </div>
                        <div class="flex flex-col gap-1">
                          <UBadge
                            v-for="s in strengthsAndWeaknesses.get(
                              r.countryCode,
                            )?.strengths || []"
                            :key="s.criterionId"
                            class="text-[9px] py-0.5 px-2 justify-center"
                            color="success"
                            variant="soft"
                          >
                            {{ s.label }}
                          </UBadge>
                          <div
                            v-if="
                              (strengthsAndWeaknesses.get(r.countryCode)
                                ?.strengths?.length || 0) === 0
                            "
                            class="text-[9px] text-gray-400 italic"
                          >
                            None noted
                          </div>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div
                          class="text-[9px] font-black uppercase tracking-widest text-warning-600 dark:text-warning-400"
                        >
                          Weaknesses
                        </div>
                        <div class="flex flex-col gap-1">
                          <UBadge
                            v-for="w in strengthsAndWeaknesses.get(
                              r.countryCode,
                            )?.weaknesses || []"
                            :key="w.criterionId"
                            class="text-[9px] py-0.5 px-2 justify-center"
                            color="warning"
                            variant="soft"
                          >
                            {{ w.label }}
                          </UBadge>
                          <div
                            v-if="
                              (strengthsAndWeaknesses.get(r.countryCode)
                                ?.weaknesses?.length || 0) === 0
                            "
                            class="text-[9px] text-gray-400 italic"
                          >
                            None noted
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <template #footer>
                    <div class="space-y-1.5">
                      <div
                        v-for="c in displayedCriteria"
                        :key="c.id"
                        class="flex items-center justify-between text-[10px]"
                      >
                        <span class="text-gray-500 truncate mr-2">{{
                          c.label
                        }}</span>
                        <div class="flex items-center gap-2">
                          <div
                            class="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"
                          >
                            <div
                              :style="{
                                width: `${getRawScore(r.countryCode, c.id) * 10}%`,
                              }"
                              class="h-full bg-primary-500"
                            ></div>
                          </div>
                          <span class="font-bold tabular-nums w-4 text-right">{{
                            getRawScore(r.countryCode, c.id)
                          }}</span>
                        </div>
                      </div>
                      <div
                        v-if="!showAllCriteria && session.criteria.length > 4"
                        class="text-[9px] text-center pt-1 text-gray-400 font-bold uppercase tracking-tighter"
                      >
                        + {{ session.criteria.length - 4 }} more criteria
                      </div>
                    </div>
                  </template>
                </UCard>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Print Only Report Template -->
      <div
        v-if="session"
        class="hidden print:block print:p-8 space-y-8 bg-white text-gray-900 min-h-screen font-sans"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-start border-b-2 border-primary-500 pb-4"
        >
          <div>
            <h1 class="text-3xl font-black text-primary-600">
              Decision Report
            </h1>
            <p class="text-sm text-gray-500">
              {{ session.title }} • {{ new Date().toLocaleDateString() }}
            </p>
          </div>
          <div class="text-right">
            <p
              class="text-xs font-bold uppercase tracking-widest text-gray-400"
            >
              Country Royale
            </p>
            <p class="text-[10px] text-gray-400">Move Abroad Decision Engine</p>
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ summary?.headline }}
          </h2>
          <p class="text-lg leading-relaxed text-gray-700">
            {{ summary?.summary }}
          </p>
          <div
            class="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm"
          >
            {{ extendedSummary }}
          </div>
        </div>

        <!-- Insights Grid -->
        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-4">
            <h3
              class="text-xs font-black uppercase tracking-widest text-success-600 flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-success-500"></span>
              Primary Advantages
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(line, i) in summary?.why"
                :key="`print-why-${i}`"
                class="text-sm text-gray-700 flex gap-2"
              >
                <span class="text-success-500 font-bold">•</span>
                {{ line }}
              </li>
            </ul>
          </div>
          <div class="space-y-4">
            <h3
              class="text-xs font-black uppercase tracking-widest text-warning-600 flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-warning-500"></span>
              Critical Considerations
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(line, i) in summary?.tradeoffs"
                :key="`print-trade-${i}`"
                class="text-sm text-gray-700 flex gap-2"
              >
                <span class="text-warning-500 font-bold">•</span>
                {{ line }}
              </li>
              <li
                v-for="(line, i) in summary?.risks"
                :key="`print-risk-${i}`"
                class="text-sm text-gray-700 flex gap-2"
              >
                <span class="text-warning-500 font-bold">•</span>
                {{ line }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Full Rankings Table -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold border-b border-gray-100 pb-2">
            Full Leaderboard
          </h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left border-b border-gray-200">
                <th class="py-3 px-2">Rank</th>
                <th class="py-3 px-2">Country</th>
                <th class="py-3 px-2 text-right">Weighted Score</th>
                <th class="py-3 px-2 text-right">Margin to Lead</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in ranking"
                :key="`print-rank-${r.countryCode}`"
                class="border-b border-gray-50"
              >
                <td class="py-3 px-2 font-bold text-gray-500">#{{ i + 1 }}</td>
                <td class="py-3 px-2">
                  <span class="font-bold text-gray-900">{{
                    nameFor(r.countryCode)
                  }}</span>
                  <span class="ml-2 text-xs text-gray-400 font-mono">{{
                    r.countryCode
                  }}</span>
                </td>
                <td class="py-3 px-2 text-right font-black text-primary-600">
                  {{ formatTotal(r.total) }}
                </td>
                <td class="py-3 px-2 text-right text-gray-400">
                  {{
                    i === 0
                      ? "—"
                      : `-${formatTotal(ranking[0]!.total - r.total)} pts`
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Detailed Analysis Per Country -->
        <div class="space-y-6 pt-4 break-before-page">
          <h3 class="text-lg font-bold border-b border-gray-100 pb-2">
            Criteria Breakdown
          </h3>
          <div
            v-for="r in ranking"
            :key="`print-detail-${r.countryCode}`"
            class="break-inside-avoid py-4 border-b border-gray-50 last:border-0"
          >
            <div class="flex justify-between items-end mb-4">
              <h4 class="font-black text-xl text-gray-900">
                {{ nameFor(r.countryCode) }}
              </h4>
              <span class="text-sm font-bold text-primary-600"
                >Score: {{ formatTotal(r.total) }}</span
              >
            </div>

            <div v-if="session.notes?.[r.countryCode]" class="mb-4">
              <p class="text-xs italic text-gray-500 bg-gray-50 p-3 rounded-lg">
                "{{ session.notes[r.countryCode] }}"
              </p>
            </div>

            <div class="grid grid-cols-2 gap-x-12 gap-y-2">
              <div
                v-for="c in sortedCriteria"
                :key="`print-score-${r.countryCode}-${c.id}`"
                class="flex justify-between items-center text-[10px] border-b border-gray-100 py-1"
              >
                <span class="text-gray-600">{{ c.label }}</span>
                <div class="flex items-center gap-2">
                  <div
                    class="w-16 h-1 bg-gray-100 rounded-full overflow-hidden"
                  >
                    <div
                      :style="{
                        width: `${getRawScore(r.countryCode, c.id) * 10}%`,
                      }"
                      class="h-full bg-primary-500"
                    ></div>
                  </div>
                  <span class="font-bold w-4 text-right">{{
                    getRawScore(r.countryCode, c.id)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer (Simulated) -->
        <div class="pt-12 text-center">
          <p class="text-[10px] text-gray-300 uppercase tracking-widest">
            End of Report • Generated via Country Royale App
          </p>
        </div>
      </div>

      <template #fallback>
        <div class="no-print space-y-6">
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-2">
              <div
                class="h-6 w-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
              ></div>
              <div
                class="h-3 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded opacity-50"
              ></div>
            </div>
          </div>
          <UCard>
            <div class="space-y-4 py-4">
              <div
                class="h-8 w-3/4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
              ></div>
              <div class="space-y-2">
                <div
                  class="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
                ></div>
                <div
                  class="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-5/6"
                ></div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { COUNTRIES } from "~/data/countries";
import { analyzeSensitivity } from "~/utils/sensitivity";
import { rankCountries } from "~/utils/scoring";
import { getMarginInsight, getTopDrivers } from "~/utils/insights";
import { buildDecisionSummary } from "~/utils/summary";
import type { ApexOptions } from "apexcharts";

const store = useSessionsStore();
const router = useRouter();
const route = useRoute();
const showAllCriteria = ref(false);

const exportToPdf = () => {
  if (import.meta.client) {
    window.print();
  }
};

const extendedSummary = computed(() => {
  if (!session.value || ranking.value.length === 0) return "";
  const winner = ranking.value[0];
  if (!winner) return "";

  const runnerUp = ranking.value[1];
  const wName = nameFor(winner.countryCode);
  const rName = runnerUp ? nameFor(runnerUp.countryCode) : null;

  const drivers = getTopDrivers(session.value, 5, 10);
  const topPositive = drivers.filter((d) => d.deltaContribution > 0);
  const topNegative = drivers.filter((d) => d.deltaContribution < 0);

  let analysis = `Based on a comprehensive multi-criteria decision analysis, ${wName} has been identified as the optimal choice. `;

  if (runnerUp && rName) {
    const margin = winner.total - runnerUp.total;
    const marginStatus =
      margin > 10 ? "substantial" : margin > 5 ? "clear" : "marginal";
    analysis += `It holds a ${marginStatus} lead over its closest competitor, ${rName}, with a total weighted score of ${formatTotal(winner.total)} versus ${formatTotal(runnerUp.total)}. `;
  }

  if (topPositive.length > 0) {
    analysis += `The primary factors driving this recommendation are ${topPositive
      .slice(0, 2)
      .map((d) => d.label)
      .join(" and ")}, where ${wName} significantly outperformed the field. `;
  }

  if (topNegative.length > 0) {
    analysis += `Potential users should be aware that the selection of ${wName} involves accepting trade-offs in ${topNegative
      .slice(0, 2)
      .map((d) => d.label)
      .join(
        " and ",
      )}, as these are areas where other candidates scored higher. `;
  }

  analysis += `Overall, ${wName} offers the most balanced profile according to your priorities.`;

  return analysis;
});

const sessionId = computed(() => String(route.params.id ?? ""));

const session = computed(() => store.activeSession);

const sortedCriteria = computed(() => {
  return [...(session.value?.criteria || [])].sort(
    (a, b) => b.weight - a.weight,
  );
});

const displayedCriteria = computed(() => {
  if (showAllCriteria.value) return sortedCriteria.value;
  return sortedCriteria.value.slice(0, 4);
});

const marginInsight = computed(() => {
  if (!session.value) return null;
  return getMarginInsight(session.value);
});

const topDrivers = computed(() => {
  if (!session.value) return [];
  return getTopDrivers(session.value, 5, 5);
});

const summary = computed(() => {
  if (!session.value) return null;
  return buildDecisionSummary(session.value, 5, nameFor);
});

const sensitivity = computed(() => {
  if (!session.value) return null;
  if (
    session.value.criteria.length === 0 ||
    session.value.countryCodes.length === 0
  )
    return null;
  return analyzeSensitivity(session.value);
});

const stabilityLabel = computed(() => {
  const s = sensitivity.value;
  if (!s) return "—";
  if (s.isStable) return "Stable";
  if (s.changeRate >= 0.5) return "Very fragile";
  return "Fragile";
});

const isReady = computed(() => {
  const s = session.value;
  if (!s) return false;
  return s.countryCodes.length > 0 && s.criteria.length > 0;
});

const codeToName = computed(() => {
  const map = new Map<string, string>();
  for (const c of COUNTRIES) map.set(c.code, c.name);
  for (const c of store.customCountries) map.set(c.code, c.name);
  return map;
});

const nameFor = (code: string | null) => {
  if (!code) return "—";
  return codeToName.value.get(code) ?? code;
};

const ranking = computed(() => {
  const s = session.value;
  if (!s) return [];
  return rankCountries(s);
});

const radarOptions = computed<ApexOptions>(() => {
  const labels = sortedCriteria.value.map((c: any) => c.label);
  return {
    chart: {
      toolbar: { show: false },
      dropShadow: { enabled: true, blur: 1, left: 1, top: 1 },
    },
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 0 },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          fontSize: "10px",
          fontFamily: "inherit",
        },
      },
    },
    yaxis: { show: false, min: 0, max: 10 },
    colors: ["#ec4899", "#94a3b8"], // pink-500 and slate-400
    legend: { show: false },
  };
});

const radarSeries = computed(() => {
  if (ranking.value.length < 2) return [];
  const top2 = ranking.value.slice(0, 2);

  return top2.map((r) => ({
    name: nameFor(r.countryCode),
    data: sortedCriteria.value.map((c: any) =>
      getRawScore(r.countryCode, c.id),
    ),
  }));
});

const radarComparisonInsight = computed(() => {
  if (ranking.value.length < 2) return null;
  const w = ranking.value[0];
  const r = ranking.value[1];
  const s = session.value;
  if (!s || !w || !r) return null;

  const wName = nameFor(w.countryCode);
  const rName = nameFor(r.countryCode);

  const comparisons = sortedCriteria.value.map((c: any) => {
    const wScore = getRawScore(w.countryCode, c.id);
    const rScore = getRawScore(r.countryCode, c.id);

    const wNormalized = wScore / 10;
    const rNormalized = rScore / 10;

    const wAdjusted =
      c.direction === "higher-is-better" ? wNormalized : 1 - wNormalized;
    const rAdjusted =
      c.direction === "higher-is-better" ? rNormalized : 1 - rNormalized;

    return {
      label: c.label,
      wScore,
      rScore,
      wBetter: wAdjusted > rAdjusted,
      rBetter: rAdjusted > wAdjusted,
      diff: Math.abs(wScore - rScore),
      direction: c.direction,
    };
  });

  const wAdvantages = comparisons
    .filter((c) => c.wBetter)
    .sort((a, b) => b.diff - a.diff);
  const rAdvantages = comparisons
    .filter((c) => c.rBetter)
    .sort((a, b) => b.diff - a.diff);

  let summary = "";
  if (wAdvantages.length > 0 && rAdvantages.length > 0) {
    summary = `${wName}'s victory is primarily driven by its edge in ${wAdvantages[0]?.label}${wAdvantages.length > 1 ? ` and ${wAdvantages[1]?.label}` : ""}. However, ${rName} remains a strong contender, particularly performing better in ${rAdvantages[0]?.label}.`;
  } else if (wAdvantages.length > 0) {
    summary = `${wName} consistently outperforms ${rName} across all key criteria in this selection.`;
  } else if (rAdvantages.length > 0) {
    summary = `Interestingly, ${rName} has higher scores in several areas, but ${wName} wins due to the specific weights and priorities assigned.`;
  }

  return {
    wName,
    rName,
    wAdvantages,
    rAdvantages,
    summary,
  };
});

const barOptions = computed<ApexOptions>(() => {
  const labels = ranking.value.map((r) => nameFor(r.countryCode));
  return {
    chart: { toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        barHeight: "60%",
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      style: { colors: ["#fff"] },
      formatter: (_val: any, opt: any) => {
        return opt.w.globals.labels[opt.dataPointIndex];
      },
      offsetX: 0,
    },
    xaxis: {
      categories: labels,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { show: false },
    },
    grid: { show: false },
    colors: ["#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8", "#fce7f3"], // pink shades
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)} pts`,
      },
    },
  };
});

const barSeries = computed(() => {
  return [
    {
      name: "Score",
      data: ranking.value.map((r) => Number(r.total.toFixed(2))),
    },
  ];
});

const winner = computed(() => ranking.value[0] ?? null);

const winnerName = computed(() => {
  if (!winner.value) return "—";
  return (
    codeToName.value.get(winner.value.countryCode) ?? winner.value.countryCode
  );
});

const winnerTotal = computed(() => winner.value?.total ?? 0);

const formatTotal = (n: number) => {
  // Totals can be fractional (weights * normalized score)
  return n.toFixed(2);
};

const getRawScore = (countryCode: string, criterionId: string) => {
  const s = session.value;
  if (!s) return 5;
  const found = s.scores.find(
    (x: any) => x.countryCode === countryCode && x.criterionId === criterionId,
  );
  return found?.score ?? 5;
};

const strengthsAndWeaknesses = computed(() => {
  const s = session.value;
  if (!s || ranking.value.length === 0) return new Map();

  const result = new Map();

  for (const r of ranking.value) {
    const items = s.criteria.map((c: any) => {
      const raw = getRawScore(r.countryCode, c.id);
      const normalized = raw / 10;
      const adjusted =
        c.direction === "higher-is-better" ? normalized : 1 - normalized;
      return {
        criterionId: c.id,
        label: c.label,
        adjusted,
        weight: c.weight,
        score: raw,
        impact: adjusted * c.weight,
      };
    });

    // Strength = high impact
    const sorted = [...items].sort((a, b) => b.impact - a.impact);
    const strengths = sorted.slice(0, 3).filter((i) => i.adjusted >= 0.6);
    // Weakness = low impact
    const weaknesses = [...items]
      .sort((a, b) => a.impact - b.impact)
      .slice(0, 2)
      .filter((i) => i.adjusted <= 0.4);

    result.set(r.countryCode, { strengths, weaknesses });
  }

  return result;
});

const explicitScoreMap = computed(() => {
  const s = session.value;
  if (!s) return new Set<string>();
  const set = new Set<string>();
  for (const sc of s.scores) {
    set.add(`${sc.countryCode}::${sc.criterionId}`);
  }
  return set;
});

const jumpToScoring = (criterionId: string, countryCode: string) => {
  router.push({
    path: `/sessions/${sessionId.value}/scoring`,
    query: { criterion: criterionId },
  });
};

const goBack = () => {
  router.push(`/sessions/${sessionId.value}/scoring`);
};

const goCountries = () => {
  router.push(`/sessions/${sessionId.value}/countries`);
};

const goCriteria = () => {
  router.push(`/sessions/${sessionId.value}/criteria`);
};

const goScoring = () => {
  router.push(`/sessions/${sessionId.value}/scoring`);
};

const goHome = () => {
  router.push("/");
};

watchEffect(() => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});
watch(sessionId, () => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});
</script>

<style>
@media print {
  header,
  nav,
  .no-print {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
  }

  .container {
    max-width: none !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

.break-before-page {
  break-before: page;
}

.break-inside-avoid {
  break-inside: avoid;
}
</style>
