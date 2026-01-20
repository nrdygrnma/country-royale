import { type DataProvider, type FetchResult } from "./index";

export const restcountriesProvider: DataProvider = {
  key: "restcountries",
  async fetch(countries, sourceKey): Promise<FetchResult[]> {
    return Promise.all(
      countries.map(async (code) => {
        let value: any = 0;
        try {
          if (sourceKey === "visa_ease") {
            value = await fetchVisaEaseProxy(code);
          } else {
            const fields = getFields(sourceKey);
            const data: any = await $fetch(
              `https://restcountries.com/v3.1/alpha/${code}?fields=${fields}`,
            ).catch(() => null);

            if (data) {
              if (sourceKey === "languages") value = data.languages || {};
              else if (sourceKey === "timezones") value = data.timezones || [];
              else if (sourceKey === "car_side")
                value = data.car?.side || "unknown";
              else if (sourceKey === "climate")
                value = data.capitalInfo?.latlng || data.latlng || [0, 0];
              else if (sourceKey === "population") value = data.population || 0;
            }
          }
        } catch (e) {
          console.error(`RestCountries error [${code}]:`, e);
        }
        return {
          countryCode: code,
          rawValue: value,
          year: sourceKey === "population" ? 2023 : undefined,
        };
      }),
    );
  },
};

function getFields(sourceKey: string): string {
  const map: Record<string, string> = {
    languages: "languages",
    timezones: "timezones",
    car_side: "car",
    climate: "capitalInfo,latlng",
    population: "population",
  };
  return map[sourceKey] || "";
}

async function fetchVisaEaseProxy(code: string): Promise<number> {
  const data: any = await $fetch(
    `https://restcountries.com/v3.1/alpha/${code}?fields=region,subregion,unMember,independent`,
  ).catch(() => null);

  let score = 5;
  if (data) {
    if (
      data.region === "Europe" &&
      ["Western Europe", "Northern Europe", "Southern Europe"].includes(
        data.subregion,
      )
    ) {
      score = 8;
    } else if (
      data.region === "Americas" &&
      data.subregion === "North America"
    ) {
      score = 8;
    } else if (data.subregion === "Southeast Asia") {
      score = 7;
    } else if (data.region === "Europe") {
      score = 7;
    }

    if (!data.unMember || !data.independent) {
      score -= 2;
    }
  }
  return score;
}
