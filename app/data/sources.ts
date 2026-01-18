export interface DataSource {
  label: string;
  value: string;
  description?: string;
  min?: number;
  max?: number;
}

export const DATA_SOURCES: DataSource[] = [
  {
    label: "World Bank: GDP per capita",
    value: "worldbank:gdp",
    description:
      "Gross Domestic Product per capita (current US$). A broad measure of a country's economic activity.",
    min: 500,
    max: 100000,
  },
  {
    label: "World Bank: Life expectancy",
    value: "worldbank:life_expectancy",
    description:
      "Life expectancy at birth, total (years). A proxy for the overall quality of the healthcare system.",
    min: 50,
    max: 85,
  },
  {
    label: "RestCountries: Languages",
    value: "restcountries:languages",
    description:
      "Lists the official and commonly spoken languages in the country. Used to assess potential language barriers.",
  },
  {
    label: "RestCountries: Time zones",
    value: "restcountries:timezones",
    description:
      "Lists the time zones used in the country. Helps determine if the country aligns with your routine or client schedules.",
  },
  {
    label: "RestCountries: Driving side",
    value: "restcountries:car_side",
    description:
      "Indicates whether traffic moves on the left or right side of the road.",
  },
  {
    label: "RestCountries: Climate (Location based)",
    value: "restcountries:climate",
    description:
      "Uses the country's geographic coordinates to provide a general climate profile (via external weather integration).",
  },
  {
    label: "RestCountries: Population",
    value: "restcountries:population",
    description:
      "Total population of the country. A proxy for market size and urbanization levels.",
    min: 100000,
    max: 100000000,
  },
  {
    label: "Numbeo: Cost of Living Index",
    value: "numbeo:cost_of_living",
    description:
      "Relative indicator of consumer goods prices, including groceries, restaurants, transportation and utilities. Does not include accommodation (rent or mortgage).",
    min: 20,
    max: 120,
  },
  {
    label: "Numbeo: Crime Index",
    value: "numbeo:crime_index",
    description:
      "Estimation of overall level of crime in a given city or country. Range: 0-100 (lower is safer).",
    min: 10,
    max: 90,
  },
  {
    label: "World Bank: Political Stability",
    value: "worldbank:political_stability",
    description:
      "Political Stability and Absence of Violence/Terrorism. Measures perceptions of the likelihood of political instability and/or politically-motivated violence, including terrorism. Range: -2.5 (weak) to 2.5 (strong).",
    min: -2.5,
    max: 2.5,
  },
  {
    label: "World Bank: Rule of Law",
    value: "worldbank:rule_of_law",
    description:
      "Rule of Law captures perceptions of the extent to which agents have confidence in and abide by the rules of society, and in particular the quality of contract enforcement, property rights, the police, and the courts. Range: -2.5 (weak) to 2.5 (strong).",
    min: -2.5,
    max: 2.5,
  },
  {
    label: "World Bank: Business opportunities",
    value: "worldbank:doing_business",
    description:
      "New business density (registrations per 1,000 people) and investment climate. A higher value indicates a more dynamic business environment or higher foreign investment.",
    min: 0,
    max: 20,
  },
  {
    label: "World Bank: Internet Usage",
    value: "worldbank:internet_usage",
    description:
      "Percentage of individuals who have used the internet in the last 3 months from any device. A proxy for infrastructure quality and connectivity.",
    min: 0,
    max: 100,
  },
  {
    label: "World Bank: Fixed Broadband",
    value: "worldbank:fixed_broadband",
    description:
      "Fixed broadband subscriptions per 100 people. This is a proxy for high-speed internet availability and quality of infrastructure.",
    min: 0,
    max: 50,
  },
  {
    label: "World Bank: Air Pollution (PM2.5)",
    value: "worldbank:air_pollution",
    description:
      "Mean annual exposure to PM2.5 air pollution (micrograms per cubic meter). Measures the concentration of fine particulate matter.",
    min: 0,
    max: 100,
  },
  {
    label: "Wikipedia: Literacy Rate",
    value: "wikipedia:literacy_rate",
    description:
      "Percentage of people ages 15 and above who can both read and write with understanding a short simple statement about their everyday life.",
    min: 50,
    max: 100,
  },
  {
    label: "World Bank: Education Quality (Secondary Enrollment)",
    value: "worldbank:education_quality",
    description:
      "Gross enrollment ratio for secondary education. A higher percentage indicates better access to and quality of the education system.",
    min: 50,
    max: 110,
  },
  {
    label: "World Bank: Disaster Risk Index",
    value: "worldbank:disaster_risk",
    description:
      "Average percentage of population affected by natural disasters (droughts, floods, extreme temperatures) annually. A lower percentage indicates lower risk or better preparedness.",
    min: 0,
    max: 5,
  },
  {
    label: "World Bank: Tax Revenue (% of GDP)",
    value: "worldbank:tax_revenue",
    description:
      "Tax revenue refers to compulsory transfers to the central government for public purposes. It is a broad measure of the tax burden in a country.",
    min: 5,
    max: 35,
  },
  {
    label: "RestCountries: Visa Ease Index",
    value: "restcountries:visa_ease",
    description:
      "A heuristic index (1-10) based on regional openness, international memberships, and common visa-on-arrival or digital nomad programs.",
    min: 1,
    max: 10,
  },
  {
    label: "World Bank: Expat / Community (Migrant Stock %)",
    value: "worldbank:migrant_stock",
    description:
      "Percentage of the population that is foreign-born. A higher value indicates a more established expat community and greater international openness.",
    min: 0,
    max: 30,
  },
];
