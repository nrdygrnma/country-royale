import { type DataProvider, type FetchResult } from "./index";

export const worldbankProvider: DataProvider = {
  key: "worldbank",
  async fetch(countries, sourceKey): Promise<FetchResult[]> {
    const indicator = getIndicator(sourceKey);
    if (!indicator) {
      return countries.map((code) => ({ countryCode: code, rawValue: 0 }));
    }

    // World Bank API allows multiple countries separated by semicolon: /country/code1;code2;code3/indicator/...
    // Note: If too many countries, we might need to chunk this, but for < 100 it should be fine.
    const countryList = countries.join(";");
    const url = `https://api.worldbank.org/v2/country/${countryList}/indicator/${indicator}?format=json`;

    try {
      const responseText = await $fetch<string>(url, {
        timeout: 15000,
        parseResponse: (txt) => txt,
      }).catch(() => "");

      if (!responseText) {
        throw new Error("Empty response from World Bank");
      }

      // Handle BOM and trim
      const cleanText = responseText.replace(/^\uFEFF/, "").trim();
      if (!cleanText.startsWith("[")) {
        throw new Error("Invalid JSON response from World Bank (possibly XML)");
      }

      const data = JSON.parse(cleanText);
      const resultsMap = new Map<string, { value: number; year: string }>();

      if (data && data[1]) {
        data[1].forEach((item: any) => {
          const code = item?.countryiso3code || item?.country?.id;
          if (code) {
            resultsMap.set(code, { value: item.value, year: item.date });
          }
        });
      }

      const results: FetchResult[] = await Promise.all(
        countries.map(async (code) => {
          let dataPoint: { value: number; year: string } | null | undefined =
            resultsMap.get(code);

          // If value is exactly null or undefined, try individual fetch as fallback
          if (
            !dataPoint ||
            dataPoint.value === undefined ||
            dataPoint.value === null
          ) {
            dataPoint = await fetchIndividualIndicator(code, indicator);
          }

          let value = dataPoint?.value ?? null;
          let year = dataPoint?.year;

          if (
            sourceKey === "fixed_broadband" &&
            (value === 0 || value === null)
          ) {
            // Fallback for fixed_broadband if main indicator missing
            const fb = await fetchFixedBroadbandFallback(code);
            value = fb.value;
            year = fb.year;
            // Final fallback: use Internet Usage if Broadband still missing
            if (value === 0 || value === null) {
              const net: { value: number; year: string } | null =
                await fetchIndividualIndicator(code, "IT.NET.USER.ZS");
              value = net?.value ?? 0;
              year = net?.year;
            }
          } else if (
            sourceKey === "doing_business" &&
            (value === 0 || value === null)
          ) {
            // Fallback for doing_business (IC.BUS.NREG)
            const db = await fetchDoingBusinessFallback(code);
            value = db.value;
            year = db.year;
          }

          return { countryCode: code, rawValue: value || 0, year };
        }),
      );

      return results;
    } catch (e) {
      console.warn(`WorldBank batch error for ${sourceKey}:`, e);
      // On batch failure, fall back to individual requests for each country
      return Promise.all(
        countries.map(async (code) => {
          let dataPoint: { value: number; year: string } | null =
            await fetchIndividualIndicator(code, indicator);
          let value = dataPoint?.value ?? null;
          let year = dataPoint?.year;

          if (
            sourceKey === "fixed_broadband" &&
            (value === 0 || value === null)
          ) {
            const fb = await fetchFixedBroadbandFallback(code);
            value = fb.value;
            year = fb.year;
            // Final fallback: use Internet Usage if Broadband still missing
            if (value === 0 || value === null) {
              const net: { value: number; year: string } | null =
                await fetchIndividualIndicator(code, "IT.NET.USER.ZS");
              value = net?.value ?? 0;
              year = net?.year;
            }
          } else if (
            sourceKey === "doing_business" &&
            (value === 0 || value === null)
          ) {
            const db = await fetchDoingBusinessFallback(code);
            value = db.value;
            year = db.year;
          }

          return { countryCode: code, rawValue: value || 0, year };
        }),
      );
    }
  },
};

