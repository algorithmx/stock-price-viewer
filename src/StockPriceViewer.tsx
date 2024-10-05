import React, { useEffect, useRef, useState } from 'react';
import './StockPriceViewer.css';

export interface StockData {
    D: string; // date
    O: number; // open
    C: number; // close
    H: number; // high
    L: number; // low
}

interface StockPriceViewerProps {
    stockDataArray: StockData[][];
    setStockDataArray: React.Dispatch<React.SetStateAction<StockData[][]>>;
    width: number;
    height: number;
    isComplex: boolean;
}

export function StockPriceViewer({
    stockDataArray, 
    setStockDataArray,
    width,
    height,
    isComplex
}: StockPriceViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [windowSize, setWindowSize] = useState(25);
    const [startIndex, setStartIndex] = useState(0);
    const [yScale, setYScale] = useState({ min: 0, max: 0, padding: 0 });
    const config = {
        thinLineWidth: 1,
        upColor: 'red',
        downColor: 'green',
    };
    const paddingPortion = 0.05;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!ctxRef.current) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctxRef.current = ctx;
        }
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (!container) return;
            const dpr = window.devicePixelRatio || 1;
            const width = container.clientWidth * dpr;
            const height = container.clientHeight * dpr;
            canvas.width = width;
            canvas.height = height;
            draw();
        };

        const draw = () => {
            const ctx = ctxRef?.current;
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const visibleData = stockDataArray.flatMap(data => 
                data.slice(startIndex, startIndex + windowSize)
            );
            const minPrice = Math.min(...visibleData.map(d => d.L));
            const maxPrice = Math.max(...visibleData.map(d => d.H));
            const padding = (maxPrice - minPrice) * paddingPortion;
            const yScale = { min: minPrice - 2*padding, max: maxPrice + padding, padding };
            setYScale(yScale);
            stockDataArray.forEach((stockData, index) => {
                drawCandlesticks(ctx, config, stockData, startIndex, windowSize, yScale);
            });
        };

        const handleWheel = (event: WheelEvent) => {
            if (!isComplex) {
                return;
            }
            event.preventDefault();
            const delta = Math.sign(event.deltaY);
            setWindowSize(prevSize => {
                return Math.min(101, Math.max(25, prevSize - delta));
            });
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('wheel', handleWheel);
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [stockDataArray, startIndex, windowSize]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isComplex) {
            return;
        }
        const ctx = ctxRef?.current;
        if (!ctx) return;
        const container = event.currentTarget;
        const verticalLine = container.querySelector('.vertical-line') as HTMLDivElement;
        const horizontalLine = container.querySelector('.horizontal-line') as HTMLDivElement;
        const tooltip = container.querySelector('.tooltip') as HTMLDivElement;
        if (verticalLine && horizontalLine && tooltip) {
            updateTooltipAndLines(event, container, verticalLine, horizontalLine, tooltip, stockDataArray, startIndex, windowSize, yScale);
        }
    };

    return (
        <div className="StockPriceViewer-container" style={{ width: `${width}px`, height: `${height}px` }}>
            <div className="StockPriceViewer-header"></div>
            <div className="StockPriceViewer-content">
                <div 
                    className="StockPriceViewer-canvas" 
                    style={{ position: 'relative', width: '100%', height: '100%' }}
                    onMouseMove={handleMouseMove}
                >
                    <canvas ref={canvasRef}></canvas>
                    {isComplex && (
                        <div className="StockPriceViewer-hover">
                            <div className="vertical-line" style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                width: '0.5px',
                                borderLeft: '0.5px dashed rgba(0, 0, 0, 0.5)',
                                pointerEvents: 'none'
                            }}></div>
                            <div className="horizontal-line" style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                height: '0.5px',
                                borderTop: '0.5px dashed rgba(0, 0, 0, 0.5)',
                                pointerEvents: 'none'
                            }}></div>
                            <div className="tooltip" style={{
                                position: 'absolute',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                padding: '5px',
                                borderRadius: '3px',
                                pointerEvents: 'none',
                                display: 'none'
                            }}></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const modifiedConverter = (date: string) => {
    const dateObj = new Date(date);
    const [_, month, day] = dateObj.toISOString().split('T')[0].split('-');
    return `${month}-${day}`; // Return only month and day
};

function updateTooltipAndLines(
    event: React.MouseEvent<HTMLDivElement>,
    container: HTMLDivElement,
    verticalLine: HTMLDivElement,
    horizontalLine: HTMLDivElement,
    tooltip: HTMLDivElement,
    stockDataArray: StockData[][],
    startIndex: number,
    windowSize: number,
    yScale: { min: number; max: number; padding: number }
) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const canvasWidth = container.clientWidth;
    const canvasHeight = container.clientHeight;
    const alpha = canvasHeight / (yScale.max - yScale.min);
    const xPadding = yScale.padding * alpha;
    const candlestickWidth = Math.max(2, (canvasWidth - 3 * xPadding - (windowSize - 1) * 2) / windowSize);
    const index = Math.floor((x - 2 * xPadding) / (candlestickWidth + 2));
    if (index >= 0 && index < windowSize) {
        const alignedX = (index + 0.5) * (candlestickWidth + 2) + 2 * xPadding - 2;
        verticalLine.style.left = `${alignedX}px`;
        verticalLine.style.top = `${xPadding}px`;
        verticalLine.style.bottom = `${2 * xPadding}px`;
        horizontalLine.style.top = `${y}px`;

        const stockData = stockDataArray.flatMap(data => data.slice(startIndex, startIndex + windowSize));
        const dataPoint = stockData[index];
        if (dataPoint) {
            const price = ((canvasHeight - y) / alpha) + yScale.min;
            const tooltipWidth = tooltip.offsetWidth;
            const spaceToRight = canvasWidth - alignedX;

            // Adjust tooltip position based on available space
            if (spaceToRight < tooltipWidth + 10) {
                // Position tooltip to the left of the vertical line
                tooltip.style.left = `${alignedX - tooltipWidth - 5}px`;
            } else {
                // Position tooltip to the right of the vertical line
                tooltip.style.left = `${alignedX + 5}px`;
            }

            tooltip.style.top = `${y - 20}px`;
            tooltip.innerHTML = `Date: ${modifiedConverter(dataPoint.D)}<br>Price: ${price.toFixed(2)}`;
            tooltip.style.display = 'block';
        }
    } else {
        tooltip.style.display = 'none';
    }
}


