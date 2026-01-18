# Country Royale 👑

Country Royale is a powerful, flexible tool designed to help you make objective decisions about where to live, work, or
travel. By defining your own criteria, weighting what matters most to you, and scoring different countries, you can
visualize the best fit for your unique lifestyle.

## 🚀 Features

- **Custom Comparisons**: Create multiple "sessions" to compare different sets of countries or scenarios (e.g., "Digital
  Nomad 2026" vs "Retirement Goals").
- **Criteria Library**: Manage a global library of criteria with categories. Drag and drop to organize.
- **Weighted Scoring**: Assign importance (1-10) to each criterion. The app automatically calculates weighted totals.
- **Dynamic Results**: View your rankings with detailed breakdowns, including:
  - **Head-to-Head Comparison**: Compare the winner against the runner-up using radar charts.
  - **Strengths & Weaknesses**: Automatically identifies where each country excels or falls short.
  - **Decision Report**: AI-style insights summarizing why a country won and what the trade-offs are.
- **Printable Reports**: Generate professional PDF reports of your final rankings and analysis to share or save for
  later.
- **Automated Data Sync**: Fetch real-world statistics (GDP, Taxes, Safety, Property Rights, Visa Ease, etc.) directly
  from reliable
  sources like the World Bank, Numbeo, and REST Countries API.
- **Visual Context**: Automatic fetching of high-quality country images from Unsplash to give each comparison session a
  distinct visual feel.
- **Local Persistence**: All your data is saved locally in your browser—no account required, total privacy.

## 🔌 API Integrations

Country Royale integrates with several public APIs to provide real-time data and rich media:

- **[Unsplash API](https://unsplash.com/developers)**: Used to fetch beautiful, relevant imagery for countries and
  sessions.
- **[World Bank API](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589)**: Provides macro-economic and
  social indicators like GDP, Political Stability, and Rule of Law.
- **[REST Countries](https://restcountries.com/)**: Supplies fundamental country data including flags, languages, and
  population, as well as heuristic metrics for Visa Ease and Climate.
- **[Numbeo](https://www.numbeo.com/)**: Provides comparative data for Cost of Living and Safety (integrated via stable
  mirror/proxy).

## 📖 Documentation

For a detailed guide on how scoring works, data sources, and FAQs, visit our
in-app [Documentation Page](https://country-royale.vercel.app/docs) (or navigate to `/docs` in your local instance).

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **UI Components**: [Nuxt UI v3](https://ui.nuxt.com/v3) (based on Radix Vue and Tailwind CSS)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Charts**: [ApexCharts](https://apexcharts.com/)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)
- **Styling**: Tailwind CSS 4 (via Nuxt UI)

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

## 📂 Project Structure

- `app/pages/`: Contains the main application routes (Sessions, Countries, Criteria, Scoring, Results).
- `app/components/`: Reusable UI components including charts and modals.
- `app/stores/`: Pinia store for managing application state and persistence.
- `app/utils/`: Utility functions for API communication (Unsplash), scoring logic, and sensitivity analysis.
- `server/api/`: Nitro server routes for proxying third-party API requests (World Bank, REST Countries).
- `app/data/`: Static data such as default criteria sets and country lists.
- `app/types/`: TypeScript definitions for the core domain models.

## 📄 License

This project is private and intended for personal use.
