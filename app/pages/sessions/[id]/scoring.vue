<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
    <SessionWizardHeader />

    <div class="flex items-center justify-between gap-4 py-1">
      <div class="space-y-0.5">
        <h1
          class="text-lg font-bold text-gray-900 dark:text-white leading-none"
        >
          Scoring
        </h1>
        <div class="flex items-center gap-1.5">
          <p class="text-[10px] text-gray-500 font-medium">
            Criterion {{ currentIndex + 1 }}/{{ session?.criteria.length }}
          </p>
          <div class="h-0.5 w-0.5 rounded-full bg-gray-300"></div>
          <p class="text-[10px] text-gray-500 font-medium">
            {{ scoredInCurrent }}/{{ totalCountries }} scored
          </p>
          <div
            v-if="criterionProgress.length > 0"
            class="h-0.5 w-0.5 rounded-full bg-gray-300"
          ></div>
          <p
            v-if="criterionProgress.length > 0"
            class="text-[10px] text-gray-500 font-medium"
          >
            <span class="font-black text-primary-500">
              {{ criterionProgress.filter((p) => p.done).length }}/{{
                criterionProgress.length
              }}
            </span>
            complete
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="soft" @click="goBack">Back</UButton>
        <UButton :disabled="!isReady" size="sm" @click="goNext"
          >See results</UButton
        >
      </div>
    </div>

    <ClientOnly>
      <UCard v-if="!session">
        <div class="space-y-2">
          <div class="font-medium">Session not found</div>
          <div class="text-sm opacity-70">
            That session id doesn’t exist. Go back and create one.
          </div>
          <UButton class="mt-2" @click="goHome">Go home</UButton>
        </div>
      </UCard>

      <UCard v-else-if="!isReady">
        <div class="space-y-2">
          <div class="font-medium">Not ready to score yet</div>
          <div class="text-sm opacity-70">
            You need at least one country and one criterion.
          </div>

          <div class="flex gap-2 pt-2">
            <UButton variant="soft" @click="goCountries"
              >Pick countries</UButton
            >
            <UButton variant="soft" @click="goCriteria"
              >Define criteria</UButton
            >
          </div>
        </div>
      </UCard>

      <template v-else>
        <UCard :ui="{ body: 'p-0' }">
          <div
            class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800"
          >
            <!-- Left: Criterion Info -->
            <div class="p-4 sm:p-6 space-y-4">
              <div class="space-y-1">
                <div class="flex items-center flex-wrap gap-2">
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ activeCriterion?.label }}
                  </h2>
                  <div class="flex items-center gap-1.5">
                    <UBadge
                      v-if="activeCriterion?.mode === 'auto'"
                      color="secondary"
                      size="xs"
                      variant="soft"
                    >
                      <UIcon class="mr-1" name="i-lucide-database" />
                      Auto
                    </UBadge>
                    <UBadge class="font-mono" size="xs" variant="subtle"
                      >w{{ activeCriterion?.weight }}</UBadge
                    >
                    <UBadge
                      :color="
                        activeCriterion?.direction === 'higher-is-better'
                          ? 'primary'
                          : 'warning'
                      "
                      size="xs"
                      variant="soft"
                    >
                      {{
                        activeCriterion?.direction === "higher-is-better"
                          ? "↑ Higher is better"
                          : "↓ Lower is better"
                      }}
                    </UBadge>
                  </div>
                </div>
                <p
                  v-if="activeCriterion?.description"
                  class="text-sm text-gray-500"
                >
                  {{ activeCriterion.description }}
                </p>
              </div>

              <div
                v-if="activeCriterion?.sourceKey"
                class="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
              >
                <div class="flex items-center justify-between">
                  <div
                    class="text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Data Automation
                  </div>
                  <div
                    v-if="activeCriterion?.lastFetched"
                    class="text-[10px] text-gray-400"
                  >
                    Synced:
                    {{ new Date(activeCriterion.lastFetched).toLocaleString() }}
                  </div>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <UTooltip
                    :text="
                      DATA_SOURCES.find(
                        (s) => s.value === activeCriterion?.sourceKey,
                      )?.label || activeCriterion?.sourceKey
                    "
                    class="min-w-0 flex-1"
                  >
                    <div
                      class="flex items-center gap-2 text-xs text-blue-500 font-semibold truncate"
                    >
                      <UIcon
                        class="w-4 h-4 shrink-0"
                        name="i-lucide-database"
                      />
                      <span class="truncate">
                        {{
                          DATA_SOURCES.find(
                            (s) => s.value === activeCriterion?.sourceKey,
                          )?.label || activeCriterion?.sourceKey
                        }}
                      </span>
                    </div>
                  </UTooltip>
                  <div class="flex gap-1 shrink-0">
                    <UButton
                      v-if="activeCriterion?.mode === 'auto'"
                      :loading="isSyncing"
                      color="secondary"
                      size="xs"
                      @click="syncCurrentCriterion"
                      >Sync</UButton
                    >
                    <UButton
                      v-if="activeCriterion?.mode === 'auto'"
                      color="secondary"
                      size="xs"
                      variant="ghost"
                      @click="viewStoredData"
                      >View</UButton
                    >
                    <UButton
                      :color="
                        activeCriterion?.mode === 'auto'
                          ? 'neutral'
                          : 'secondary'
                      "
                      :variant="
                        activeCriterion?.mode === 'auto' ? 'ghost' : 'soft'
                      "
                      size="xs"
                      @click="
                        switchCriterionMode(
                          activeCriterion?.mode === 'auto' ? 'manual' : 'auto',
                        )
                      "
                    >
                      {{
                        activeCriterion?.mode === "auto"
                          ? "Manual Mode"
                          : "Switch to Auto"
                      }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Navigation & Progress -->
            <div
              class="p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col justify-between gap-6"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="space-y-1">
                  <div
                    class="text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Progress
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-2xl font-black tabular-nums">{{
                      storedCountCurrent
                    }}</span>
                    <span class="text-gray-400">/</span>
                    <span class="text-lg font-bold text-gray-500">{{
                      session.countryCodes.length
                    }}</span>
                    <UBadge
                      v-if="isCurrentComplete"
                      class="ml-2"
                      color="success"
                      size="xs"
                      variant="soft"
                      >Complete</UBadge
                    >
                  </div>
                </div>

                <div class="flex flex-col items-end gap-2">
                  <div
                    class="text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Navigation
                  </div>
                  <USelectMenu
                    :items="criterionOptions"
                    :model-value="currentCriterion"
                    class="w-48"
                    size="sm"
                    @update:model-value="(v: any) => setCriterionFromSelect(v)"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between gap-2">
                <div class="flex gap-1">
                  <UButton
                    :disabled="!hasPrev"
                    icon="i-lucide-chevron-left"
                    size="sm"
                    variant="soft"
                    @click="goPrevCriterion"
                  />
                  <UButton
                    :disabled="!hasNext"
                    icon="i-lucide-chevron-right"
                    size="sm"
                    variant="soft"
                    @click="goNextCriterion"
                  />
                  <UTooltip text="Jump to first incomplete">
                    <UButton
                      :disabled="!firstIncompleteCriterionId"
                      icon="i-lucide-list-todo"
                      size="sm"
                      variant="ghost"
                      @click="jumpToFirstIncomplete"
                    />
                  </UTooltip>
                </div>
                <div class="flex gap-2">
                  <UButton
                    color="neutral"
                    size="sm"
                    variant="ghost"
                    @click="fillThisCriterionWith5"
                    >Fill All 5s</UButton
                  >
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <UCard>
              <div class="space-y-3">
                <div class="text-sm opacity-80">
                  Score each country from
                  <span class="font-semibold">1</span> (worst) to
                  <span class="font-semibold">10</span> (best). Direction is
                  handled automatically.
                </div>

                <div class="grid gap-2">
                  <div
                    v-for="code in session.countryCodes"
                    :key="code"
                    :class="[
                      selectedCountry === code
                        ? 'border-primary-500 bg-primary-50/30 dark:border-primary-800 dark:bg-primary-950/20'
                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
                    ]"
                    class="flex flex-col gap-2 rounded-lg border p-2 md:flex-row md:items-center md:justify-between transition-all duration-200"
                    role="button"
                    tabindex="0"
                    @click="selectedCountry = code"
                    @keydown.enter.prevent="selectedCountry = code"
                  >
                    <div class="min-w-0 px-1">
                      <div class="font-semibold text-sm truncate leading-tight">
                        {{ codeToName.get(code) ?? code }}
                      </div>
                    </div>

                    <div class="flex items-center gap-3 md:w-120">
                      <div
                        class="tabular-nums w-8 text-center text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 rounded py-0.5"
                      >
                        {{ getScore(code) }}
                      </div>

                      <USlider
                        :key="`${currentCriterionId}::${code}`"
                        :max="10"
                        :min="1"
                        :model-value="getScore(code)"
                        class="flex-1"
                        size="sm"
                        @update:model-value="(v: unknown) => setScore(code, v)"
                      />

                      <UTooltip text="Reset to default (5)">
                        <UButton
                          icon="i-lucide-rotate-ccw"
                          size="xs"
                          variant="ghost"
                          @click="resetToBaseline(code)"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <div class="lg:col-span-1 space-y-6">
            <UCard v-if="selectedCountry">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs uppercase tracking-wide opacity-60">
                      Selected country
                    </div>
                    <div class="text-lg font-semibold">
                      {{ codeToName.get(selectedCountry!) ?? selectedCountry }}
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <UButton size="sm" variant="soft" @click="selectPrevCountry"
                      >Prev</UButton
                    >
                    <UButton size="sm" variant="soft" @click="selectNextCountry"
                      >Next</UButton
                    >
                  </div>
                </div>

                <div class="grid gap-2">
                  <div
                    v-for="c in session.criteria"
                    :key="c.id"
                    class="flex flex-col gap-2 rounded-md border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <div class="font-medium truncate">{{ c.label }}</div>
                        </div>
                        <div class="flex items-center gap-1.5 ml-2">
                          <UButton
                            color="neutral"
                            icon="i-lucide-rotate-ccw"
                            size="xs"
                            variant="ghost"
                            @click="
                              () => {
                                const existing = session!.scores.find(
                                  (x) =>
                                    x.countryCode === selectedCountry! &&
                                    x.criterionId === c.id,
                                );
                                store.setScore(
                                  selectedCountry!,
                                  c.id,
                                  5,
                                  existing?.rawValue,
                                );
                              }
                            "
                          />
                          <UBadge
                            class="tabular-nums w-12 justify-center"
                            variant="soft"
                          >
                            {{ getScoreFor(selectedCountry!, c.id) }}
                          </UBadge>
                        </div>
                      </div>
                      <div class="text-xs opacity-60">
                        w{{ c.weight }} ·
                        <span
                          :class="
                            c.direction === 'higher-is-better'
                              ? 'text-primary-500'
                              : 'text-warning-500'
                          "
                          class="font-medium"
                        >
                          {{
                            c.direction === "higher-is-better"
                              ? "↑ higher"
                              : "↓ lower"
                          }}
                        </span>
                      </div>
                    </div>

                    <USlider
                      :max="10"
                      :min="1"
                      :model-value="getScoreFor(selectedCountry!, c.id)"
                      @update:model-value="
                        (v: unknown) => setScoreFor(selectedCountry!, c.id, v)
                      "
                    />
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>

      <template #fallback>
        <div class="space-y-6">
          <UCard>
            <div class="animate-pulse space-y-4">
              <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
              <div
                class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"
              ></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
            </div>
          </UCard>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <UCard>
                <div class="animate-pulse space-y-3">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="h-12 bg-gray-100 dark:bg-gray-800 rounded"
                  ></div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
    <div v-if="isHydrated">
      <!-- Sync Data Modal -->
      <AppModal
        v-model:open="showSyncModal"
        :title="`Fetching Data: ${activeCriterion?.label}`"
        description="Scraping and processing data for automated scoring"
      >
        <div class="p-6 space-y-6">
          <!-- Step 1: Loading -->
          <div
            v-if="syncStatus === 'loading'"
            class="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <UIcon
              class="w-12 h-12 text-primary-500 animate-spin"
              name="i-lucide-refresh-cw"
            />
            <div class="text-center">
              <div class="font-bold text-lg">Fetching live data...</div>
              <div class="text-sm text-gray-500">
                Connecting to {{ activeCriterion?.sourceKey }}
              </div>
            </div>
            <div
              class="w-full max-w-xs bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden"
            >
              <div
                class="bg-primary-500 h-full animate-[progress_2s_ease-in-out_infinite]"
                style="width: 30%"
              ></div>
            </div>
          </div>

          <!-- Step 2: Questionnaire -->
          <div v-else-if="syncStatus === 'questioning'" class="space-y-6">
            <div class="space-y-4">
              <h3 class="font-bold text-gray-900 dark:text-white">
                {{ questionnaireTitle }}
              </h3>

              <div
                v-if="activeCriterion?.sourceKey === 'restcountries:languages'"
                class="space-y-4"
              >
                <div
                  v-for="d in syncData"
                  :key="d.countryCode"
                  class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-sm">{{ d.countryName }}</span>
                    <div class="flex gap-1">
                      <UBadge
                        v-for="(lang, code) in d.rawValue"
                        :key="code"
                        size="xs"
                        variant="soft"
                        >{{ lang }}</UBadge
                      >
                    </div>
                  </div>
                  <UFormField label="Your proficiency in these languages:">
                    <USelectMenu
                      v-model="d.userResponse"
                      :items="[
                        { label: 'Fluent / Native', value: 10 },
                        { label: 'Conversational', value: 7 },
                        { label: 'Basic / Learning', value: 4 },
                        { label: 'None', value: 1 },
                      ]"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </div>

              <div
                v-if="activeCriterion?.sourceKey === 'restcountries:timezones'"
                class="space-y-4"
              >
                <div
                  class="p-4 bg-primary-50 dark:bg-primary-950/20 rounded-xl mb-4"
                >
                  <UFormField label="Your base timezone:">
                    <USelectMenu
                      v-model="userBaseTimezone"
                      :items="timezoneOptions"
                      class="w-full"
                      placeholder="Select your timezone..."
                      searchable
                    />
                  </UFormField>
                </div>
                <div
                  v-for="d in syncData"
                  :key="d.countryCode"
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <span class="text-sm font-medium">{{ d.countryName }}</span>
                  <div class="flex gap-1 overflow-x-auto max-w-[200px]">
                    <UBadge
                      v-for="tz in d.rawValue"
                      :key="tz"
                      size="xs"
                      variant="outline"
                      >{{ tz }}</UBadge
                    >
                  </div>
                </div>
              </div>

              <div
                v-if="activeCriterion?.sourceKey === 'restcountries:car_side'"
                class="space-y-4"
              >
                <div
                  v-for="d in syncData"
                  :key="d.countryCode"
                  class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between"
                >
                  <div class="space-y-1">
                    <div class="font-bold text-sm">{{ d.countryName }}</div>
                    <div class="text-xs text-gray-500 uppercase">
                      Drives on the
                      <span class="font-black text-primary-500">{{
                        d.rawValue
                      }}</span>
                    </div>
                  </div>
                  <UFormField label="Bothered?">
                    <USelectMenu
                      v-model="d.userResponse"
                      :items="[
                        { label: 'Not at all', value: 10 },
                        { label: 'Slightly', value: 7 },
                        { label: 'Moderately', value: 4 },
                        { label: 'A lot / Dealbreaker', value: 1 },
                      ]"
                      class="w-40"
                    />
                  </UFormField>
                </div>
              </div>

              <div
                v-if="activeCriterion?.sourceKey === 'restcountries:climate'"
                class="space-y-4"
              >
                <div
                  class="p-4 bg-primary-50 dark:bg-primary-950/20 rounded-xl mb-4"
                >
                  <UFormField label="What is your ideal climate?">
                    <USelectMenu
                      v-model="userIdealClimate"
                      :items="[
                        { label: 'Tropical / Hot (Equator)', value: 0 },
                        { label: 'Subtropical / Warm', value: 25 },
                        { label: 'Temperate / Mild', value: 45 },
                        { label: 'Cool / Seasonal', value: 60 },
                        { label: 'Cold / Arctic', value: 80 },
                      ]"
                      class="w-full"
                    />
                  </UFormField>
                </div>
                <div
                  v-for="d in syncData"
                  :key="d.countryCode"
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <span class="text-sm font-medium">{{ d.countryName }}</span>
                  <div class="text-[10px] text-gray-500">
                    Lat: {{ d.rawValue[0]?.toFixed(2) }}°
                  </div>
                </div>
              </div>
            </div>

            <UButton block color="primary" @click="processQuestionnaire">
              Calculate Scores
            </UButton>
          </div>

          <!-- Step 3: Explaining & Confirming -->
          <div v-else-if="syncStatus === 'explaining'" class="space-y-6">
            <div
              class="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-xl border border-primary-100 dark:border-primary-900 flex flex-col gap-3"
            >
              <div class="flex gap-3">
                <UIcon
                  class="w-5 h-5 text-primary-500 shrink-0 mt-0.5"
                  name="i-lucide-info"
                />
                <div
                  class="text-xs leading-relaxed text-primary-900 dark:text-primary-100 font-medium"
                >
                  {{ getInterpretation }}
                </div>
              </div>
              <div
                class="text-[11px] text-primary-700/70 dark:text-primary-300/70 ml-8 leading-tight"
              >
                Data translates to a
                <span class="font-bold text-primary-600 dark:text-primary-400"
                  >1-10 score</span
                >
                based on your preference ({{
                  activeCriterion?.direction === "higher-is-better"
                    ? "Higher is better"
                    : "Lower is better"
                }})
                <template
                  v-if="
                    DATA_SOURCES.find(
                      (s) => s.value === activeCriterion?.sourceKey,
                    )?.min !== undefined
                  "
                >
                  compared to global min/max benchmarks.
                </template>
                <template v-else>
                  relative to the countries in this session.
                </template>
              </div>
            </div>

            <div
              class="max-h-[300px] overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-lg"
            >
              <table class="w-full text-left border-collapse">
                <thead class="sticky top-0 bg-white dark:bg-gray-900 shadow-sm">
                  <tr
                    class="text-[10px] font-bold uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-gray-800"
                  >
                    <th class="p-3">Country</th>
                    <th class="p-3">Raw Value</th>
                    <th class="p-3 text-right">Calculated Score</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr
                    v-for="d in syncData"
                    :key="d.countryCode"
                    class="text-sm"
                  >
                    <td class="p-3 font-medium">{{ d.countryName }}</td>
                    <td class="p-3 text-gray-500 tabular-nums">
                      {{
                        formatRawValue(d.rawValue, activeCriterion?.sourceKey)
                      }}
                    </td>
                    <td class="p-3 text-right">
                      <UBadge
                        :color="
                          d.calculatedScore >= 7
                            ? 'success'
                            : d.calculatedScore >= 4
                              ? 'primary'
                              : 'warning'
                        "
                        class="font-mono"
                        size="xs"
                        variant="soft"
                      >
                        {{ d.calculatedScore }}/10
                      </UBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex flex-col gap-3">
              <div class="text-sm font-semibold">
                What would you like to do?
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UButton
                  block
                  color="primary"
                  icon="i-lucide-check-circle"
                  @click="applySyncedData"
                >
                  Use these scores
                </UButton>
                <UButton
                  block
                  color="neutral"
                  icon="i-lucide-user"
                  variant="soft"
                  @click="switchCriterionMode('manual')"
                >
                  Switch to Manual Mode
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center w-full">
            <UButton
              color="neutral"
              size="sm"
              variant="ghost"
              @click="showSyncModal = false"
            >
              Cancel
            </UButton>
            <div
              v-if="syncStatus === 'explaining'"
              class="text-[10px] text-gray-400"
            >
              Scored via
              {{
                DATA_SOURCES.find((s) => s.value === activeCriterion?.sourceKey)
                  ?.label
              }}
            </div>
          </div>
        </template>
      </AppModal>
    </div>
  </div>
