import { localProvider } from "./local";
import { type DataProvider, type FetchResult } from "./index";

export const ocindexProvider: DataProvider = {
  key: "ocindex",
  async fetch(countries: string[], sourceKey: string): Promise<FetchResult[]> {
    // Delegate all requests to the local provider to use the new hardcoded data
    return localProvider.fetch(countries, "crime_index");
  },
};