// below are the functions for drawing the candlesticks 

// Major worker
function drawCandlesticks(
    ctx: CanvasRenderingContext2D,
    config: {upColor: string, downColor: string, thinLineWidth: number},
    dataAll: StockData[],
    startIndex: number,
    windowSize: number,
    yScale: { min: number; max: number, padding: number }
) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const alpha = canvasHeight / (yScale.max - yScale.min);
    const xPadding = yScale.padding * alpha;
    const candlestickWidth = Math.max(2, (canvasWidth - 3 * xPadding - (windowSize - 1) * 2) / windowSize);
    const calcY = (price: number) => ((yScale.max - price) * alpha);
    dataAll.forEach((d, i) => {
        if (i < startIndex || i >= startIndex + windowSize) return;
        const x = (i - startIndex) * (candlestickWidth + 2) + 2 * xPadding;
        const open = calcY(d.O);
        const close = calcY(d.C);
        const high = calcY(d.H);
        const low = calcY(d.L);
        const isFilled = d.O <= d.C;
        const color = isFilled ? config.upColor : config.downColor;
        drawCandlestick(ctx, x, open, close, candlestickWidth, color, isFilled);
        drawCandlestickLine(ctx, x + candlestickWidth / 2, high, low, color, config.thinLineWidth);
    });
    drawYAxis(ctx, canvasHeight, xPadding, windowSize);
    drawXAxis(ctx, canvasWidth, canvasHeight, xPadding, candlestickWidth, windowSize);
    drawXLabels(ctx, dataAll, canvasHeight, xPadding, candlestickWidth, modifiedConverter);
    drawYLabels(ctx, canvasHeight, xPadding, yScale);
}

// Helper functions

function drawCandlestickLine(
    ctx: CanvasRenderingContext2D,
    x: number,
    high: number,
    low: number,
    color: string,
    lineWidth: number
) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();
}

function drawCandlestick(
    ctx: CanvasRenderingContext2D,
    x: number,
    open: number,
    close: number,
    candlestickWidth: number,
    color: string,
    isFilled: boolean
) {
    if (isFilled) {
        ctx.fillStyle = color;
        ctx.fillRect(x, open, candlestickWidth, close - open);
    } else {
        ctx.strokeStyle = color;
        ctx.strokeRect(x, open, candlestickWidth, close - open);
    }
}

function drawYAxis(
    ctx: CanvasRenderingContext2D,
    canvasHeight: number,
    xPadding: number,
    windowSize: number
) {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.moveTo(2 * xPadding, xPadding);
    ctx.lineTo(2 * xPadding, canvasHeight - 2 * xPadding);
    const dy = (canvasHeight - 3 * xPadding) / 10.0;
    for (let i = 0; i < windowSize; i++) {
        const x0 = 2 * xPadding;
        const y0 = canvasHeight - 2 * xPadding - i * dy;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 - 0.25 * xPadding, y0);
    }
    ctx.stroke();
}

function drawXAxis(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    xPadding: number,
    candlestickWidth: number,
    windowSize: number
) {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.moveTo(2 * xPadding, canvasHeight - 2 * xPadding);
    ctx.lineTo(canvasWidth - 0.75 * xPadding, canvasHeight - 2 * xPadding);
    for (let i = 0; i < windowSize; i++) {
        const x0 = 2.5 * xPadding + i * (candlestickWidth + 2);
        const y0 = canvasHeight - 2 * xPadding;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y0 + ((i % 5 === 0) ? 0.5 * xPadding : 0.2 * xPadding));
    }
    ctx.stroke();
}

function drawXLabels(
    ctx: CanvasRenderingContext2D,
    visibleData: StockData[],
    canvasHeight: number,
    xPadding: number,
    candlestickWidth: number,
    converter: (date: string) => string = (date: string) => date
): void {
    const fontSize = Math.max(10, canvasHeight * 0.02);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    visibleData.forEach((data, index) => {
        const x = 2.5 * xPadding + index * (candlestickWidth + 2);
        if (index % 5 === 0) {
            ctx.fillText(converter(data.D), x - 0.1 * xPadding, canvasHeight - 1 * xPadding);
        }
    });
}

function drawYLabels(
    ctx: CanvasRenderingContext2D,
    canvasHeight: number,
    xPadding: number,
    yScale: { min: number; max: number, padding: number }
): void {
    const fontSize = Math.max(10, canvasHeight * 0.02); // Adaptive font size
    const numLabels = 10;
    const dy = (canvasHeight - 3 * xPadding) / numLabels;
    const dPrice = (yScale.max - yScale.min - 3 * yScale.padding) / numLabels;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    for (let i = 0; i <= numLabels; i++) {
        const price = yScale.min + 2 * yScale.padding + i * dPrice;
        const y = canvasHeight - 2 * xPadding - (i * dy);
        ctx.fillText(price.toFixed(2), 1.5 * xPadding, y);
    }
}