</template>

<style scoped>
@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>

<script lang="ts" setup>
import { COUNTRIES } from "~/data/countries";
import { DATA_SOURCES } from "~/data/sources";

const store = useSessionsStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const isHydrated = ref(false);

onMounted(() => {
  isHydrated.value = true;
});

const isSyncing = ref(false);
const showSyncModal = ref(false);
const syncStatus = ref<"loading" | "questioning" | "explaining" | "confirming">(
  "loading",
);
const syncData = ref<any[]>([]);

const userBaseTimezone = ref({ label: "UTC+00:00", value: 0 });
const userIdealClimate = ref({ label: "Temperate / Mild", value: 45 });
const timezoneOptions = [
  { label: "Samoa / Midway (UTC-11:00)", value: -11 },
  { label: "Hawaii / Honolulu (UTC-10:00)", value: -10 },
  { label: "Alaska (UTC-09:00)", value: -9 },
  { label: "Pacific Time (US/Canada) (UTC-08:00)", value: -8 },
  { label: "Mountain Time (US/Canada) (UTC-07:00)", value: -7 },
  { label: "Central Time (US/Canada) / Mexico City (UTC-06:00)", value: -6 },
  { label: "Eastern Time (US/Canada) / Bogota (UTC-05:00)", value: -5 },
  { label: "Atlantic Time / Santiago (UTC-04:00)", value: -4 },
  { label: "Newfoundland (UTC-03:30)", value: -3.5 },
  { label: "Brasilia / Buenos Aires (UTC-03:00)", value: -3 },
  { label: "Mid-Atlantic (UTC-02:00)", value: -2 },
  { label: "Azores / Cape Verde (UTC-01:00)", value: -1 },
  { label: "London / Lisbon / Casablanca (UTC+00:00)", value: 0 },
  { label: "Berlin / Paris / Rome / Madrid (UTC+01:00)", value: 1 },
  { label: "Athens / Cairo / Johannesburg (UTC+02:00)", value: 2 },
  { label: "Moscow / Istanbul / Nairobi / Riyadh (UTC+03:00)", value: 3 },
  { label: "Tehran (UTC+03:30)", value: 3.5 },
  { label: "Dubai / Baku / Tbilisi / Muscat (UTC+04:00)", value: 4 },
  { label: "Kabul (UTC+04:30)", value: 4.5 },
  { label: "Karachi / Tashkent / Islamabad (UTC+05:00)", value: 5 },
  { label: "Mumbai / New Delhi / Colombo (UTC+05:30)", value: 5.5 },
  { label: "Kathmandu (UTC+05:45)", value: 5.75 },
  { label: "Almaty / Dhaka / Astana (UTC+06:00)", value: 6 },
  { label: "Yangon (Rangoon) (UTC+06:30)", value: 6.5 },
  { label: "Bangkok / Jakarta / Hanoi (UTC+07:00)", value: 7 },
  { label: "Beijing / Singapore / Perth / Hong Kong (UTC+08:00)", value: 8 },
  { label: "Pyongyang (UTC+08:30)", value: 8.5 },
  { label: "Tokyo / Seoul / Yakutsk (UTC+09:00)", value: 9 },
  { label: "Adelaide / Darwin (UTC+09:30)", value: 9.5 },
  { label: "Sydney / Melbourne / Brisbane / Guam (UTC+10:00)", value: 10 },
  { label: "Lord Howe Island (UTC+10:30)", value: 10.5 },
  { label: "Magadan / Solomon Is. (UTC+11:00)", value: 11 },
  { label: "Norfolk Island (UTC+11:30)", value: 11.5 },
  { label: "Auckland / Wellington / Fiji (UTC+12:00)", value: 12 },
  { label: "Chatham Islands (UTC+12:45)", value: 12.75 },
  { label: "Nuku'alofa / Phoenix Is. (UTC+13:00)", value: 13 },
  { label: "Line Islands (Kiritimati) (UTC+14:00)", value: 14 },
];

