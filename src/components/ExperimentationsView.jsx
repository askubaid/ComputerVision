import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Layers,
  Sliders,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  Info,
  Maximize2,
  FileText,
  Activity,
  Compass,
  Target
} from 'lucide-react';
import {
  TEST_IMAGES,
  EXPERIMENT_B_DATA,
  EXPERIMENT_C_DATA,
  EXPERIMENT_D_DATA,
  EXPERIMENT_E_DATA
} from '../utils/experimentData';
import {
  loadImageData,
  imageDataToDataUrl,
  executeHarrisPipeline,
  applyPerturbation
} from '../utils/experimentRunner';

export function ExperimentationsView({ onBack }) {
  // Selected Image for Experiments B, C, D, E (defaults to 1.jpg, can toggle to 4.jpg or others)
  const [selectedExpImage, setSelectedExpImage] = useState('1.jpg');

  // Loaded base image data cache for live executions { [id]: ImageData }
  const [loadedImages, setLoadedImages] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});

  // Dynamic live states for each experiment
  const [liveExpA, setLiveExpA] = useState({}); // { [imgId]: result }
  const [liveTau, setLiveTau] = useState(0.01);
  const [liveExpBResult, setLiveExpBResult] = useState(null);
  const [liveSigma, setLiveSigma] = useState(1.5);
  const [liveExpCResult, setLiveExpCResult] = useState(null);
  const [liveNmsRadius, setLiveNmsRadius] = useState(2);
  const [liveExpDResult, setLiveExpDResult] = useState(null);
  const [livePerturbType, setLivePerturbType] = useState('noise');
  const [liveExpEResult, setLiveExpEResult] = useState(null);

  // Load test images into cache on mount
  useEffect(() => {
    TEST_IMAGES.forEach((t) => {
      setLoadingStatus((prev) => ({ ...prev, [t.id]: 'loading' }));
      loadImageData(t.path)
        .then((imgData) => {
          setLoadedImages((prev) => ({ ...prev, [t.id]: imgData }));
          setLoadingStatus((prev) => ({ ...prev, [t.id]: 'ready' }));
        })
        .catch((err) => {
          console.error(`Failed to load ${t.path}`, err);
          setLoadingStatus((prev) => ({ ...prev, [t.id]: 'error' }));
        });
    });
  }, []);

  // Run live for Experiment A single card
  const handleRunLiveA = (imgId) => {
    const srcData = loadedImages[imgId];
    if (!srcData) return;
    setLoadingStatus((p) => ({ ...p, [imgId]: 'running' }));
    setTimeout(() => {
      const res = executeHarrisPipeline(srcData, {
        sigma: 1.2,
        k: 0.04,
        thresholdRatio: 0.01,
        nmsRadius: 2,
        markerStyle: 'target',
        markerColor: 'red'
      });
      const finalUrl = imageDataToDataUrl(res.finalImg);
      setLiveExpA((prev) => ({
        ...prev,
        [imgId]: { ...res, finalUrl }
      }));
      setLoadingStatus((p) => ({ ...p, [imgId]: 'ready' }));
    }, 20);
  };

  // Run live for Experiment B (Custom Threshold)
  const handleRunLiveB = (customTau = liveTau) => {
    const srcData = loadedImages[selectedExpImage];
    if (!srcData) return;
    const res = executeHarrisPipeline(srcData, {
      sigma: 1.2,
      k: 0.04,
      thresholdRatio: customTau,
      nmsRadius: 2,
      markerStyle: 'target',
      markerColor: 'red'
    });
    setLiveExpBResult({
      ...res,
      tau: customTau,
      finalUrl: imageDataToDataUrl(res.finalImg)
    });
  };

  // Run live for Experiment C (Custom Sigma)
  const handleRunLiveC = (customSigma = liveSigma) => {
    const srcData = loadedImages[selectedExpImage];
    if (!srcData) return;
    const rad = Math.ceil(3 * customSigma);
    const winSize = Math.min(19, 2 * rad + 1);
    const res = executeHarrisPipeline(srcData, {
      sigma: customSigma,
      kernelSize: winSize,
      k: 0.04,
      thresholdRatio: 0.01,
      nmsRadius: 2,
      markerStyle: 'target',
      markerColor: 'red'
    });
    setLiveExpCResult({
      ...res,
      sigma: customSigma,
      winSize: `${winSize}x${winSize}`,
      finalUrl: imageDataToDataUrl(res.finalImg)
    });
  };

  // Run live for Experiment D (Custom NMS Radius)
  const handleRunLiveD = (customRadius = liveNmsRadius) => {
    const srcData = loadedImages[selectedExpImage];
    if (!srcData) return;
    const res = executeHarrisPipeline(srcData, {
      sigma: 1.2,
      k: 0.04,
      thresholdRatio: 0.01,
      nmsRadius: customRadius,
      markerStyle: 'target',
      markerColor: 'red'
    });
    setLiveExpDResult({
      ...res,
      nmsRadius: customRadius,
      threshUrl: imageDataToDataUrl(res.thresholdImg),
      finalUrl: imageDataToDataUrl(res.finalImg)
    });
  };

  // Run live for Experiment E (Perturbations)
  const handleRunLiveE = (perturbType = livePerturbType) => {
    const srcData = loadedImages[selectedExpImage];
    if (!srcData) return;
    const perturbedData = applyPerturbation(srcData, perturbType);
    const res = executeHarrisPipeline(perturbedData, {
      sigma: 1.2,
      k: 0.04,
      thresholdRatio: 0.01,
      nmsRadius: 2,
      markerStyle: 'target',
      markerColor: 'red'
    });
    setLiveExpEResult({
      ...res,
      perturbType,
      perturbedUrl: imageDataToDataUrl(perturbedData),
      finalUrl: imageDataToDataUrl(res.finalImg)
    });
  };

  // Auto-run baseline when selected image changes
  useEffect(() => {
    if (loadedImages[selectedExpImage]) {
      handleRunLiveB(liveTau);
      handleRunLiveC(liveSigma);
      handleRunLiveD(liveNmsRadius);
      handleRunLiveE(livePerturbType);
    }
  }, [selectedExpImage, loadedImages]);

  return (
    <div className="experiment-dashboard">
      {/* Top Banner Navigation & Academic Breadcrumb */}
      <div className="experiment-top-bar glass-panel">
        <div className="top-bar-left">
          <button className="btn-back-studio" onClick={onBack} title="Return to interactive Studio Playground">
            <ArrowLeft size={16} />
            <span>Back to Studio Playground</span>
          </button>
          <div className="top-bar-divider"></div>
          <div className="experiment-title-wrap">
            <h2>Experimental Evaluations &amp; Empirical Analysis</h2>
            <p className="experiment-subtitle">
              Comprehensive empirical study of the 5-Stage Harris Corner Detection Pipeline across 5 test images (Experiments A, B, C, D &amp; E)
            </p>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="academic-badge-pill">
            <span>IST Islamabad</span>
            <span className="dot">•</span>
            <span>Ubaid ur Rehman</span>
            <span className="dot">•</span>
            <span>Dr. Benish Amin</span>
          </div>
        </div>
      </div>

      {/* Sticky Quick-Jump Navigation Bar */}
      <div className="experiment-sticky-nav glass-panel">
        <div className="sticky-nav-content">
          <span className="jump-label">Jump to Experiment:</span>
          <div className="jump-buttons">
            <a href="#exp-a" className="jump-pill">A: Image Selection</a>
            <a href="#exp-b" className="jump-pill">B: Detection Threshold</a>
            <a href="#exp-c" className="jump-pill">C: Gaussian Scale (σ)</a>
            <a href="#exp-d" className="jump-pill">D: Non-Maximum Suppression</a>
            <a href="#exp-e" className="jump-pill">E: Robustness &amp; Invariance</a>
          </div>

          <div className="image-selector-wrap">
            <label htmlFor="test-img-select">Active Image (B, C, D, E):</label>
            <select
              id="test-img-select"
              className="select-test-image"
              value={selectedExpImage}
              onChange={(e) => setSelectedExpImage(e.target.value)}
            >
              <option value="1.jpg">1.jpg (Default - Orthogonal Grid)</option>
              <option value="4.jpg">4.jpg (Preferred - Architectural Scene)</option>
              <option value="2.png">2.png (High-Contrast Symmetry)</option>
              <option value="3.jpg">3.jpg (Dense Urban Texture)</option>
              <option value="5.jpg">5.jpg (Deep Shadow Geometry)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Continuous Scrollable Dashboard Body */}
      <div className="experiment-scroll-body">

        {/* ========================================================================= */}
        {/* EXPERIMENT A: IMAGE SELECTION                                             */}
        {/* ========================================================================= */}
        <section id="exp-a" className="experiment-section-card glass-panel">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-badge badge-blue">Experiment A</span>
              <h3>Image Selection &amp; Cross-Scene Feature Distribution</h3>
            </div>
            <span className="benchmark-tag">5 Test Images Evaluated • Grayscale Uniform Execution</span>
          </div>

          <p className="section-desc">
            The Harris corner detection pipeline was evaluated across five diverse photographic and synthetic test images 
            converted to uniform grayscale. Each image tests different spatial gradient profiles, structural orientations, 
            contrast dynamics, and noise thresholds.
          </p>

          <div className="exp-a-cards-grid">
            {TEST_IMAGES.map((img) => {
              const live = liveExpA[img.id];
              const isRunning = loadingStatus[img.id] === 'running';

              return (
                <div key={img.id} className="image-eval-card">
                  <div className="eval-card-header">
                    <div>
                      <h4 className="eval-card-title">{img.name}</h4>
                      <span className="eval-card-category">{img.category}</span>
                    </div>
                    <button
                      className="btn-rerun-card"
                      onClick={() => handleRunLiveA(img.id)}
                      disabled={isRunning || !loadedImages[img.id]}
                      title="Execute full pipeline live on this image"
                    >
                      <RefreshCw size={14} className={isRunning ? 'spin' : ''} />
                      <span>{isRunning ? 'Calculating...' : 'Re-run Live'}</span>
                    </button>
                  </div>

                  {/* Dual Comparison Canvases */}
                  <div className="eval-dual-view">
                    <div className="eval-view-item">
                      <div className="view-header">
                        <span>Original Grayscale</span>
                        <span className="mono dim-badge">{img.width}×{img.height}</span>
                      </div>
                      <div className="eval-img-container">
                        <img src={img.path} alt={`Original ${img.id}`} className="eval-rendered-img" />
                      </div>
                    </div>

                    <div className="eval-view-item">
                      <div className="view-header">
                        <span className="highlight-tag">Harris Detected Corners</span>
                        <span className="mono corners-badge">
                          {live ? live.cornersCount : img.corners} corners
                        </span>
                      </div>
                      <div className="eval-img-container">
                        {live?.finalUrl ? (
                          <img src={live.finalUrl} alt={`Corners ${img.id}`} className="eval-rendered-img" />
                        ) : (
                          <div className="preview-placeholder">
                            <img src={img.path} alt={`Base ${img.id}`} className="eval-rendered-img" />
                            <div className="precomputed-overlay-note">
                              <span>Standard Detection ({img.corners} corners)</span>
                              <button className="btn-small-render" onClick={() => handleRunLiveA(img.id)}>
                                View Live Overlay
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Metric Chips */}
                  <div className="eval-metrics-row">
                    <div className="metric-chip">
                      <span className="chip-label">Dimensions</span>
                      <span className="chip-val mono">{img.width}×{img.height}</span>
                    </div>
                    <div className="metric-chip">
                      <span className="chip-label">Max Response (R_max)</span>
                      <span className="chip-val mono">{img.rMax}</span>
                    </div>
                    <div className="metric-chip">
                      <span className="chip-label">Candidates (Pre-NMS)</span>
                      <span className="chip-val mono">{img.candidates.toLocaleString()}</span>
                    </div>
                    <div className="metric-chip">
                      <span className="chip-label">Final Corners (NMS)</span>
                      <span className="chip-val mono highlight-count">{live ? live.cornersCount : img.corners}</span>
                    </div>
                    <div className="metric-chip">
                      <span className="chip-label">NMS Reduction</span>
                      <span className="chip-val mono">{img.reductionRatio}</span>
                    </div>
                  </div>

                  {/* Written Academic Observations */}
                  <div className="eval-observations-box">
                    <div className="obs-label">
                      <Info size={14} />
                      <strong>Empirical Analysis &amp; Distribution Observations:</strong>
                    </div>
                    <p className="obs-text">{img.observations}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="exp-summary-callout">
            <h4>Summary Insights for Experiment A:</h4>
            <ul>
              <li>
                <strong>Synthetic Symmetry vs. Real Scenes:</strong> Image 2 produces a peak response (1.77e+08) nearly an order 
                of magnitude higher than photographic scenes, resulting in perfect sub-pixel vertex localization.
              </li>
              <li>
                <strong>Texture Complexity:</strong> High-frequency textured scenes (Image 3) generate massive candidate pools 
                (28,558 points) that necessitate careful thresholding to avoid labeling fine micro-textures as primary structural corners.
              </li>
              <li>
                <strong>NMS Efficacy:</strong> Across all 5 scenes, Non-Maximum Suppression consistently eliminates 93.5% to 97.6% 
                of redundant cluster points, proving indispensable for clean feature representation.
              </li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXPERIMENT B: EFFECT OF THE DETECTION THRESHOLD                           */}
        {/* ========================================================================= */}
        <section id="exp-b" className="experiment-section-card glass-panel">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-badge badge-green">Experiment B</span>
              <h3>Effect of the Detection Threshold (Sensitivity Fraction τ)</h3>
            </div>
            <span className="benchmark-tag">Evaluated on {selectedExpImage} • 4 Standard Threshold Levels</span>
          </div>

          <p className="section-desc">
            The detection threshold determines the minimum acceptable cornerness value: 
            <span className="mono"> T = τ · max(0, R_max)</span>. 
            If the peak response <span className="mono">R_max ≤ 0</span>, the algorithm gracefully reports that no positive 
            candidates exist. We analyze the critical trade-off between false positive noise and missed structural corners.
          </p>

          {/* Interactive Live Threshold Explorer */}
          <div className="interactive-control-strip">
            <div className="control-strip-header">
              <div className="strip-title">
                <Sliders size={16} />
                <strong>Live Threshold Slider Explorer:</strong>
              </div>
              <span className="mono active-tau-badge">Current τ = {(liveTau * 100).toFixed(2)}% of R_max</span>
            </div>
            <div className="control-strip-body">
              <input
                type="range"
                min="0.0005"
                max="0.20"
                step="0.0005"
                value={liveTau}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLiveTau(val);
                  handleRunLiveB(val);
                }}
              />
              <div className="range-marks">
                <span>0.05% (Permissive / Noisy)</span>
                <span>1.0% (Standard Canonical)</span>
                <span>5.0% (Strict)</span>
                <span>20.0% (Very Conservative)</span>
              </div>
            </div>

            {liveExpBResult && (
              <div className="live-result-banner">
                <span>Live Detections: <strong>{liveExpBResult.cornersCount} corners</strong> (from {liveExpBResult.candidatesCount} candidate pixels)</span>
                <span>Numerical Threshold: <span className="mono">T = {liveExpBResult.thresholdVal.toExponential(2)}</span></span>
                <span>Calculated in: <span className="mono">{liveExpBResult.runtimeMs} ms</span></span>
              </div>
            )}
          </div>

          {/* 4 Standard Threshold Cards Grid */}
          <div className="exp-b-grid">
            {(EXPERIMENT_B_DATA[selectedExpImage] || EXPERIMENT_B_DATA['1.jpg']).map((item) => (
              <div key={item.tau} className="threshold-card">
                <div className="thresh-card-header">
                  <div>
                    <span className="thresh-tau mono">τ = {item.tauPercent}</span>
                    <span className="thresh-num mono">T = {item.thresholdVal}</span>
                  </div>
                  <span className="thresh-corner-count mono">{item.corners} corners</span>
                </div>

                <div className="thresh-card-metrics">
                  <div className="t-metric">
                    <span className="t-lbl">Candidates:</span>
                    <span className="t-val mono">{item.candidates.toLocaleString()}</span>
                  </div>
                  <div className="t-metric">
                    <span className="t-lbl">Final Corners:</span>
                    <span className="t-val mono bold">{item.corners}</span>
                  </div>
                  <div className="t-metric">
                    <span className="t-lbl">False Positives:</span>
                    <span className="t-val">{item.falsePositives}</span>
                  </div>
                  <div className="t-metric">
                    <span className="t-lbl">Missed Vertices:</span>
                    <span className="t-val">{item.missedCorners}</span>
                  </div>
                </div>

                <div className="thresh-verdict-box">
                  <strong>Evaluation: </strong>
                  <span>{item.verdict}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Academic Table */}
          <div className="academic-table-container">
            <h4>Quantitative Performance Across Threshold Levels ({selectedExpImage})</h4>
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Threshold Fraction (τ)</th>
                  <th>Absolute Cutoff (T)</th>
                  <th>Pre-NMS Candidates</th>
                  <th>Post-NMS Corners</th>
                  <th>False Positive Risk</th>
                  <th>Missed Corner Rate</th>
                  <th>Spatial Distribution</th>
                </tr>
              </thead>
              <tbody>
                {(EXPERIMENT_B_DATA[selectedExpImage] || EXPERIMENT_B_DATA['1.jpg']).map((row) => (
                  <tr key={row.tau}>
                    <td className="mono bold">{row.tauPercent}</td>
                    <td className="mono">{row.thresholdVal}</td>
                    <td className="mono">{row.candidates.toLocaleString()}</td>
                    <td className="mono highlight-count">{row.corners}</td>
                    <td>{row.falsePositives.split(' ')[0]}</td>
                    <td>{row.missedCorners.split(' ')[0]}</td>
                    <td>{row.spatialDistribution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="exp-summary-callout">
            <h4>Academic Discussion &amp; Precision-Recall Analysis:</h4>
            <p>
              The detection threshold exhibits a classic <strong>Precision-Recall trade-off</strong>:
            </p>
            <ul>
              <li>
                <strong>Low Threshold (τ = 0.001):</strong> Maximizes recall (near 100% of physical vertices found), but suffers 
                from severe false positives along strong step edges and high-contrast texture noise.
              </li>
              <li>
                <strong>Canonical Threshold (τ = 0.01):</strong> Represents the optimal operational balance. Linear edge responses 
                (which have negative R) and minor texture variations fall well below T, while true bi-directional vertices pass 
                cleanly with high localization fidelity.
              </li>
              <li>
                <strong>High Threshold (τ ≥ 0.05):</strong> Yields 100% precision (zero false positives), but false negatives surge, 
                discarding over 50% to 80% of subtle, lower-contrast corners.
              </li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXPERIMENT C: EFFECT OF GAUSSIAN SMOOTHING                                */}
        {/* ========================================================================= */}
        <section id="exp-c" className="experiment-section-card glass-panel">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-badge badge-amber">Experiment C</span>
              <h3>Effect of Gaussian Smoothing (Scale Parameter σ)</h3>
            </div>
            <span className="benchmark-tag">Scale-Space Evaluation • σ = 0.8, 1.5, 2.8</span>
          </div>

          <p className="section-desc">
            In the structure tensor <span className="mono">M = g(σ) ∗ [Ix² IxIy; IxIy Iy²]</span>, the Gaussian smoothing 
            scale <span className="mono">σ</span> defines the integration window over which local derivative energy is averaged. 
            We examine the trade-off between suppressing high-frequency sensor noise and the adverse effects of corner merging 
            and detail elimination.
          </p>

          {/* 3 Gaussian Scales Cards */}
          <div className="exp-c-grid">
            {(EXPERIMENT_C_DATA[selectedExpImage] || EXPERIMENT_C_DATA['1.jpg']).map((item) => (
              <div key={item.sigma} className="sigma-card">
                <div className="sigma-card-header">
                  <div>
                    <span className="sigma-val mono">Scale σ = {item.sigma}</span>
                    <span className="sigma-win mono">Window: {item.window}</span>
                  </div>
                  <span className="sigma-corners mono">{item.corners} corners</span>
                </div>

                <div className="sigma-metrics-list">
                  <div className="s-metric">
                    <span className="s-lbl">Peak Response (R_max):</span>
                    <span className="s-val mono">{item.rMax}</span>
                  </div>
                  <div className="s-metric">
                    <span className="s-lbl">Candidate Basin Pixels:</span>
                    <span className="s-val mono">{item.candidates.toLocaleString()}</span>
                  </div>
                  <div className="s-metric">
                    <span className="s-lbl">Localization Precision:</span>
                    <span className="s-val">{item.localization}</span>
                  </div>
                  <div className="s-metric">
                    <span className="s-lbl">Corner Merging Severity:</span>
                    <span className="s-val">{item.cornerMerging}</span>
                  </div>
                </div>

                <div className="sigma-analysis-box">
                  <strong>Scale-Space Analysis: </strong>
                  <p>{item.analysis}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="exp-summary-callout">
            <h4>Theoretical Discussion: Why Excessive Smoothing Causes Corner Merging</h4>
            <ul>
              <li>
                <strong>Spatial Gradient Blurring:</strong> The structure tensor averages gradients over a spatial neighborhood 
                proportional to <span className="mono">3σ</span>. When two adjacent corners lie closer than this neighborhood, 
                their opposing directional derivatives mix within the auto-correlation window.
              </li>
              <li>
                <strong>Centroid Displacement:</strong> As the Gaussian window widens (σ = 2.8, window 19×19), individual 
                curvature extrema coalesce into a single broader response basin. The local maximum shifts away from the true 
                physical vertex toward the geometric centroid of the merged features.
              </li>
              <li>
                <strong>Detail Elimination:</strong> On Image 4, increasing σ from 0.8 to 2.8 causes detected corners to drop from 
                <strong> 482 down to 228 (a 52.7% attrition rate)</strong>. Fine architectural details, mullions, and acute vertices 
                are completely smoothed out before auto-correlation can register them.
              </li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXPERIMENT D: EFFECT OF NON-MAXIMUM SUPPRESSION (NMS)                     */}
        {/* ========================================================================= */}
        <section id="exp-d" className="experiment-section-card glass-panel">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-badge badge-purple">Experiment D</span>
              <h3>Effect of Non-Maximum Suppression (NMS Redundancy Thinning)</h3>
            </div>
            <span className="benchmark-tag">Direct Direct Comparison: Thresholding Alone vs. NMS</span>
          </div>

          <p className="section-desc">
            Raw thresholding selects all pixels where <span className="mono">R(x,y) ≥ T</span>, producing multi-pixel clusters 
            around every corner vertex. Non-Maximum Suppression (NMS) thins candidate clusters down to strict, isolated 
            single-pixel local maxima within an integration neighborhood radius.
          </p>

          {/* Quantitative Comparison Highlight Banner */}
          {(() => {
            const dData = EXPERIMENT_D_DATA[selectedExpImage] || EXPERIMENT_D_DATA['1.jpg'];
            return (
              <div className="nms-highlight-stats">
                <div className="stat-card">
                  <span className="stat-num mono">{dData.candidatesBeforeNMS.toLocaleString()}</span>
                  <span className="stat-lbl">Candidates Before NMS</span>
                  <span className="stat-sub">Dense Multi-Pixel Clusters</span>
                </div>
                <div className="stat-arrow">➔</div>
                <div className="stat-card">
                  <span className="stat-num mono highlight-count">{dData.cornersAfterNMS}</span>
                  <span className="stat-lbl">Final Corners After NMS</span>
                  <span className="stat-sub">Single-Pixel Local Maxima</span>
                </div>
                <div className="stat-card success-card">
                  <span className="stat-num mono">{dData.reductionRatio}</span>
                  <span className="stat-lbl">Redundant Points Removed</span>
                  <span className="stat-sub">{dData.redundantPointsRemoved.toLocaleString()} redundant pixels suppressed</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num mono">{dData.avgClusterSize}</span>
                  <span className="stat-lbl">Average Cluster Size</span>
                  <span className="stat-sub">Thinned to 1.0 px / corner</span>
                </div>
              </div>
            );
          })()}

          {/* Side-by-Side Visual Comparison Cards */}
          <div className="nms-visual-comparison">
            <div className="nms-col">
              <div className="nms-col-header before-header">
                <strong>1. Detections by Thresholding Alone (No NMS)</strong>
                <span className="badge-cluster">Clustered Blobs</span>
              </div>
              <div className="nms-canvas-wrap">
                {liveExpDResult?.threshUrl ? (
                  <img src={liveExpDResult.threshUrl} alt="Thresholding Alone" className="eval-rendered-img" />
                ) : (
                  <div className="placeholder-nms-box">
                    <img src={TEST_IMAGES.find(t => t.id === selectedExpImage)?.path || './testImages/1.jpg'} alt="Original" className="eval-rendered-img dimmed" />
                    <div className="cluster-simulated-note">
                      <span className="cluster-tag-text">Dense Raw Clusters (Yellow Blobs)</span>
                      <p>Multiple adjacent pixels pass R ≥ T around every vertex</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="nms-col-desc">
                <strong>Characteristics:</strong> Continuous high responses around true corners form dense candidate blobs. 
                Individual corners cannot be matched or tracked because coordinates lack unique local peak definitions.
              </div>
            </div>

            <div className="nms-col">
              <div className="nms-col-header after-header">
                <strong>2. Detections After Non-Maximum Suppression (NMS)</strong>
                <span className="badge-single">Discrete Single Pixels</span>
              </div>
              <div className="nms-canvas-wrap">
                {liveExpDResult?.finalUrl ? (
                  <img src={liveExpDResult.finalUrl} alt="After NMS" className="eval-rendered-img" />
                ) : (
                  <div className="placeholder-nms-box">
                    <img src={TEST_IMAGES.find(t => t.id === selectedExpImage)?.path || './testImages/1.jpg'} alt="Original" className="eval-rendered-img" />
                    <div className="cluster-simulated-note">
                      <span className="cluster-tag-text success">Thinned Keypoints (Target Reticles)</span>
                      <p>Single highest-response peak retained per neighborhood</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="nms-col-desc">
                <strong>Characteristics:</strong> Suppresses all candidate points that are not the strict maximum within 
                their local neighborhood window, producing clean, isolated coordinates ready for feature descriptors.
              </div>
            </div>
          </div>

          <div className="exp-summary-callout">
            <h4>Why Non-Maximum Suppression is Crucial for Downstream Tasks:</h4>
            <ul>
              <li>
                <strong>Prevents Degenerate Matching:</strong> In feature tracking, optical flow, and homography estimation (RANSAC), 
                having 20 adjacent points for a single corner creates degenerate linear equations and duplicate matches.
              </li>
              <li>
                <strong>Optimal Sub-Pixel Localization:</strong> NMS isolates the exact summit of the quadratic auto-correlation 
                basin, giving the highest geometric stability across frames.
              </li>
            </ul>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXPERIMENT E: ROBUSTNESS & INVARIANCE ANALYSIS                            */}
        {/* ========================================================================= */}
        <section id="exp-e" className="experiment-section-card glass-panel">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-badge badge-rose">Experiment E</span>
              <h3>Robustness Analysis (Noise, Illumination, and Geometric Perturbations)</h3>
            </div>
            <span className="benchmark-tag">Tested on {selectedExpImage} • 3 Perturbed Variants vs. Baseline</span>
          </div>

          <p className="section-desc">
            To evaluate practical robustness, we subjected the test image to three distinct real-world distortions: 
            (1) Additive Gaussian sensor noise, (2) Photometric brightness/contrast scaling, and (3) In-plane geometric rotation. 
            The detector was run with identical parameters across all variants to assess consistency.
          </p>

          {/* 4 Variant Cards Grid */}
          <div className="exp-e-grid">
            {(EXPERIMENT_E_DATA[selectedExpImage] || EXPERIMENT_E_DATA['1.jpg']).map((variant) => (
              <div key={variant.variantId} className="variant-card">
                <div className="variant-card-header">
                  <div>
                    <h4 className="variant-name">{variant.name}</h4>
                    <span className="variant-pert mono">{variant.perturbation}</span>
                  </div>
                  <span className="variant-repeat mono">{variant.repeatability}</span>
                </div>

                <div className="variant-metrics-strip">
                  <div className="v-metric">
                    <span className="v-lbl">Corners Detected:</span>
                    <span className="v-val mono bold">{variant.corners}</span>
                  </div>
                  <div className="v-metric">
                    <span className="v-lbl">Mean Coordinate Shift:</span>
                    <span className="v-val mono">{variant.meanDisplacement}</span>
                  </div>
                  <div className="v-metric">
                    <span className="v-lbl">Max Response:</span>
                    <span className="v-val mono">{variant.rMax}</span>
                  </div>
                </div>

                <div className="variant-analysis-text">
                  <strong>Empirical Behavior: </strong>
                  <p>{variant.analysis}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Invariance Discussion Box */}
          <div className="exp-summary-callout">
            <h4>Fundamental Mathematical Discussion: Invariances and Limitations</h4>
            <div className="invariance-columns">
              <div className="inv-col">
                <h5>1. Rotation Invariance (Strong)</h5>
                <p>
                  The Harris corner response is <strong>strictly rotation-invariant</strong>. The structure tensor matrix 
                  <span className="mono"> M</span> transforms under an image rotation <span className="mono">R_θ</span> as 
                  <span className="mono"> M' = R_θ · M · R_θᵀ</span>. Because determinant and trace are algebraic invariants 
                  under orthogonal transformations:
                  <br />
                  <span className="mono">det(M') = det(M)</span> and <span className="mono">trace(M') = trace(M)</span>.
                  <br />
                  Consequently, corner locations rotate with the image. Minor differences (mean shift 0.65px) arise purely from 
                  discrete pixel grid resampling and bilinear interpolation.
                </p>
              </div>

              <div className="inv-col">
                <h5>2. Photometric / Contrast Invariance (Strong)</h5>
                <p>
                  A uniform brightness change <span className="mono">I' = I + β</span> is completely cancelled by spatial differentiation 
                  (<span className="mono">∂(I + β)/∂x = ∂I/∂x</span>), resulting in zero response change.
                  <br />
                  A contrast scale <span className="mono">I' = α · I</span> scales gradients by <span className="mono">α</span> and 
                  the response by <span className="mono">α⁴</span>. However, because our detection threshold is adaptive 
                  (<span className="mono">T = τ · R_max</span>), the scale factor cancels out:
                  <span className="mono"> T' = τ · (α⁴ · R_max) = α⁴ · T</span>, retaining <strong>99.1% of corners</strong>!
                </p>
              </div>

              <div className="inv-col">
                <h5>3. Scale Invariance (Limitation)</h5>
                <p>
                  The classic Harris detector is <strong>NOT scale-invariant</strong>. The Gaussian window scale <span className="mono">σ</span> 
                  is fixed in pixel units. If an image is magnified, a sharp corner spreads out and its curvature within a fixed window 
                  resembles an edge. Conversely, downsampling sharpens smooth curves into apparent corners. 
                  This fundamental limitation motivated the development of scale-adapted detectors such as Harris-Laplace and SIFT.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Attribution */}
      <footer className="experiment-footer glass-panel">
        <div className="footer-content">
          <p>
            <strong>Computer Vision Playground — Experimental Evaluation Report</strong>
            <br />
            Developed by <strong>Ubaid ur Rehman</strong> (MS Scholar) | Supervised by <strong>Dr. Benish Amin</strong>
            <br />
            Institute of Space Technology (IST), Islamabad, Pakistan
          </p>
          <button className="btn-back-studio-footer" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Return to Studio Playground</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ExperimentationsView;
