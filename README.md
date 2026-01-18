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
- **Local Persistence**: All your data is saved locally in your browser—no account required, total privacy.
- **Export/Import**: Move your sessions between devices using JSON export/import.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **UI Components**: [Nuxt UI v4](https://ui.nuxt.com/) (based on Radix Vue and Tailwind CSS)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Charts**: [ApexCharts](https://apexcharts.com/)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)
- **Styling**: Tailwind CSS 4

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
- `app/data/`: Static data such as default criteria sets and country lists.
- `app/types/`: TypeScript definitions for the core domain models.

## 📄 License

This project is private and intended for personal use.