const formatRawValue = (value: any, sourceKey?: string) => {
  if (value === null || value === undefined) return "—";

  if (sourceKey === "restcountries:languages") {
    if (typeof value === "object") {
      return Object.values(value).join(", ");
    }
  }

  if (sourceKey === "restcountries:timezones") {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
  }

  if (sourceKey === "restcountries:climate") {
    if (Array.isArray(value) && value.length >= 2) {
      return `${value[0].toFixed(2)}°, ${value[1].toFixed(2)}°`;
    }
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return value;
};

const questionnaireTitle = computed(() => {
  if (activeCriterion.value?.sourceKey === "restcountries:languages") {
    return "Tell us about your language skills";
  }
  if (activeCriterion.value?.sourceKey === "restcountries:timezones") {
    return "What is your base timezone?";
  }
  if (activeCriterion.value?.sourceKey === "restcountries:car_side") {
    return "How do you feel about driving on the other side?";
  }
  if (activeCriterion.value?.sourceKey === "restcountries:climate") {
    return "Define your climate preference";
  }
  return "Quick Questions";
});

const getInterpretation = computed(() => {
  if (!activeCriterion.value) return "";

  const sourceKey = activeCriterion.value.sourceKey;
  const sourceDef = DATA_SOURCES.find((s) => s.value === sourceKey);
  const isGlobal = sourceDef?.min !== undefined && sourceDef?.max !== undefined;
  const modeText = isGlobal ? "global benchmarks" : "relative comparison";

  if (sourceKey === "restcountries:languages") {
    return "These scores were calculated based on your personal proficiency levels for each country's official languages.";
  }
  if (sourceKey === "restcountries:timezones") {
    return "Scores represent how well these countries' time zones align with your base time. Smaller differences result in higher scores.";
  }
  if (sourceKey === "restcountries:car_side") {
    return "These scores reflect your comfort level with the driving side used in each country.";
  }
  if (sourceKey === "restcountries:climate") {
    return "Calculated based on the absolute distance from your ideal climate zone (estimated by latitude).";
  }
  if (sourceKey === "restcountries:population") {
    return "Scores are based on the country's total population. Higher population can indicate larger markets and more urban activity, while lower might mean more space and tranquility.";
  }
  if (sourceKey === "worldbank:gdp") {
    return `Higher GDP per capita usually correlates with better infrastructure and higher purchasing power. Scores are normalized against ${modeText}.`;
  }
  if (sourceKey === "worldbank:life_expectancy") {
    return `Life expectancy is a strong indicator of overall healthcare quality and living standards. Scores are normalized against ${modeText}.`;
  }
  if (sourceKey === "numbeo:cost_of_living") {
    return `Based on Numbeo's Cost of Living Index. Higher index means more expensive daily life. Scores are normalized against ${modeText}.`;
  }
  if (sourceKey === "numbeo:crime_index") {
    return `Lower crime index indicates a safer environment. Scores are calculated against ${modeText} so that countries with lower indices receive higher safety scores (based on your "${activeCriterion.value.direction}" setting).`;
  }
  if (
    sourceKey === "worldbank:gdp" &&
    activeCriterion.value.label.toLowerCase().includes("job")
  ) {
    return `Using GDP per capita as a proxy for economic strength and potential job market quality. Higher values typically mean more robust economies.`;
  }
  if (
    sourceKey === "worldbank:life_expectancy" &&
    activeCriterion.value.label.toLowerCase().includes("health")
  ) {
    return `Using Life Expectancy as a proxy for the overall quality and accessibility of the healthcare system.`;
  }
  if (sourceKey === "wikipedia:literacy_rate") {
    return `A high literacy rate is an indicator of the country's investment in education and human development. Scores are normalized against ${modeText}.`;
  }

  return `The scores were normalized based on a ${modeText} of your selection of countries.`;
});

const syncCurrentCriterion = async () => {
  if (!activeCriterion.value || !session.value) return;
  if (activeCriterion.value.mode !== "auto" || !activeCriterion.value.sourceKey)
    return;

  isSyncing.value = true;
  showSyncModal.value = true;
  syncStatus.value = "loading";
  syncData.value = [];

  try {
    const response = await $fetch<any>("/api/data-fetch", {
      method: "POST",
      body: {
        countries: session.value.countryCodes,
        sourceKey: activeCriterion.value.sourceKey,
      },
    });

    if (response.success && response.data) {
      const isInteractive = [
        "restcountries:languages",
        "restcountries:timezones",
        "restcountries:car_side",
        "restcountries:climate",
      ].includes(activeCriterion.value.sourceKey);

      syncData.value = response.data.map((d: any) => ({
        ...d,
        userResponse: null,
        countryName: codeToName.value.get(d.countryCode) || d.countryCode,
      }));

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (isInteractive) {
        syncStatus.value = "questioning";
      } else {
        // 1. Map raw values to scores
        const sourceDef = DATA_SOURCES.find(
          (s) => s.value === activeCriterion.value?.sourceKey,
        );

        const rawValues = response.data.map((d: any) => d.rawValue);
        const min = sourceDef?.min ?? Math.min(...rawValues);
        const max = sourceDef?.max ?? Math.max(...rawValues);

        syncData.value = syncData.value.map((d: any) => {
          let score = 5;
          if (max !== min) {
            // Clamp rawValue to min/max to ensure normalization stays within [0, 1]
            const clampedValue = Math.max(min, Math.min(max, d.rawValue));
            const normalized = (clampedValue - min) / (max - min);

            // normalization: higher rawValue = normalized closer to 1
            if (activeCriterion.value?.direction === "higher-is-better") {
              // Higher rawValue -> Higher score
              score = 1 + normalized * 9;
            } else {
              // Lower rawValue -> Higher score
              score = 10 - normalized * 9;
            }
          } else {
            // All values are the same, give high score if it's the only value or just default to 10
            score = 10;
          }
          return {
            ...d,
            calculatedScore: Math.round(score),
          };
        });
        syncStatus.value = "explaining";
      }
    }
  } catch (err: any) {
    console.error("Sync failed", err);
    toast.add({
      title: "Sync failed",
      description:
        err.data?.message ||
        "Could not fetch data from the source. Please try again.",
      color: "error",
    });
    showSyncModal.value = false;
  } finally {
    isSyncing.value = false;
  }
};

const viewStoredData = () => {
  if (!activeCriterion.value || !session.value) return;

  // Prepare syncData from stored scores
  syncData.value = session.value.countryCodes.map((code) => {
    const scoreObj = session.value?.scores.find(
      (s) =>
        s.countryCode === code && s.criterionId === activeCriterion.value?.id,
    );

    return {
      countryCode: code,
      countryName: codeToName.value.get(code) || code,
      rawValue: scoreObj?.rawValue,
      calculatedScore: scoreObj?.score || 5,
    };
  });

  syncStatus.value = "explaining";
  showSyncModal.value = true;
};

const processQuestionnaire = () => {
  if (!activeCriterion.value) return;

  syncData.value = syncData.value.map((d) => {
    let score = 5;

    if (activeCriterion.value?.sourceKey === "restcountries:languages") {
      score = d.userResponse?.value || 1;
    } else if (activeCriterion.value?.sourceKey === "restcountries:timezones") {
      // Calculate best fit from list of timezones
      // d.rawValue is array like ["UTC-06:00"]
      const offsets = d.rawValue.map((tz: string) => {
        const match = tz.match(/UTC([+-]\d+):(\d+)/);
        if (!match || match[1] === undefined || match[2] === undefined)
          return 0;
        const h = parseInt(match[1]);
        const m = parseInt(match[2]);
        return h + (h >= 0 ? m / 60 : -m / 60);
      });

      const userOffset = userBaseTimezone.value.value;
      const minDiff = Math.min(
        ...offsets.map((o: number) => Math.abs(o - userOffset)),
      );

      // Score: 10 if 0 diff, 1 if 12h diff
      score = Math.max(1, 10 - (minDiff / 12) * 9);
    } else if (activeCriterion.value?.sourceKey === "restcountries:car_side") {
      score = d.userResponse?.value || 10;
    } else if (activeCriterion.value?.sourceKey === "restcountries:climate") {
      // Calculate climate fit based on latitude
      // d.rawValue is [lat, lng]
      const lat = Math.abs(d.rawValue[0] || 0);
      const idealLat = userIdealClimate.value.value;
      const diff = Math.abs(lat - idealLat);
      // Score: 10 if match, 1 if 60+ degrees away
      score = Math.max(1, 10 - (diff / 60) * 9);
    }

    return {
      ...d,
      calculatedScore: Math.round(score),
    };
  });

  syncStatus.value = "explaining";
};

const applySyncedData = () => {
  if (!activeCriterion.value) return;

  syncData.value.forEach((d) => {
    store.setScore(
      d.countryCode,
      activeCriterion.value!.id,
      d.calculatedScore,
      d.rawValue,
    );
  });

  // Update lastFetched in active session
  store.upsertCriterion({
    ...activeCriterion.value,
    lastFetched: new Date().toISOString(),
  });

  toast.add({
    title: "Data applied successfully",
    color: "success",
  });
  showSyncModal.value = false;
};

const switchCriterionMode = (mode: "manual" | "auto") => {
  if (!activeCriterion.value) return;
  store.upsertCriterion({
    ...activeCriterion.value,
    mode,
  });
  if (mode === "manual") {
    showSyncModal.value = false;
  }
};

const sessionId = computed(() => String(route.params.id ?? ""));

onMounted(() => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});

