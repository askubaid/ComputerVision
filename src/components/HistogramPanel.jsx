import React, { useRef, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { calculateHistogram } from '../utils/filterEngine';

export function HistogramPanel({ originalImageData, filteredImageData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!originalImageData || !filteredImageData) {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
      ctx.font = '500 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload a picture to view intensity histogram', width / 2, height / 2);
      return;
    }

    const origHist = calculateHistogram(originalImageData);
    const filtHist = calculateHistogram(filteredImageData);

    // Find max count for normalization
    let maxCount = 1;
    for (let i = 0; i < 256; i++) {
      if (origHist[i] > maxCount) maxCount = origHist[i];
      if (filtHist[i] > maxCount) maxCount = filtHist[i];
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const barWidth = width / 256;

    // Draw Original histogram (soft slate bars)
    ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
    for (let i = 0; i < 256; i++) {
      const h = (origHist[i] / maxCount) * (height - 10);
      const x = i * barWidth;
      const y = height - h;
      ctx.fillRect(x, y, barWidth, h);
    }

    // Draw Filtered histogram (Academic Royal Blue curve)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const h = (filtHist[i] / maxCount) * (height - 10);
      const x = i * barWidth + barWidth / 2;
      const y = height - h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

  }, [originalImageData, filteredImageData]);

  return (
    <div className="histogram-panel-card glass-panel">
      <div className="hist-header">
        <div className="hist-title">
          <BarChart3 size={15} />
          <span>Intensity Histogram Distribution</span>
        </div>
        <div className="hist-legend">
          <span className="legend-item">
            <span className="legend-box orig-box"></span>
            <span>Original</span>
          </span>
          <span className="legend-item">
            <span className="legend-box filt-box"></span>
            <span>Filtered</span>
          </span>
        </div>
      </div>

      <div className="hist-canvas-wrap">
        <canvas ref={canvasRef} width={380} height={75} className="hist-canvas" />
      </div>

      <div className="hist-axis-labels mono">
        <span>0 (Shadows)</span>
        <span>128 (Midtones)</span>
        <span>255 (Highlights)</span>
      </div>
    </div>
  );
}
