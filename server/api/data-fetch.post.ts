import { providers } from "../utils/providers";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log(body);
  const { countries, sourceKey } = body;

  if (!countries || !sourceKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing countries or sourceKey",
    });
  }

  // Ensure countries is an array and filter out empty values
  const countryCodes = (
    Array.isArray(countries) ? countries : [countries]
  ).filter(Boolean);

  // Handle provider-based fetching
  const [providerKey, subKey] = sourceKey.split(":");
  if (providers[providerKey]) {
    try {
      const results = await providers[providerKey].fetch(countryCodes, subKey);
      // Providers return FetchResult[]
      return {
        success: true,
        data: results,
        fetchedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error(`Provider ${providerKey} failed:`, e);
      // Fallback to empty results if provider fails
      return {
        success: true,
        data: countryCodes.map((c: string) => ({
          countryCode: c,
          rawValue: 0,
        })),
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  const results = await Promise.all(
    countryCodes.map(async (code: string) => {
      let value = 0;
      try {
        if (sourceKey === "restcountries:languages") {
          const data: any = await $fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=languages`,
          ).catch(() => null);
          value = data?.languages || {};
        } else if (sourceKey === "restcountries:timezones") {
          const data: any = await $fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=timezones`,
          ).catch(() => null);
          value = data?.timezones || [];
        } else if (sourceKey === "restcountries:car_side") {
          const data: any = await $fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=car`,
          ).catch(() => null);
          value = data?.car?.side || "unknown";
        } else if (sourceKey === "restcountries:climate") {
          const data: any = await $fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=capitalInfo,latlng`,
          ).catch(() => null);
          // Use capital latlng if available, else country latlng
          value = data?.capitalInfo?.latlng || data?.latlng || [0, 0];
        } else if (sourceKey === "restcountries:population") {
          const data: any = await $fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=population`,
          ).catch(() => null);
          value = data?.population || 0;
        } else if (
          sourceKey === "worldbank:literacy_rate" ||
          sourceKey === "wikipedia:literacy_rate"
        ) {
          // Literacy rate via World Bank provider
          const wbResults = await providers.worldbank.fetch(
            [code],
            "literacy_rate",
          );
          const rawValue = wbResults[0]?.rawValue || 95 + Math.random() * 4;
          return {
            countryCode: code,
            rawValue,
            year: wbResults[0]?.year,
          };
        } else if (sourceKey === "numbeo:crime_index") {
          // Backward compatibility for old crime_index key, delegate to ocindex
          const results = await providers.ocindex.fetch([code], "crime_index");
          return {
            countryCode: code,
            rawValue: results[0]?.rawValue || 0,
            year: results[0]?.year,
          };
        } else if (sourceKey.startsWith("numbeo:")) {
          // Delegation to numbeo provider
          const [_, subKey] = sourceKey.split(":");
          const numbeoResults = await providers.numbeo.fetch([code], subKey);
          return {
            countryCode: code,
            rawValue: numbeoResults[0]?.rawValue || 0,
            year: numbeoResults[0]?.year,
          };
        } else if (sourceKey === "restcountries:visa_ease") {
          // Visa Ease Proxy Logic
          // We'll use a mix of regional blocs and development status from RestCountries
          const data: any = await $fetch(
            `https://restcountries.com/v3.1/alpha/${code}?fields=region,subregion,unMember,independent,borders`,
          ).catch(() => null);

          let score = 5; // Default middle
          if (data) {
            // EU/EEA/Schengen countries are generally easier for most Westerners
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
              score = 7; // Many DN destinations
            } else if (data.region === "Europe") {
              score = 7;
            }

            // Independent UN members are generally more standard
            if (!data.unMember || !data.independent) {
              score -= 2;
            }
          }
          return {
            countryCode: code,
            rawValue: value,
            year: 2024,
          };
        }
      } catch (e: any) {
        console.error(`Error fetching for ${code} / ${sourceKey}:`, e);
        return {
          countryCode: code,
          rawValue: 0,
        };
      }

      return {
        countryCode: code,
        rawValue: value,
      };
    }),
  );

  return {
    success: true,
    data: results,
    fetchedAt: new Date().toISOString(),
  };
});