watch(sessionId, () => {
  if (sessionId.value) store.setActiveSession(sessionId.value);
});

const session = computed(() => store.activeSession);

const selectedCountry = ref<string | null>(null);

watch(
  () => session.value?.countryCodes,
  (codes) => {
    if (!codes || codes.length === 0) {
      selectedCountry.value = null;
      return;
    }
    if (!selectedCountry.value || !codes.includes(selectedCountry.value)) {
      selectedCountry.value = codes[0] ?? null;
    }
  },
  { immediate: true },
);

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

/**
 * Criterion selection via query param
 */
const currentCriterionId = computed(() => String(route.query.criterion ?? ""));

const criterionOptions = computed(() => {
  const s = session.value;
  if (!s) return [];
  return s.criteria.map((c: any) => ({ label: c.label, value: c.id }));
});

const ensureCriterionQuery = () => {
  const s = session.value;
  if (!s || s.criteria.length === 0) return;
  const exists = s.criteria.some((c: any) => c.id === currentCriterionId.value);
  const fallbackId = s.criteria[0]!.id;

  if (!currentCriterionId.value || !exists) {
    router.replace({
      path: route.path,
      query: { ...route.query, criterion: fallbackId },
    });
  }
};

watch(
  [session, () => route.query.criterion],
  () => {
    if (!isReady.value) return;
    ensureCriterionQuery();
  },
  { immediate: true },
);

