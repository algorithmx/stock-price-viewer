import React, { useState, useEffect, useCallback } from 'react';
import { StockPriceViewer, StockData } from './StockPriceViewer';

async function fetchStockData(): Promise<StockData[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const fakeData: StockData[] = Array.from({ length: 1000 }, () => ({
    O: Number((Math.random() * 100 + 50).toFixed(2)),  // Open price between 50 and 150
    C: Number((Math.random() * 100 + 50).toFixed(2)),  // Close price between 50 and 150
    H: Number((Math.random() * 100 + 100).toFixed(2)), // High price between 100 and 200
    L: Number((Math.random() * 50 + 25).toFixed(2)),   // Low price between 25 and 75
  }));

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
      />
    </div>
  );
}

export default App;
