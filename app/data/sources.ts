export interface DataSource {
  label: string;
  value: string;
  min?: number;
  max?: number;
}

export const DATA_SOURCES: DataSource[] = [
  {
    label: "World Bank: GDP per capita",
    value: "worldbank:gdp",
    min: 500,
    max: 100000,
  },
  {
    label: "World Bank: Life expectancy",
    value: "worldbank:life_expectancy",
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
    min: 20,
    max: 120,
  },
  {
    label: "Numbeo: Crime Index",
    value: "numbeo:crime_index",
    min: 10,
    max: 90,
  },
  {
    label: "Wikipedia: Literacy Rate",
    value: "wikipedia:literacy_rate",
    min: 50,
    max: 100,
  },
];
