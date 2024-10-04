import React, { useEffect, useRef, useState } from 'react';
import { drawCandlesticks } from './drawCandlesticks';
import './StockPriceViewer.css';

export interface StockData {
    O: number;
    C: number;
    H: number;
    L: number;
}

interface StockPriceViewerProps {
    stockDataArray: StockData[][];
    setStockDataArray: React.Dispatch<React.SetStateAction<StockData[][]>>;
}


export function StockPriceViewer({
    stockDataArray, 
    setStockDataArray
}: StockPriceViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [windowSize, setWindowSize] = useState(40);
    const [startIndex, setStartIndex] = useState(0);
    const config = {
        width: 12,
        thinLineWidth: 1,
        upColor: 'red',
        downColor: 'green',
        grayUpColor: 'rgba(128, 128, 128, 0.5)',
        grayDownColor: 'rgba(100, 100, 100, 0.5)',
        spacing: 2,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stockDataArray.forEach((stockData, index) => {
                const windowData = stockData.slice(startIndex, startIndex + windowSize);
                drawCandlesticks(ctx, config, windowData, index === 0);
            });
        };

        const handleResize = () => {
            const container = canvas.parentElement;
            if (!container) return;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            config.width = Math.max(2, Math.floor((canvas.width - (windowSize - 1) * config.spacing) / windowSize));
            draw();
        };

        // const handleWheel = (event: WheelEvent) => {
        //     event.preventDefault();
        //     const delta = Math.sign(event.deltaY);
        //     setWindowSize(prev => Math.max(20, Math.min(Math.max(...stockDataArray.map(data => data.length)), prev + delta)));
        // };

        handleResize();
        window.addEventListener('resize', handleResize);
        // canvas.addEventListener('wheel', handleWheel);

        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            // canvas.removeEventListener('wheel', handleWheel);
        };
    }, [stockDataArray, startIndex, windowSize]);

    return (
        <div className="StockPriceViewer-container">
            <div className="StockPriceViewer-header"></div>
            <div className="StockPriceViewer-content">
                <div className="StockPriceViewer-canvas">
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>
        </div>
    );
}

