export type CriterionCategory =
  | "Legal & Admin"
  | "Money"
  | "Work & Opportunity"
  | "Infrastructure & Practicalities"
  | "Lifestyle & Social"
  | "Health & Environment"
  | "Risk";

export interface PresetCriterion {
  label: string;
  description: string;
  weight: number;
  direction: "higher-is-better" | "lower-is-better";
  category?: CriterionCategory;
  mode?: "manual" | "auto";
  sourceKey?: string;
}

export interface CriteriaSet {
  id: string;
  name: string;
  criteria: PresetCriterion[];
}

export const PRESET_CRITERIA: PresetCriterion[] = [
  // Legal & Admin
  {
    label: "Visa / residency ease",
    description: "How hard is it to stay long-term?",
    weight: 8,
    direction: "higher-is-better",
    category: "Legal & Admin",
    mode: "auto",
    sourceKey: "restcountries:visa_ease",
  },
  {
    label: "Property rights",
    description:
      "Ownership security and legal reliability (World Bank Rule of Law index)",
    weight: 7,
    direction: "higher-is-better",
    category: "Legal & Admin",
    mode: "auto",
    sourceKey: "worldbank:rule_of_law",
  },

  // Money
  {
    label: "Taxes",
    description: "Overall tax burden (central government revenue % of GDP)",
    weight: 7,
    direction: "lower-is-better",
    category: "Money",
  },
  {
    label: "Cost of living",
    description: "Rent, groceries, services",
    weight: 8,
    direction: "lower-is-better",
    category: "Money",
    mode: "auto",
    sourceKey: "numbeo:cost_of_living",
  },
  {
    label: "Housing availability",
    description: "Quality and availability of rentals",
    weight: 7,
    direction: "higher-is-better",
    category: "Money",
  },
  {
    label: "Bitcoin / Crypto friendly",
    description: "Regulation, adoption, taxes",
    weight: 5,
    direction: "higher-is-better",
    category: "Money",
  },

  // Work & Opportunity
  {
    label: "Job opportunities",
    description: "Local market, salaries, industries",
    weight: 6,
    direction: "higher-is-better",
    category: "Work & Opportunity",
  },
  {
    label: "Business opportunities",
    description: "New business density and investment climate",
    weight: 7,
    direction: "higher-is-better",
    category: "Work & Opportunity",
  },

  // Infrastructure & Practicalities
  {
    label: "Accessibility",
    description: "Flight availability, travel time",
    weight: 7,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
  },
  {
    label: "Infrastructure",
    description: "Roads, utilities, public services reliability",
    weight: 6,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
    mode: "auto",
    sourceKey: "worldbank:internet_usage",
  },
  {
    label: "Internet quality",
    description: "Speed and reliability",
    weight: 5,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
    mode: "auto",
    sourceKey: "worldbank:fixed_broadband",
  },
  {
    label: "Language barrier",
    description: "How easy daily life feels",
    weight: 6,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
    mode: "auto",
    sourceKey: "restcountries:languages",
  },
  {
    label: "Walkability / transport",
    description: "Car-free ease and public transport quality",
    weight: 6,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
  },
  {
    label: "Time zone fit",
    description: "Overlap with clients/teams and your routine",
    weight: 5,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
    mode: "auto",
    sourceKey: "restcountries:timezones",
  },
  {
    label: "Driving side",
    description: "Left or right side of the road",
    weight: 3,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
    mode: "auto",
    sourceKey: "restcountries:car_side",
  },

  // Lifestyle & Social
  {
    label: "Culture fit",
    description: "Lifestyle, values, social vibe",
    weight: 6,
    direction: "higher-is-better",
    category: "Lifestyle & Social",
  },
  {
    label: "Expat / community",
    description: "Ease of building a social network (Migrant stock %)",
    weight: 5,
    direction: "higher-is-better",
    category: "Lifestyle & Social",
    mode: "auto",
    sourceKey: "worldbank:migrant_stock",
  },
  {
    label: "Food quality",
    description: "Groceries variety, restaurants, nutrition options",
    weight: 5,
    direction: "higher-is-better",
    category: "Lifestyle & Social",
  },

  // Health & Environment
  {
    label: "Healthcare quality",
    description: "Access and quality",
    weight: 7,
    direction: "higher-is-better",
    category: "Health & Environment",
    mode: "auto",
    sourceKey: "worldbank:life_expectancy",
  },
  {
    label: "Education quality",
    description: "Schools and environment (Secondary enrollment %)",
    weight: 7,
    direction: "higher-is-better",
    category: "Health & Environment",
    mode: "auto",
    sourceKey: "worldbank:education_quality",
  },
  {
    label: "Literacy rate",
    description: "Percentage of people who can read and write",
    weight: 5,
    direction: "higher-is-better",
    category: "Health & Environment",
    mode: "auto",
    sourceKey: "wikipedia:literacy_rate",
  },
  {
    label: "Climate fit",
    description: "Comfort, seasons, humidity",
    weight: 6,
    direction: "higher-is-better",
    category: "Health & Environment",
    mode: "auto",
    sourceKey: "restcountries:climate",
  },
  {
    label: "Air quality",
    description: "Low pollution levels",
    weight: 6,
    direction: "lower-is-better",
    category: "Health & Environment",
    mode: "auto",
    sourceKey: "worldbank:air_pollution",
  },

  // Risk
  {
    label: "Safety",
    description: "Personal safety & stability",
    weight: 9,
    direction: "higher-is-better",
    category: "Risk",
    mode: "auto",
    sourceKey: "ocindex:crime_index",
  },
  {
    label: "Political stability",
    description: "Low unrest, predictable governance",
    weight: 7,
    direction: "higher-is-better",
    category: "Risk",
    sourceKey: "worldbank:political_stability",
  },
  {
    label: "Natural disaster risk",
    description: "Earthquakes, hurricanes, floods, wildfires",
    weight: 8,
    direction: "lower-is-better",
    category: "Risk",
    mode: "auto",
    sourceKey: "worldbank:disaster_risk",
  },
];

