import React, { useState } from 'react';
import { 
  Grid, 
  Copy, 
  Check, 
  RotateCcw, 
  Divide, 
  Info,
  Sparkles,
  Sliders
} from 'lucide-react';
import { MathView } from './MathView';

export function KernelVisualizer({ 
  filter, 
  kernel, 
  divisor = 1, 
  bias = 0, 
  isCustom = false, 
  onCustomKernelChange,
  onCustomDivisorChange,
  onCustomBiasChange 
}) {
  const [copied, setCopied] = useState(false);

  const rows = kernel.length;
  const cols = kernel[0]?.length || 0;

  // Find max absolute value for heat color scaling
  let maxAbs = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = typeof kernel[r][c] === 'number' ? Math.abs(kernel[r][c]) : 0;
      if (val > maxAbs) maxAbs = val;
    }
  }

  const getCellBg = (val) => {
    if (typeof val !== 'number') return 'rgba(2, 132, 199, 0.08)';
    if (val === 0) return '#f8fafc';
    const intensity = Math.min(Math.abs(val) / maxAbs, 1.0);
    if (val > 0) {
      return `rgba(2, 132, 199, ${0.08 + intensity * 0.28})`;
    } else {
      return `rgba(225, 29, 72, ${0.08 + intensity * 0.25})`;
    }
  };

  const getCellTextColor = (val) => {
    if (typeof val !== 'number') return '#0284c7';
    if (val === 0) return '#64748b';
    if (val > 0) return '#0369a1';
    return '#be123c';
  };

  const handleCellChange = (r, c, rawVal) => {
    const num = parseFloat(rawVal) || 0;
    const newK = kernel.map((row, ri) => 
      row.map((cell, ci) => (ri === r && ci === c ? num : cell))
    );
    onCustomKernelChange(newK);
  };

  const copyAsCode = (format = 'python') => {
    let str = '';
    if (format === 'python') {
      str = `import numpy as np\nkernel = np.array([\n${kernel.map(row => `  [${row.map(v => typeof v === 'number' ? v : 0).join(', ')}]`).join(',\n')}\n])\ndivisor = ${divisor}\nbias = ${bias}`;
    } else {
      str = `const kernel = [\n${kernel.map(row => `  [${row.map(v => typeof v === 'number' ? v : 0).join(', ')}]`).join(',\n')}\n];\nconst divisor = ${divisor};\nconst bias = ${bias};`;
    }
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick presets for custom mode
  const applyCustomPreset = (presetName) => {
    if (presetName === 'identity') {
      onCustomKernelChange([[0, 0, 0], [0, 1, 0], [0, 0, 0]]);
      onCustomDivisorChange(1);
      onCustomBiasChange(0);
    } else if (presetName === 'sharpen') {
      onCustomKernelChange([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);
      onCustomDivisorChange(1);
      onCustomBiasChange(0);
    } else if (presetName === 'edge') {
      onCustomKernelChange([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]);
      onCustomDivisorChange(1);
      onCustomBiasChange(0);
    } else if (presetName === 'blur') {
      onCustomKernelChange([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
      onCustomDivisorChange(9);
      onCustomBiasChange(0);
    }
  };

  return (
    <div className="kernel-visualizer-card glass-panel">
      <div className="kernel-header">
        <div className="kernel-title">
          <Grid size={16} />
          <span>Spatial Kernel Matrix</span>
          <span className="matrix-dim mono">{rows}×{cols}</span>
        </div>
        <div className="kernel-actions">
          <button 
            className="btn-copy-kernel" 
            onClick={() => copyAsCode('python')}
            title="Copy as NumPy Python array"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy NumPy'}</span>
          </button>
        </div>
      </div>

      {isCustom && (
        <div className="custom-presets-row">
          <span className="preset-label">Templates:</span>
          <button className="btn-preset" onClick={() => applyCustomPreset('identity')}>Identity</button>
          <button className="btn-preset" onClick={() => applyCustomPreset('sharpen')}>Sharpen</button>
          <button className="btn-preset" onClick={() => applyCustomPreset('edge')}>Edge Detect</button>
          <button className="btn-preset" onClick={() => applyCustomPreset('blur')}>Box Blur</button>
        </div>
      )}

      {/* 2D Matrix Grid */}
      <div className="matrix-container">
        <div 
          className="matrix-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(42px, 1fr))`
          }}
        >
          {kernel.map((row, r) =>
            row.map((val, c) => (
              <div 
                key={`${r}-${c}`} 
                className="matrix-cell"
                style={{
                  backgroundColor: getCellBg(val),
                  color: getCellTextColor(val)
                }}
              >
                {isCustom ? (
                  <input 
                    type="number"
                    step="any"
                    className="custom-cell-input mono"
                    value={val}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                  />
                ) : (
                  <span className="cell-value mono">
                    {typeof val === 'number' 
                      ? (Number.isInteger(val) ? val : val.toFixed(2))
                      : val}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Normalization Factor & Bias Footer */}
      <div className="kernel-meta-footer">
        <div className="meta-badge">
          <span className="meta-label">Divisor / Scale:</span>
          {isCustom ? (
            <input 
              type="number" 
              step="any" 
              className="custom-meta-input mono"
              value={divisor}
              onChange={(e) => onCustomDivisorChange(parseFloat(e.target.value) || 1)}
            />
          ) : (
            <span className="meta-val mono">
              {divisor === 1 ? '1.0' : `1 / ${Number(divisor).toFixed(divisor % 1 === 0 ? 0 : 2)}`}
            </span>
          )}
        </div>

        <div className="meta-badge">
          <span className="meta-label">DC Bias / Offset:</span>
          {isCustom ? (
            <input 
              type="number" 
              step="any" 
              className="custom-meta-input mono"
              value={bias}
              onChange={(e) => onCustomBiasChange(parseFloat(e.target.value) || 0)}
            />
          ) : (
            <span className="meta-val mono">+{bias}</span>
          )}
        </div>
      </div>

      {filter?.formula && (
        <div className="kernel-formula-bar">
          <span className="formula-label">Equation:</span>
          <div className="formula-content">
            <MathView 
              latex={filter.formula} 
              filterId={filter.id} 
              displayMode={false} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
