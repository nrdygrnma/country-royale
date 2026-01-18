export interface Country {
  code: string;
  name: string;
  region: string;
}

export interface Criterion {
  id: string;
  label: string;
  description?: string;
  weight: number;
  direction: "higher-is-better" | "lower-is-better";
  category?: string;
  mode?: "manual" | "auto";
  sourceKey?: string;
  lastFetched?: string;
}

export interface CountryScore {
  countryCode: string;
  criterionId: string;
  score: number;
  rawValue?: string | number;
}

export interface ComparisonSession {
  id: string;
  title: string;
  countryCodes: string[];
  criteria: Criterion[];
  scores: CountryScore[];
  notes?: Record<string, string>;
  coverImage?: string;
  coverImageAttribution?: string;
  createdAt: string;
}