const currentCriterion = computed(() => {
  const c = activeCriterion.value;
  if (!c) return undefined;
  return { label: c.label, value: c.id };
});

const activeCriterion = computed(() => {
  const s = session.value;
  if (!s) return null;
  return (
    s.criteria.find((c: any) => c.id === currentCriterionId.value) ??
    s.criteria[0] ??
    null
  );
});

const currentIndex = computed(() => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return 0;
  const idx = s.criteria.findIndex((c: any) => c.id === cc.value);
  return idx === -1 ? 0 : idx;
});

const totalCountries = computed(() => session.value?.countryCodes.length ?? 0);

const scoredInCurrent = computed(() => {
  const cc = currentCriterion.value;
  if (!cc) return 0;
  return storedCountForCriterion(cc.value);
});

const storedCountForCriterion = (criterionId: string) => {
  const s = session.value;
  if (!s) return 0;
  const set = new Set<string>();
  for (const sc of s.scores) {
    if (
      sc.criterionId === criterionId &&
      s.countryCodes.includes(sc.countryCode)
    ) {
      set.add(sc.countryCode);
    }
  }
  return set.size;
};

const storedCountCurrent = computed(() => {
  const cc = currentCriterion.value;
  if (!cc) return 0;
  return storedCountForCriterion(cc.value);
});