async function fetchIndividualIndicator(
  countryCode: string,
  indicator: string,
): Promise<{ value: number; year: string } | null> {
  // Try with mrnev=1 first
  let dataPoint = await fetchRaw(
    `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&mrnev=1`,
  );

  // If that fails (XML error), try without mrnev=1 and take the first non-null
  if (!dataPoint) {
    dataPoint = await fetchRaw(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json`,
    );
  }

  return dataPoint;
}

async function fetchRaw(
  url: string,
): Promise<{ value: number; year: string } | null> {
  try {
    const responseText = await $fetch<string>(url, {
      timeout: 5000,
      parseResponse: (txt) => txt,
    }).catch(() => "");

    const cleanText = responseText.replace(/^\uFEFF/, "").trim();
    if (!cleanText.startsWith("[")) return null;

    const data = JSON.parse(cleanText);
    if (data && data[1] && Array.isArray(data[1])) {
      // Find the first item with a non-null value
      const firstValid = data[1].find(
        (item: any) => item && item.value !== null,
      );
      return firstValid
        ? { value: firstValid.value, year: firstValid.date }
        : null;
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

function getIndicator(sourceKey: string): string | null {
  const map: Record<string, string> = {
    gdp: "NY.GDP.PCAP.CD",
    life_expectancy: "SP.DYN.LE00.IN",
    internet_usage: "IT.NET.USER.ZS",
    fixed_broadband: "IT.NET.BBND.P2",
    air_pollution: "EN.ATM.PM25.MC.M3",
    disaster_risk: "EN.CLC.MDAT.ZS",
    education_quality: "SE.SEC.ENRR",
    migrant_stock: "SM.POP.TOTL.ZS",
    literacy_rate: "SE.ADT.LITR.ZS",
    tax_revenue: "GC.TAX.TOTL.GD.ZS",
    political_stability: "PV.EST",
    rule_of_law: "RL.EST",
    doing_business: "IC.BUS.NREG",
  };
  return map[sourceKey] || null;
}

async function fetchFixedBroadbandFallback(
  code: string,
): Promise<{ value: number; year?: string }> {
  // IT.NET.BBND = Fixed broadband subscriptions (total)
  // SP.POP.TOTL = Population, total
  try {
    const [bbndData, popData]: any = await Promise.all([
      $fetch(
        `https://api.worldbank.org/v2/country/${code}/indicator/IT.NET.BBND?format=json&mrnev=1`,
        { timeout: 5000 },
      ).catch(() => null),
      $fetch(
        `https://api.worldbank.org/v2/country/${code}/indicator/SP.POP.TOTL?format=json&mrnev=1`,
        { timeout: 5000 },
      ).catch(() => null),
    ]);

    let totalBroadband = 0;
    let population = 0;
    let year: string | undefined = undefined;

    if (bbndData && bbndData[1] && bbndData[1][0]) {
      totalBroadband = bbndData[1][0].value;
      year = bbndData[1][0].date;
    }
    if (popData && popData[1] && popData[1][0])
      population = popData[1][0].value;

    if (totalBroadband > 0 && population > 0) {
      return { value: (totalBroadband / population) * 100, year };
    }
  } catch (e) {
    console.warn(`WB Fallback failed for ${code}`, e);
  }
  return { value: 0 };
}

async function fetchDoingBusinessFallback(
  code: string,
): Promise<{ value: number; year?: string }> {
  // If IC.BUS.NREG (New business density) is missing, try FDI (BX.KLT.DINV.WD.GD.ZS)
  try {
    const fdiData: any = await $fetch(
      `https://api.worldbank.org/v2/country/${code}/indicator/BX.KLT.DINV.WD.GD.ZS?format=json&mrnev=1`,
      { timeout: 5000 },
    ).catch(() => null);

    if (fdiData && fdiData[1] && fdiData[1][0]) {
      return { value: fdiData[1][0].value, year: fdiData[1][0].date };
    }
  } catch (e) {}
  return { value: 0 };
}
