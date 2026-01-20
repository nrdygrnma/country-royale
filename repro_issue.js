async function testWorldBank() {
  const codes = ["MU", "CR"]; // Mauritius, Costa Rica
  const indicators = ["IC.BUS.NREG", "SP.POP.TOTL", "BX.KLT.DINV.WD.GD.ZS"];

  const results = [];

  for (const code of codes) {
    const countryData = { code };
    for (const indicator of indicators) {
      const url = `https://api.worldbank.org/v2/country/${code}/indicator/${indicator}?format=json&mrnev=1`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data[1] && data[1][0]) {
          countryData[indicator] = data[1][0].value;
        } else {
          countryData[indicator] = null;
        }
      } catch (error) {
        countryData[indicator] = `Error: ${error.message}`;
      }
    }
    results.push(countryData);
  }
  console.log(JSON.stringify(results, null, 2));
}

testWorldBank();