const isCurrentComplete = computed(
  () =>
    totalCountries.value > 0 &&
    storedCountCurrent.value === totalCountries.value,
);

const criterionProgress = computed(() => {
  const s = session.value;
  if (!s) return [];

  const codes = s.countryCodes;
  return s.criteria.map((c: any) => {
    const stored = storedCountForCriterion(c.id);
    const total = codes.length;
    // Done only if we have at least one country and we've scored ALL of them
    const done = total > 0 && stored === total;

    return {
      id: c.id,
      label: c.label,
      stored,
      total,
      done,
    };
  });
});

const firstIncompleteCriterionId = computed(() => {
  const row = criterionProgress.value.find((p: any) => !p.done);
  return row?.id ?? null;
});

const isProgressOpen = ref(false);

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => {
  const s = session.value;
  if (!s) return false;
  return currentIndex.value < s.criteria.length - 1;
});

const setCriterion = (criterionId: string) => {
  router.push({
    path: route.path,
    query: { ...route.query, criterion: criterionId },
  });
};

const jumpToFirstIncomplete = () => {
  if (!firstIncompleteCriterionId.value) return;
  setCriterion(firstIncompleteCriterionId.value);
};

const goPrevCriterion = () => {
  const s = session.value;
  if (!s) return;
  const idx = currentIndex.value;
  if (idx <= 0) return;
  setCriterion(s.criteria[idx - 1]!.id);
};

