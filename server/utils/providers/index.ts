import { worldbankProvider } from "./worldbank";
import { restcountriesProvider } from "./restcountries";
import { numbeoProvider } from "./numbeo";
import { ocindexProvider } from "~~/server/utils/providers/ocindex";

export interface FetchResult {
  countryCode: string;
  rawValue: any;
  year?: number | string;
}

export interface DataProvider {
  /**
   * The unique key prefix for this provider (e.g., 'worldbank', 'numbeo')
   */
  key: string;

  /**
   * Fetches data for a list of countries and a specific source key
   * @param countries List of ISO 3166-1 alpha-2 country codes
   * @param sourceKey The specific metric to fetch (e.g., 'gdp', 'cost_of_living')
   */
  fetch(countries: string[], sourceKey: string): Promise<FetchResult[] | any>;
}

export const providers: Record<string, DataProvider> = {};

export function registerProvider(provider: DataProvider) {
  providers[provider.key] = provider;
}

// Initial registration
registerProvider(worldbankProvider);
registerProvider(restcountriesProvider);
registerProvider(numbeoProvider);
registerProvider(ocindexProvider);
