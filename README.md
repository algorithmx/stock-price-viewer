Stock Price Viewer 
===

This is a React Component for drawing candlestick diagrams of a stock. 
See `App.tsx` for example usage. 


The present version does not support the plot of volume info. This will be 
improve in the upcoming version. The current data structure for the stock price info
is 

```typescript
export interface StockData {
    D: string; // date
    O: number; // open
    C: number; // close
    H: number; // high
    L: number; // low
}
```