export const CRITERIA_SETS: CriteriaSet[] = [
  {
    id: "digital-nomad",
    name: "Digital Nomad",
    criteria: [
      {
        label: "Cost of living",
        description: "Rent, groceries, services",
        weight: 9,
        direction: "lower-is-better",
        mode: "auto",
        sourceKey: "numbeo:cost_of_living",
      },
      {
        label: "Internet quality",
        description: "Speed and reliability",
        weight: 9,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:fixed_broadband",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 7,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "ocindex:crime_index",
      },
      {
        label: "Visa / residency ease",
        description: "Digital nomad visa or similar",
        weight: 8,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "restcountries:visa_ease",
      },
      {
        label: "Taxes",
        description: "Foreign source income treatment",
        weight: 7,
        direction: "lower-is-better",
      },
      {
        label: "Expat / community",
        description: "Ease of building a social network",
        weight: 6,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:migrant_stock",
      },
      {
        label: "Time zone fit",
        description: "Overlap with clients/teams",
        weight: 5,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "restcountries:timezones",
      },
    ],
  },
  {
    id: "family",
    name: "Family Focus",
    criteria: [
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 10,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "ocindex:crime_index",
      },
      {
        label: "Healthcare quality",
        description: "Access and quality",
        weight: 9,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:life_expectancy",
      },
      {
        label: "Education quality",
        description: "Schools and environment",
        weight: 9,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:education_quality",
      },
      {
        label: "Cost of living",
        description: "Family-sized expenses",
        weight: 7,
        direction: "lower-is-better",
        mode: "auto",
        sourceKey: "numbeo:cost_of_living",
      },
      {
        label: "Air quality",
        description: "Pollution levels",
        weight: 8,
        direction: "lower-is-better",
        mode: "auto",
        sourceKey: "worldbank:air_pollution",
      },
      {
        label: "Political stability",
        description: "Low unrest, predictable governance",
        weight: 8,
        direction: "higher-is-better",
        sourceKey: "worldbank:political_stability",
      },
    ],
  },
  {
    id: "tax-crypto",
    name: "Tax & Crypto Optimization",
    criteria: [
      {
        label: "Taxes",
        description: "Overall tax burden (incl. capital gains where relevant)",
        weight: 10,
        direction: "lower-is-better",
      },
      {
        label: "Bitcoin / Crypto friendly",
        description: "Regulation clarity, adoption, practical usability",
        weight: 9,
        direction: "higher-is-better",
      },
      {
        label: "Political stability",
        description: "Low unrest, predictable governance",
        weight: 8,
        direction: "higher-is-better",
        sourceKey: "worldbank:political_stability",
      },
      {
        label: "Property rights",
        description: "Ownership security and legal reliability",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Visa / residency ease",
        description: "Path to longer stays or residency",
        weight: 7,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "restcountries:visa_ease",
      },
    ],
  },
  {
    id: "wellness",
    name: "Wellness & Environment",
    criteria: [
      {
        label: "Healthcare quality",
        description: "Access, quality, affordability",
        weight: 10,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:life_expectancy",
      },
      {
        label: "Air quality",
        description: "Low pollution and healthier daily baseline",
        weight: 10,
        direction: "lower-is-better",
        mode: "auto",
        sourceKey: "worldbank:air_pollution",
      },
      {
        label: "Climate fit",
        description: "Comfort, seasons, humidity",
        weight: 9,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "restcountries:climate",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 8,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "ocindex:crime_index",
      },
      {
        label: "Natural disaster risk",
        description: "Earthquakes, hurricanes, floods, wildfires",
        weight: 7,
        direction: "lower-is-better",
        mode: "auto",
        sourceKey: "worldbank:disaster_risk",
      },
    ],
  },
  {
    id: "budget",
    name: "Budget / Early Fire",
    criteria: [
      {
        label: "Cost of living",
        description: "Absolute low costs",
        weight: 10,
        direction: "lower-is-better",
        mode: "auto",
        sourceKey: "numbeo:cost_of_living",
      },
      {
        label: "Taxes",
        description: "Low overall tax burden",
        weight: 9,
        direction: "lower-is-better",
      },
      {
        label: "Visa / residency ease",
        description: "Low barrier to entry",
        weight: 8,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "restcountries:visa_ease",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 7,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "ocindex:crime_index",
      },
      {
        label: "Internet quality",
        description: "Reliable enough for remote work",
        weight: 6,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:fixed_broadband",
      },
    ],
  },
  {
    id: "entrepreneur",
    name: "Business & Innovation",
    criteria: [
      {
        label: "Business opportunities",
        description: "New business density and investment climate",
        weight: 10,
        direction: "higher-is-better",
      },
      {
        label: "Property rights",
        description: "Ownership security and legal reliability",
        weight: 9,
        direction: "higher-is-better",
      },
      {
        label: "Taxes",
        description: "Overall tax burden",
        weight: 8,
        direction: "lower-is-better",
      },
      {
        label: "Internet quality",
        description: "High-speed infrastructure",
        weight: 8,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:fixed_broadband",
      },
      {
        label: "Political stability",
        description: "Predictable governance",
        weight: 7,
        direction: "higher-is-better",
        mode: "auto",
        sourceKey: "worldbank:political_stability",
      },
    ],
  },
];
