import React, { useState, useEffect, useCallback } from 'react';
import { StockPriceViewer, StockData } from './StockPriceViewer';

async function fetchStockData(): Promise<StockData[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 10));
  const startDate = new Date('2024-01-01');
  const fakeData: StockData[] = Array.from({ length: 1000 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const centre = Math.random() * 5 + 50;
    const range = Math.random() * 20 - 10;
    const open = centre - range;
    const close = centre + range;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    return {D: date.toISOString(), O: open, C: close, H: high, L: low};
  });
  return fakeData;
}

function App() {
  const [stockDataArray, setStockDataArray] = useState<StockData[][]>([]);
  const addStockData = useCallback(async () => {
    try {
      const newData = await fetchStockData();
      setStockDataArray(prev => [newData]);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  }, []);

  useEffect(() => {
    // Fetch initial data
    addStockData();
    // Set up interval to fetch data every 5 seconds
    const intervalId = setInterval(addStockData, 2000);
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [addStockData]);

  return (
    <div className="App">
      <StockPriceViewer
        stockDataArray={stockDataArray}
        setStockDataArray={setStockDataArray}
        width={600}
        height={300}
        isComplex={true}
      />
    </div>
  );
}

export default App;
