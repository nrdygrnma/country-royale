# Country Royale 👑

Country Royale is a powerful, flexible tool designed to help you make objective decisions about where to live, work, or
travel. By defining your own criteria, weighting what matters most to you, and scoring different countries, you can
visualize the best fit for your unique lifestyle.

## 🚀 Features

- **Custom Comparisons**: Create multiple "sessions" to compare different sets of countries or scenarios (e.g., "Digital
  Nomad 2026" vs "Retirement Goals").
- **Criteria Library**: Manage a global library of criteria with categories. Drag and drop to organize.
- **Weighted Scoring**: Assign importance (1-10) to each criterion. The app automatically calculates weighted totals.
- **Detailed Reporting**: View your rankings with detailed breakdowns, including:
  - **Head-to-Head Comparison**: Compare the winner against the runner-up using radar charts.
  - **Strengths & Weaknesses**: Automatically identifies where each country excels or falls short.
  - **Decision Report**: AI-style insights summarizing why a country won and what the trade-offs are.
- **Printable Reports**: Generate professional PDF reports of your final rankings and analysis to share or save for
  later.
- **Automated Data Sync**: Fetch real-world statistics (GDP, Stability, Safety, Rule of Law, Internet Quality, etc.)
  directly from reliable sources like the World Bank, Numbeo, and REST Countries API.
- **Local Data Management**: A dedicated admin panel allows for hardcoding and updating datasets like the Crime Index
  from external JSON sources, ensuring up-to-date and customizable rankings.
- **Visual Context**: Automatic fetching of high-quality country images from Unsplash to give each comparison session a
  distinct visual feel.
- **Local Persistence**: All your data is saved locally in your browser—no account required, total privacy.

## 🔌 Data Indicators & Sources

The automated scoring engine uses the following primary indicators from our trusted providers:

| Category       | Indicator                                 | Source         | Direction        |
|----------------|-------------------------------------------|----------------|------------------|
| Economy        | GDP per capita (current US$)              | World Bank     | Higher is better |
| Safety         | Crime Index / Safety (0-100)              | Local / Numbeo | Lower is better  |
| Health         | Life expectancy at birth (years)          | World Bank     | Higher is better |
| Stability      | Political Stability & Absence of Violence | World Bank     | Higher is better |
| Risk           | Natural Disaster Risk Index               | World Bank     | Lower is better  |
| Money          | Cost of Living Index                      | Numbeo         | Lower is better  |
| Legal          | Rule of Law Index                         | World Bank     | Higher is better |
| Infrastructure | Fixed Broadband per 100 people            | World Bank     | Higher is better |
| Education      | Literacy Rate (% of people ages 15+)      | World Bank     | Higher is better |
| Environment    | Air Pollution (PM2.5) exposure            | World Bank     | Lower is better  |
| Practicality   | Visa Ease Index (Heuristic)               | RestCountries  | Higher is better |
| Social         | Migrant Stock (% of population)           | World Bank     | Higher is better |

For a complete list of indicators including population, languages, and business metrics, refer to the
in-app [Documentation Page](https://country-royale.vercel.app/docs).

### 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **UI Components**: [Nuxt UI v3](https://ui.nuxt.com/v3)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Charts**: [ApexCharts](https://apexcharts.com/)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)
- **Styling**: Tailwind CSS 4
- **Testing**: [Jest](https://jestjs.io/) (API) & [Playwright](https://playwright.dev/) (E2E)

## 📦 Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed (recommended) or Node.js.

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run dev
```

### Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

### 🧪 Testing

```bash
# Run unit & API tests with Jest
bun run test

# Run E2E tests with Playwright
bun run test:e2e

# Open Playwright UI
bun run test:e2e:ui
```

## 📂 Project Structure

- `app/pages/`: Contains the main application routes (Sessions, Countries, Criteria, Scoring, Results).
- `app/components/`: Reusable UI components including charts and modals.
- `app/stores/`: Pinia store for managing application state and persistence.
- `app/utils/`: Utility functions for API communication (Unsplash), scoring logic, and sensitivity analysis.
- `server/api/`: Nitro server routes for proxying third-party API requests (World Bank, REST Countries).
- `app/data/`: Static data such as default criteria sets and country lists.
- `app/types/`: TypeScript definitions for the core domain models.
- `tests/`: Contains Jest API tests and Playwright E2E tests.

## 📄 License

This project is private and intended for personal use.