const goNextCriterion = () => {
  const s = session.value;
  if (!s) return;
  const idx = currentIndex.value;
  if (idx >= s.criteria.length - 1) return;
  setCriterion(s.criteria[idx + 1]!.id);
};

const setCriterionFromSelect = (v: any) => {
  const id = typeof v === "string" ? v : v?.value;
  if (!id) return;
  setCriterion(id);
};

/**
 * Scoring helpers for current criterion
 * Default score shown = 5 (engine also defaults to 5 now).
 */
const getScore = (countryCode: string) => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return 5;
  const found = s.scores.find(
    (x: any) => x.countryCode === countryCode && x.criterionId === cc.value,
  );
  return found?.score ?? 5;
};

const setScore = (countryCode: string, v: unknown) => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return;

  const score = Array.isArray(v) ? v[0] : v;
  if (typeof score !== "number") return;

  store.setScore(countryCode, cc.value, score);
};

const fillThisCriterionWith5 = () => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return;
  for (const code of s.countryCodes) {
    // Preserve rawValue if it exists
    const existing = s.scores.find(
      (x: any) => x.countryCode === code && x.criterionId === cc.value,
    );
    store.setScore(code, cc.value, 5, existing?.rawValue);
  }
};

const resetToBaseline = (countryCode: string) => {
  const s = session.value;
  const cc = currentCriterion.value;
  if (!s || !cc) return;

  const existing = s.scores.find(
    (x: any) => x.countryCode === countryCode && x.criterionId === cc.value,
  );
  store.setScore(countryCode, cc.value, 5, existing?.rawValue);
};

