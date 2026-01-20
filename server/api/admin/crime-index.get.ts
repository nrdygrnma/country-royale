export default defineEventHandler(async () => {
  const rawData = await useStorage().getItem("db:crimeIndexRaw");
  return { data: rawData };
});
