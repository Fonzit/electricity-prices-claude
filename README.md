# Finland Electricity Price Tracker

A web application that displays real-time electricity prices in Finland using data from the [Pörssisähkö API](https://api.porssisahko.net/v1/latest-prices.json). The app helps users track current and upcoming electricity prices, find the cheapest hours, and make informed decisions about their electricity usage.

![Finland Electricity Price Tracker Screenshot](https://example.com/screenshot.png)

## Features

- **Real-time Pricing**: Displays current and upcoming electricity prices
- **Price Visualization**: Charts and graphs showing price trends and distributions
- **Smart Recommendations**: Identifies the best (cheapest) times to use electricity
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to your system preferences
- **Multilingual**: Available in Finnish with "NYT" (now) indicators for current hour prices

## Data Sources

This application uses data from the public Pörssisähkö API, which provides hourly electricity prices for Finland. The data is automatically refreshed hourly to ensure you always have the latest information.

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org)
- **Styling**: [TailwindCSS](https://tailwindcss.com)
- **Visualization**: Custom Canvas-based charts
- **Data Fetching**: Next.js App Router with revalidation

## Deployment

The application can be easily deployed to platforms like Vercel or Netlify. For Vercel deployment:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Deploy with one click

## How This Project Was Created

This project was created through a series of prompts with Claude AI. Here's the progression of prompts that resulted in this application:

1. "I want to create a app that shows electricity hour prices in Finland. Prices data can be fetched from GET https://api.porssisahko.net/v1/latest-prices.json"
2. "I added prices.example.json, please use that for the api request response type and fix the code accordingly"
3. "Now that response format is fixed, please use the API for data fetching"
4. "You can now change port back to default 3000"
5. "Can you translate all the texts to Finnish?"
6. "Page title can be 'Tuntihinnat Suomessa', also please fix TS and lint issues in PriceChart please."
7. "For trend chart, can you make current hour more distinct?"
8. "NYT text is a little bit too big and behind arrow"

The application evolved from a basic price display to a fully featured, localized electricity price tracker with interactive visualizations and responsive design.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by [Pörssisähkö API](https://api.porssisahko.net)
- Built with [Next.js](https://nextjs.org) and [TailwindCSS](https://tailwindcss.com)
- Created with the assistance of Claude AI
