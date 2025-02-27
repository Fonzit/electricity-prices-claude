import { PriceChart } from "../components/PriceChart";
import { PriceHistogram } from "../components/PriceHistogram";
import { StatsCard } from "../components/StatsCard";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { PriceResponse } from "../types/api";

async function getElectricityPrices(): Promise<PriceResponse> {
  try {
    const response = await fetch("https://api.porssisahko.net/v1/latest-prices.json", {
      next: { revalidate: 3600 } // Revalidate data every hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch electricity prices: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    // Return the data directly, which should match our PriceResponse interface
    return data;
  } catch (error) {
    console.error("Error fetching electricity prices:", error);
    throw error;
  }
}

export default async function Home() {
  try {
    const priceData = await getElectricityPrices();
    
    // Ensure we have prices
    if (!priceData?.prices || !Array.isArray(priceData.prices) || priceData.prices.length === 0) {
      throw new Error("No price data available");
    }
    
    const prices = priceData.prices;
    console.log("Prices data:", prices);
    
    // Calculate stats
    const currentPrice = prices.find(p => {
      if (!p || typeof p !== 'object') return false;
      
      try {
        const now = new Date();
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        return now >= start && now < end;
      } catch (e) {
        console.error("Error parsing date:", e);
        return false;
      }
    });
    
    const avgPrice = prices.reduce((sum, p) => sum + (p?.price || 0), 0) / prices.length;
    const minPrice = Math.min(...prices.map(p => p?.price || 0));
    const maxPrice = Math.max(...prices.map(p => p?.price || 0));
    
    // Calculate percentage change from average
    const currentPriceValue = currentPrice?.price || 0;
    const pctChange = ((currentPriceValue - avgPrice) / avgPrice) * 100;
  
  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Tuntihinnat Suomessa</h1>
        <p className="text-gray-500 mt-2">Nykyiset sähkön tuntihinnat Suomessa (senttiä/kWh)</p>
      </header>
      
      <main className="w-full max-w-5xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Nykyinen Hinta" 
            value={`${currentPriceValue.toFixed(2)} c/kWh`}
            change={`${Math.abs(pctChange).toFixed(1)}% keskiarvosta`}
            isPositive={pctChange <= 0}
          />
          <StatsCard 
            title="Keskihinta" 
            value={`${avgPrice.toFixed(2)} c/kWh`}
          />
          <StatsCard 
            title="Minimihinta" 
            value={`${minPrice.toFixed(2)} c/kWh`}
          />
          <StatsCard 
            title="Maksimihinta" 
            value={`${maxPrice.toFixed(2)} c/kWh`}
          />
        </div>
        
        {/* Chart Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Hintakehitys</h2>
          <PriceChart prices={prices} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Histogram Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Hintajakauma</h2>
            <PriceHistogram prices={prices} />
          </div>
          
          {/* Best Times Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Parhaat Ajat Käyttää Sähköä</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...prices]
                  .sort((a, b) => a.price - b.price)
                  .slice(0, 5)
                  .map(price => {
                    const date = new Date(price.startDate);
                    return (
                      <li key={price.startDate} className="py-3 flex justify-between items-center">
                        <span className="font-medium">
                          {date.toLocaleString('fi-FI', { 
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-green-600 font-bold">{price.price.toFixed(2)} c/kWh</span>
                      </li>
                    );
                  })
                }
              </ul>
            </div>
          </div>
        </div>
        
        {/* Table Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Kaikki Tuntihinnat</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Aika</th>
                  <th className="py-3 px-4 text-left">Hinta (senttiä/kWh)</th>
                  <th className="py-3 px-4 text-left">Tila</th>
                </tr>
              </thead>
              <tbody>
                {[...prices]
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((price) => {
                    const date = new Date(price.startDate);
                    // Determine if this price is below average (good) or above average (bad)
                    const isPriceGood = price.price < avgPrice;
                    
                    return (
                      <tr key={price.startDate} className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-3 px-4">
                          {date.toLocaleString('fi-FI', { 
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">{price.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          {isPriceGood ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              Edullinen
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                              Kallis
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-4 text-center text-gray-500">
        <p>Tiedot saatu porssisahko.net API:sta</p>
        <p className="text-sm mt-1">Viimeksi päivitetty: {new Date().toLocaleString('fi-FI')}</p>
      </footer>
    </div>
  );
  } catch (error) {
    console.error('Error rendering electricity prices:', error);
    return <ErrorDisplay message={error instanceof Error ? error.message : 'Unknown error occurred'} />;
  }
}
