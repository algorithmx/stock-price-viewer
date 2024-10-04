import { StockData } from "./StockPriceViewer";

export const drawCandlesticks = (ctx: CanvasRenderingContext2D, config: any, stockData: StockData[], isMainStock: boolean) => {
    const { width, thinLineWidth, upColor, downColor, grayUpColor, grayDownColor, spacing } = config;
    const halfWidth = width / 2;

    stockData.forEach((data, index) => {
        const { O, C, H, L } = data;
        const x = index * (width + spacing);

        const isUp = C >= O;
        const color = isMainStock
            ? (isUp ? upColor : downColor)
            : (isUp ? grayUpColor : grayDownColor);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Draw the thick bar (O, C)
        const yTop = Math.min(O, C);
        const yBottom = Math.max(O, C);

        if (isUp) {
            ctx.fillRect(x, yTop, width, yBottom - yTop);
        } else {
            ctx.lineWidth = thinLineWidth;
            ctx.strokeRect(x, yTop, width, yBottom - yTop);
        }

        // Draw the thin line (H, L)
        ctx.lineWidth = thinLineWidth;
        const xCenter = x + halfWidth;
        ctx.beginPath();
        ctx.moveTo(xCenter, H);
        ctx.lineTo(xCenter, L);
        ctx.stroke();

        // Draw T-shaped ends
        ctx.beginPath();
        ctx.moveTo(x, H);
        ctx.lineTo(x + width, H);
        ctx.moveTo(x, L);
        ctx.lineTo(x + width, L);
        ctx.stroke();
    });
};

