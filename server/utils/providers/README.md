### API Integration Template & Guide

To integrate a new API provider into Country Royale, follow these steps.

#### 1. Create the Provider File

Create a new file in `server/utils/providers/` named after your provider (e.g., `teleport.ts`).

```typescript
import {type DataProvider, type FetchResult} from "./index";

export const teleportProvider: DataProvider = {
  key: "teleport", // Prefix in sourceKey (e.g., "teleport:cost_of_living")
  async fetch(countries, metricKey): Promise<FetchResult[]> {
    return Promise.all(
      countries.map(async (code) => {
        let value = 0;
        try {
          // 1. Map metricKey to your API's endpoint
          // 2. Fetch data (use $fetch)
          // 3. Extract value
          // const data = await $fetch(`https://api.teleport.org/api/countries/iso_alpha2:${code}/...`);
          // value = data.some_value;
        } catch (e) {
          console.error(`Teleport error [${code}]:`, e);
        }
        return {countryCode: code, rawValue: value};
      }),
    );
  },
};
```

#### 2. Register the Provider

In `server/utils/providers/index.ts`, import and register your new provider.

```typescript
import {teleportProvider} from "./teleport";
// ...
registerProvider(teleportProvider);
```

#### 3. Add to Data Sources

Update `app/data/sources.ts` to include the new metrics.

```typescript
{
  label: "Teleport: Cost of Living",
    value
:
  "teleport:cost_of_living",
    description
:
  "Crowdsourced cost of living data.",
    min
:
  0,
    max
:
  100,
}
,
```

#### 4. (Optional) Use in Preset Criteria

Update `app/data/criteria.ts` if you want to use the new provider for auto-fetching in preset sets.

```typescript
{
  label: "Cost of living",
    sourceKey
:
  "teleport:cost_of_living",
}
,
```

---

### Best Practices

- **Error Handling**: Always wrap individual country fetches in try-catch so one failure doesn't break the whole batch.
- **Fallbacks**: Provide a default value (e.g., `0`) if data is missing.
- **Complexity**: If an indicator requires multiple API calls, extract it into a helper function within the provider
  file.
- **API Keys**: Use `useRuntimeConfig()` if your API requires an API key. Add it to `nuxt.config.ts` first.
