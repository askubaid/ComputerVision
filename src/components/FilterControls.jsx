import React from 'react';
import { 
  Sliders, 
  Layers, 
  Radio, 
  Sparkles,
  Maximize2,
  Crosshair,
  Target,
  Palette,
  Eye
} from 'lucide-react';

export function FilterControls({
  filter,
  params,
  onParamChange,
  isCustomActive,
  cornerCount = 0
}) {
  const isCanny = filter?.id === 'canny_edge';
  const isHarris = filter?.id === 'harris_corner';

  return (
    <div className="filter-controls-card glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Sliders size={16} />
          <span>
            {isCanny 
              ? 'Canny Edge Parameters' 
              : isHarris 
              ? 'Harris Corner Parameters' 
              : 'Filter Parameters'}
          </span>
        </div>
      </div>

      <div className="controls-grid">
        {/* ========================================================= */}
        {/* CANNY EDGE DETECTOR CONTROLS                              */}
        {/* ========================================================= */}
        {isCanny && (
          <>
            {/* Low Threshold (T_low) */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Low Hysteresis Threshold (T_low)</span>
                <span className="value-badge mono">{params.cannyLow}</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="120" 
                step="1" 
                value={params.cannyLow} 
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onParamChange('cannyLow', val);
                  if (val >= params.cannyHigh) {
                    onParamChange('cannyHigh', val + 5);
                  }
                }}
              />
              <div className="range-hints">
                <span>More Edges (5)</span>
                <span>Default (30)</span>
                <span>Fewer Weak Edges</span>
              </div>
            </div>

            {/* High Threshold (T_high) */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">High Hysteresis Threshold (T_high)</span>
                <span className="value-badge mono">{params.cannyHigh}</span>
              </label>
              <input 
                type="range" 
                min="20" 
                max="220" 
                step="1" 
                value={params.cannyHigh} 
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onParamChange('cannyHigh', val);
                  if (val <= params.cannyLow) {
                    onParamChange('cannyLow', Math.max(5, val - 5));
                  }
                }}
              />
              <div className="range-hints">
                <span>Permissive</span>
                <span>Default (80)</span>
                <span>Strict Strong Edges</span>
              </div>
            </div>

            {/* Gaussian Pre-smoothing Sigma */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Gaussian Pre-Filter (σ)</span>
                <span className="value-badge mono">{Number(params.cannySigma).toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2.8" 
                step="0.1" 
                value={params.cannySigma} 
                onChange={(e) => onParamChange('cannySigma', parseFloat(e.target.value))}
              />
              <div className="range-hints">
                <span>Fine Details (0.5)</span>
                <span>Balanced (1.2)</span>
                <span>Heavy Denoising</span>
              </div>
            </div>

            {/* Edge Color Invert Mode */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Display Palette Mode</span>
              </label>
              <div className="btn-group">
                <button
                  className={`btn-toggle ${!params.cannyInvert ? 'active' : ''}`}
                  onClick={() => onParamChange('cannyInvert', false)}
                >
                  White on Black
                </button>
                <button
                  className={`btn-toggle ${params.cannyInvert ? 'active' : ''}`}
                  onClick={() => onParamChange('cannyInvert', true)}
                >
                  Black on White (Ink)
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* HARRIS CORNER DETECTOR CONTROLS                           */}
        {/* ========================================================= */}
        {isHarris && (
          <>
            {/* Live Detected Corner Counter */}
            <div className="corner-counter-card">
              <div className="corner-counter-icon">
                <Target size={20} />
              </div>
              <div className="corner-counter-text">
                <span className="counter-number">{cornerCount}</span>
                <span className="counter-label">Corners Detected</span>
              </div>
            </div>

            {/* Detection Sensitivity */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Corner Sensitivity / Quality</span>
                <span className="value-badge mono">{params.harrisSensitivity}%</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="85" 
                step="1" 
                value={params.harrisSensitivity} 
                onChange={(e) => onParamChange('harrisSensitivity', parseInt(e.target.value, 10))}
              />
              <div className="range-hints">
                <span>Prominent Only (Strict)</span>
                <span>Default (35%)</span>
                <span>High Density (Sensitive)</span>
              </div>
            </div>

            {/* Harris Constant k */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Harris Empirical Constant (k)</span>
                <span className="value-badge mono">{Number(params.harrisK).toFixed(3)}</span>
              </label>
              <input 
                type="range" 
                min="0.02" 
                max="0.08" 
                step="0.005" 
                value={params.harrisK} 
                onChange={(e) => onParamChange('harrisK', parseFloat(e.target.value))}
              />
              <div className="range-hints">
                <span>0.02 (Sharp)</span>
                <span>0.04 (Standard)</span>
                <span>0.08 (Smooth)</span>
              </div>
            </div>

            {/* Corner Marker Style */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Marker Visual Style</span>
              </label>
              <div className="btn-group">
                <button
                  className={`btn-toggle ${params.harrisStyle === 'point' ? 'active' : ''}`}
                  onClick={() => onParamChange('harrisStyle', 'point')}
                >
                  Single Pixel
                </button>
                <button
                  className={`btn-toggle ${params.harrisStyle === 'target' ? 'active' : ''}`}
                  onClick={() => onParamChange('harrisStyle', 'target')}
                >
                  Target Ring
                </button>
                <button
                  className={`btn-toggle ${params.harrisStyle === 'cross' ? 'active' : ''}`}
                  onClick={() => onParamChange('harrisStyle', 'cross')}
                >
                  Crosshair
                </button>
                <button
                  className={`btn-toggle ${params.harrisStyle === 'dot' ? 'active' : ''}`}
                  onClick={() => onParamChange('harrisStyle', 'dot')}
                >
                  Solid Dot
                </button>
              </div>
            </div>

            {/* Corner Isolation Display Mode (Radio Button Options) */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Corner Display Mode</span>
              </label>
              <div className="radio-group-container">
                <label className={`radio-item-label ${!params.harrisIsolated ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="harrisDisplayMode"
                    value="overlay"
                    checked={!params.harrisIsolated}
                    onChange={() => onParamChange('harrisIsolated', false)}
                  />
                  <div className="radio-text">
                    <span className="radio-title">Overlay on Image</span>
                    <span className="radio-desc">Display detected corners on top of grayscale image</span>
                  </div>
                </label>

                <label className={`radio-item-label ${params.harrisIsolated && params.harrisIsolatedBg === 'black' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="harrisDisplayMode"
                    value="black"
                    checked={params.harrisIsolated && params.harrisIsolatedBg === 'black'}
                    onChange={() => {
                      onParamChange('harrisIsolated', true);
                      onParamChange('harrisIsolatedBg', 'black');
                    }}
                  />
                  <div className="radio-text">
                    <span className="radio-title">Corners Only (Black Canvas)</span>
                    <span className="radio-desc">Paint corner points only; remove image as black pixels</span>
                  </div>
                </label>

                <label className={`radio-item-label ${params.harrisIsolated && params.harrisIsolatedBg === 'white' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="harrisDisplayMode"
                    value="white"
                    checked={params.harrisIsolated && params.harrisIsolatedBg === 'white'}
                    onChange={() => {
                      onParamChange('harrisIsolated', true);
                      onParamChange('harrisIsolatedBg', 'white');
                    }}
                  />
                  <div className="radio-text">
                    <span className="radio-title">Corners Only (White Canvas)</span>
                    <span className="radio-desc">Paint corner points only; remove image as white pixels</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Marker Color */}
            <div className="control-item">
              <label className="control-label">
                <span className="label-text">Keypoint Marker Color</span>
              </label>
              <div className="marker-color-picker">
                {[
                  { id: 'red', name: 'Crimson', color: '#ff2832' },
                  { id: 'cyan', name: 'Cyan', color: '#06d6f0' },
                  { id: 'green', name: 'Emerald', color: '#10ea50' },
                  { id: 'yellow', name: 'Gold', color: '#facc15' },
                  { id: 'black', name: 'Obsidian Black', color: '#0f172a' },
                  { id: 'white', name: 'Pure White', color: '#ffffff' }
                ].map(c => (
                  <button
                    key={c.id}
                    className={`color-swatch-btn ${params.harrisColor === c.id ? 'active' : ''}`}
                    style={{ backgroundColor: c.color }}
                    onClick={() => onParamChange('harrisColor', c.id)}
                    title={c.name}
                  >
                    {params.harrisColor === c.id && (
                      <span className="swatch-check" style={{ color: c.id === 'white' ? '#0f172a' : '#ffffff' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* STANDARD FILTER CONTROLS                                  */}
        {/* ========================================================= */}
        {!isCanny && !isHarris && (
          <>
            {/* Kernel Size Selector */}
            {filter?.supportsSizeSelection && !isCustomActive && (
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Kernel Window Size</span>
                  <span className="value-badge mono">{params.kernelSize}×{params.kernelSize}</span>
                </label>
                <div className="btn-group">
                  {filter.availableSizes.map(size => (
                    <button
                      key={size}
                      className={`btn-toggle ${params.kernelSize === size ? 'active' : ''}`}
                      onClick={() => onParamChange('kernelSize', size)}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gaussian Sigma Control */}
            {filter?.hasSigmaControl && !isCustomActive && (
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Gaussian Standard Deviation (σ)</span>
                  <span className="value-badge mono">{Number(params.sigma).toFixed(2)}</span>
                </label>
                <input 
                  type="range" 
                  min="0.3" 
                  max="4.0" 
                  step="0.1" 
                  value={params.sigma} 
                  onChange={(e) => onParamChange('sigma', parseFloat(e.target.value))}
                />
                <div className="range-hints">
                  <span>Narrow (Sharp)</span>
                  <span>Default (1.2)</span>
                  <span>Broad (Heavy Blur)</span>
                </div>
              </div>
            )}

            {/* Gradient Component Mode (Magnitude vs Gx vs Gy) */}
            {filter?.hasGradientModes && !isCustomActive && (
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Gradient Operator Component</span>
                  <span className="value-badge mono">{params.gradientMode.toUpperCase()}</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn-toggle ${params.gradientMode === 'magnitude' ? 'active' : ''}`}
                    onClick={() => onParamChange('gradientMode', 'magnitude')}
                  >
                    |G| Magnitude
                  </button>
                  <button
                    className={`btn-toggle ${params.gradientMode === 'gx' ? 'active' : ''}`}
                    onClick={() => onParamChange('gradientMode', 'gx')}
                  >
                    Gx (Vertical Edges)
                  </button>
                  <button
                    className={`btn-toggle ${params.gradientMode === 'gy' ? 'active' : ''}`}
                    onClick={() => onParamChange('gradientMode', 'gy')}
                  >
                    Gy (Horizontal Edges)
                  </button>
                </div>
              </div>
            )}

            {/* Edge Gain Control */}
            {filter?.hasGainControl && !isCustomActive && (
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Edge Contrast / Gradient Gain</span>
                  <span className="value-badge mono">{Number(params.gain).toFixed(1)}×</span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.5" 
                  step="0.1" 
                  value={params.gain} 
                  onChange={(e) => onParamChange('gain', parseFloat(e.target.value))}
                />
              </div>
            )}

            {/* High-Boost Factor k */}
            {filter?.hasBoostControl && !isCustomActive && (
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Boost Multiplier (k)</span>
                  <span className="value-badge mono">
                    k = {Number(params.boostK).toFixed(1)} {params.boostK === 1 ? '(Unsharp)' : '(High-Boost)'}
                  </span>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="4.0" 
                  step="0.1" 
                  value={params.boostK} 
                  onChange={(e) => onParamChange('boostK', parseFloat(e.target.value))}
                />
                <div className="range-hints">
                  <span>k &lt; 1 (Mild)</span>
                  <span>k = 1 (Standard Unsharp)</span>
                  <span>k &gt; 1 (High-Boost)</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FilterControls;
