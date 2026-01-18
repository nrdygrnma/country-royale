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
  },
  {
    label: "RestCountries: Time zones",
    value: "restcountries:timezones",
  },
  {
    label: "RestCountries: Driving side",
    value: "restcountries:car_side",
  },
  {
    label: "RestCountries: Climate (Location based)",
    value: "restcountries:climate",
  },
  {
    label: "RestCountries: Population",
    value: "restcountries:population",
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
    label: "World Bank: Ease of Doing Business",
    value: "worldbank:doing_business",
    description:
      "Ease of doing business score (0-100), where 100 represents the best regulatory performance. Measures the gap between a particular economy's performance and the best practice.",
    min: 0,
    max: 100,
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
    min: 50,
    max: 100,
  },
  {
    label: "World Bank: Disaster Risk Index",
    value: "worldbank:disaster_risk",
    description:
      "Average percentage of population affected by natural disasters (droughts, floods, extreme temperatures) annually. A lower percentage indicates lower risk or better preparedness.",
    min: 0,
    max: 5,
  },
];
