// WaveformAnimation.js - Canvas-based wave/plot animator

export class WaveformPlotter {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      gridColor: 'rgba(30, 41, 59, 0.08)',
      textColor: '#475569',
      fontFamily: '"Noto Sans TC", "Segoe UI", system-ui, sans-serif',
      padding: { top: 20, right: 20, bottom: 30, left: 40 },
      ...options,
    };
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    return { width: rect.width, height: rect.height };
  }

  clear() {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);
  }

  // Draw a grid based on custom scale
  drawGrid(xRange, yRange, xStep, yStep, xFormatter = (v) => v, yFormatter = (v) => v) {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const { padding } = this.options;

    const plotWidth = w - padding.left - padding.right;
    const plotHeight = h - padding.top - padding.bottom;

    this.ctx.strokeStyle = this.options.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = this.options.textColor;
    this.ctx.font = `10px ${this.options.fontFamily}`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    // Draw Y axis lines and labels
    const yMin = yRange[0];
    const yMax = yRange[1];
    for (let yVal = yMin; yVal <= yMax + 0.001; yVal += yStep) {
      const yPct = 1 - (yVal - yMin) / (yMax - yMin);
      const yPos = padding.top + yPct * plotHeight;

      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, yPos);
      this.ctx.lineTo(w - padding.right, yPos);
      this.ctx.stroke();

      // Label
      this.ctx.fillText(yFormatter(yVal), padding.left - 8, yPos);
    }

    // Draw X axis lines and labels
    const xMin = xRange[0];
    const xMax = xRange[1];
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    for (let xVal = xMin; xVal <= xMax + 0.001; xVal += xStep) {
      const xPct = (xVal - xMin) / (xMax - xMin);
      const xPos = padding.left + xPct * plotWidth;

      this.ctx.beginPath();
      this.ctx.moveTo(xPos, padding.top);
      this.ctx.lineTo(xPos, h - padding.bottom);
      this.ctx.stroke();

      // Label
      this.ctx.fillText(xFormatter(xVal), xPos, h - padding.bottom + 8);
    }
  }

  // Plot a series of coordinates
  plotLine(points, color, strokeWidth = 2, shadowColor = null) {
    if (points.length < 2) return;

    const rect = this.canvas.getBoundingClientRect();
    const { padding } = this.options;
    const plotWidth = rect.width - padding.left - padding.right;
    const plotHeight = rect.height - padding.top - padding.bottom;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (shadowColor) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = shadowColor;
    }

    this.ctx.beginPath();
    points.forEach((pt, index) => {
      const xPos = padding.left + pt.xPct * plotWidth;
      const yPos = padding.top + (1 - pt.yPct) * plotHeight;
      if (index === 0) {
        this.ctx.moveTo(xPos, yPos);
      } else {
        this.ctx.lineTo(xPos, yPos);
      }
    });
    this.ctx.stroke();
    this.ctx.restore();
  }

  // Draw real-time scrolling signal
  plotScrollingSignal(data, yRange, color, strokeWidth = 2, shadowColor = null) {
    if (data.length < 2) return;

    const points = data.map((val, idx) => {
      const xPct = idx / (data.length - 1);
      const yMin = yRange[0];
      const yMax = yRange[1];
      const yPct = Math.max(0, Math.min(1, (val - yMin) / (yMax - yMin)));
      return { xPct, yPct };
    });

    this.plotLine(points, color, strokeWidth, shadowColor);
  }
}
