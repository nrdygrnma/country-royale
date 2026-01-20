import { iso3ToIso2 } from "../../utils/isoMapping";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { data } = body;

  if (!data || !data.indicators || !data.indicators["2"]) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid crime index data format",
    });
  }

  const countries = data.indicators["2"]["2025"].countries;
  const mappedData: Record<string, number> = {};

  for (const iso3 in countries) {
    const iso2 = iso3ToIso2[iso3];
    if (iso2) {
      mappedData[iso2] = countries[iso3].value;
    }
  }

  // Store in Nitro storage (file-based in production, memory in dev by default)
  await useStorage().setItem("db:crimeIndex", mappedData);
  await useStorage().setItem("db:crimeIndexRaw", data);

  return { success: true };
});