const getScoreFor = (countryCode: string, criterionId: string) => {
  const s = session.value;
  if (!s) return 5;
  const found = s.scores.find(
    (x: any) => x.countryCode === countryCode && x.criterionId === criterionId,
  );
  return found?.score ?? 5;
};

const setScoreFor = (countryCode: string, criterionId: string, v: unknown) => {
  const score = Array.isArray(v) ? v[0] : v;
  if (typeof score !== "number") return;
  store.setScore(countryCode, criterionId, score);
};

const selectPrevCountry = () => {
  const s = session.value;
  if (!s || !selectedCountry.value) return;
  const idx = s.countryCodes.indexOf(selectedCountry.value);
  if (idx <= 0) return;
  selectedCountry.value = s.countryCodes[idx - 1]!;
};

const selectNextCountry = () => {
  const s = session.value;
  if (!s || !selectedCountry.value) return;
  const idx = s.countryCodes.indexOf(selectedCountry.value);
  if (idx === -1 || idx >= s.countryCodes.length - 1) return;
  selectedCountry.value = s.countryCodes[idx + 1]!;
};

/**
 * Navigation
 */
const goBack = () => {
  router.push(`/sessions/${sessionId.value}/criteria`);
};

const goNext = () => {
  router.push(`/sessions/${sessionId.value}/results`);
};

const goCountries = () => {
  router.push(`/sessions/${sessionId.value}/countries`);
};

const goCriteria = () => {
  router.push(`/sessions/${sessionId.value}/criteria`);
};

const goHome = () => {
  router.push("/");
};
</script>
