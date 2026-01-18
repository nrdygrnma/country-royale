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
  },
  {
    label: "Property rights",
    description: "Ownership security and legal reliability",
    weight: 7,
    direction: "higher-is-better",
    category: "Legal & Admin",
  },

  // Money
  {
    label: "Taxes",
    description: "Income tax, wealth tax, etc.",
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
    mode: "auto",
    sourceKey: "worldbank:gdp",
  },
  {
    label: "Business opportunities",
    description: "Ease of starting, market size",
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
  },
  {
    label: "Internet quality",
    description: "Speed and reliability",
    weight: 5,
    direction: "higher-is-better",
    category: "Infrastructure & Practicalities",
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
    description: "Ease of building a social network",
    weight: 5,
    direction: "higher-is-better",
    category: "Lifestyle & Social",
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
    direction: "higher-is-better",
    category: "Health & Environment",
  },

  // Risk
  {
    label: "Safety",
    description: "Personal safety & stability",
    weight: 9,
    direction: "higher-is-better",
    category: "Risk",
    mode: "auto",
    sourceKey: "numbeo:crime_index",
  },
  {
    label: "Political stability",
    description: "Low unrest, predictable governance",
    weight: 7,
    direction: "higher-is-better",
    category: "Risk",
  },
  {
    label: "Natural disaster risk",
    description: "Earthquakes, hurricanes, floods, wildfires",
    weight: 8,
    direction: "lower-is-better",
    category: "Risk",
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
      },
      {
        label: "Internet quality",
        description: "Speed and reliability",
        weight: 9,
        direction: "higher-is-better",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 7,
        direction: "higher-is-better",
      },
      {
        label: "Visa / residency ease",
        description: "Digital nomad visa or similar",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Taxes",
        description: "Foreign source income treatment",
        weight: 7,
        direction: "lower-is-better",
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
      },
      {
        label: "Healthcare quality",
        description: "Access and quality",
        weight: 9,
        direction: "higher-is-better",
      },
      {
        label: "Education quality",
        description: "Schools and environment",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Cost of living",
        description: "Family-sized expenses",
        weight: 7,
        direction: "lower-is-better",
      },
      {
        label: "Air quality",
        description: "Pollution levels",
        weight: 8,
        direction: "higher-is-better",
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
        label: "Visa / residency ease",
        description: "Path to longer stays or residency",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Cost of living",
        description: "Rent, groceries, services",
        weight: 6,
        direction: "lower-is-better",
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
      },
      {
        label: "Air quality",
        description: "Low pollution and healthier daily baseline",
        weight: 9,
        direction: "higher-is-better",
      },
      {
        label: "Climate fit",
        description: "Comfort, seasons, humidity",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 8,
        direction: "higher-is-better",
      },
      {
        label: "Cost of living",
        description: "Sustainable long-term lifestyle costs",
        weight: 5,
        direction: "lower-is-better",
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
      },
      {
        label: "Taxes",
        description: "Low overall tax burden",
        weight: 8,
        direction: "lower-is-better",
      },
      {
        label: "Visa / residency ease",
        description: "Low barrier to entry",
        weight: 7,
        direction: "higher-is-better",
      },
      {
        label: "Climate fit",
        description: "Comfort, seasons, humidity",
        weight: 5,
        direction: "higher-is-better",
      },
      {
        label: "Safety",
        description: "Personal safety & stability",
        weight: 6,
        direction: "higher-is-better",
      },
    ],
  },
];
