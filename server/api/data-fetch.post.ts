import { providers } from "../utils/providers/index";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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
      // Fallback to null results if provider fails
      return {
        success: true,
        data: countryCodes.map((c: string) => ({
          countryCode: c,
          rawValue: null,
        })),
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  // Fallback for legacy keys not yet migrated to providers (if any)
  // or return empty success if no provider matches
  return {
    success: true,
    data: countryCodes.map((c: string) => ({
      countryCode: c,
      rawValue: null,
    })),
    fetchedAt: new Date().toISOString(),
  };
});
