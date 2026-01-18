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
}

export interface CountryScore {
  countryCode: string;
  criterionId: string;
  score: number;
}

export interface ComparisonSession {
  id: string;
  title: string;
  countryCodes: string[];
  criteria: Criterion[];
  scores: CountryScore[];
  notes?: Record<string, string>;
  createdAt: string;
}
