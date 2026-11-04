import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HelpCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Activity, 
  Target, 
  Zap, 
  Cpu, 
  Waves, 
  Sparkles,
  Maximize2,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { 
  computeGradients, 
  computeStructureTensor, 
  computeHarrisResponse, 
  applyHarrisThreshold, 
  applyNMS 
} from '../utils/harrisPipelineEngine';
import { HarrisQuestionModal } from './HarrisQuestionModal';

export function HarrisPipelineView({
  originalImageData,
  onImageUpload,
  onReset
}) {
  const fileInputRef = useRef(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuestionId, setModalQuestionId] = useState('q1');

  const openQuestion = (qId) => {
    setModalQuestionId(qId);
    setModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Pipeline Parameters State
  // ---------------------------------------------------------------------------
  // Stage 1: Gradients
  const [gradOperator, setGradOperator] = useState('sobel'); // 'sobel' | 'differences'
  const [gradViewMode, setGradViewMode] = useState('mag');    // 'mag' | 'ix' | 'iy'

  // Stage 2: Structure Tensor
  const [tensorKernelSize, setTensorKernelSize] = useState(5);
  const [tensorSigma, setTensorSigma] = useState(1.4);
  const [tensorViewMode, setTensorViewMode] = useState('composite'); // 'composite' | 'ixx' | 'iyy' | 'ixy'

  // Stage 3: Harris Response
  const [harrisK, setHarrisK] = useState(0.04);
  const [responseViewMode, setResponseViewMode] = useState('heatmap'); // 'heatmap' | 'cornerness'

  // Stage 4: Thresholding
  const [thresholdRatio, setThresholdRatio] = useState(0.05); // 5% of maxR
  const [thresholdBgMode, setThresholdBgMode] = useState('overlay'); // 'overlay' | 'black' | 'white'
  const [thresholdColor, setThresholdColor] = useState('gold');

  // Stage 5: NMS & Final Corners
  const [nmsRadius, setNmsRadius] = useState(3); // 3 = 7x7 window
  const [markerStyle, setMarkerStyle] = useState('target'); // 'point' | 'target' | 'cross' | 'dot'
  const [markerColor, setMarkerColor] = useState('red');
  const [finalBgMode, setFinalBgMode] = useState('overlay'); // 'overlay' | 'black' | 'white'

  // ---------------------------------------------------------------------------
  // Canvas Refs for Each Stage
  // ---------------------------------------------------------------------------
  const canvasStage1Ref = useRef(null);
  const canvasStage2Ref = useRef(null);
  const canvasStage3Ref = useRef(null);
  const canvasStage4Ref = useRef(null);
  const canvasStage5Ref = useRef(null);

  // ---------------------------------------------------------------------------
  // Pipeline Calculation (Memoized for high performance)
  // ---------------------------------------------------------------------------
  const stage1Data = useMemo(() => {
    if (!originalImageData) return null;
    return computeGradients(originalImageData, gradOperator);
  }, [originalImageData, gradOperator]);

  const stage2Data = useMemo(() => {
    if (!stage1Data) return null;
    return computeStructureTensor(
      stage1Data.ix,
      stage1Data.iy,
      stage1Data.width,
      stage1Data.height,
      tensorKernelSize,
      tensorSigma
    );
  }, [stage1Data, tensorKernelSize, tensorSigma]);

  const stage3Data = useMemo(() => {
    if (!stage2Data || !stage1Data) return null;
    return computeHarrisResponse(
      stage2Data.sIxx,
      stage2Data.sIyy,
      stage2Data.sIxy,
      stage1Data.width,
      stage1Data.height,
      harrisK
    );
  }, [stage2Data, stage1Data, harrisK]);

  const stage4Data = useMemo(() => {
    if (!stage3Data || !originalImageData) return null;
    return applyHarrisThreshold(
      stage3Data.rMap,
      stage3Data.maxR,
      originalImageData.width,
      originalImageData.height,
      originalImageData,
      thresholdRatio,
      thresholdBgMode,
      thresholdColor
    );
  }, [stage3Data, originalImageData, thresholdRatio, thresholdBgMode, thresholdColor]);

  const stage5Data = useMemo(() => {
    if (!stage4Data || !stage3Data || !originalImageData) return null;
    return applyNMS(
      stage3Data.rMap,
      stage4Data.candidatePoints,
      originalImageData.width,
      originalImageData.height,
      originalImageData,
      nmsRadius,
      markerStyle,
      markerColor,
      finalBgMode
    );
  }, [stage4Data, stage3Data, originalImageData, nmsRadius, markerStyle, markerColor, finalBgMode]);

  // ---------------------------------------------------------------------------
  // Canvas Rendering Effects
  // ---------------------------------------------------------------------------
  // Draw Stage 1
  useEffect(() => {
    if (!stage1Data || !canvasStage1Ref.current) return;
    const canvas = canvasStage1Ref.current;
    canvas.width = stage1Data.width;
    canvas.height = stage1Data.height;
    const ctx = canvas.getContext('2d');
    const imgData = gradViewMode === 'ix' 
      ? stage1Data.ixImg 
      : gradViewMode === 'iy' 
      ? stage1Data.iyImg 
      : stage1Data.magImg;
    ctx.putImageData(imgData, 0, 0);
  }, [stage1Data, gradViewMode]);

  // Draw Stage 2
  useEffect(() => {
    if (!stage2Data || !stage1Data || !canvasStage2Ref.current) return;
    const canvas = canvasStage2Ref.current;
    canvas.width = stage1Data.width;
    canvas.height = stage1Data.height;
    const ctx = canvas.getContext('2d');
    const imgData = tensorViewMode === 'ixx' 
      ? stage2Data.ixxImg 
      : tensorViewMode === 'iyy' 
      ? stage2Data.iyyImg 
      : tensorViewMode === 'ixy' 
      ? stage2Data.ixyImg 
      : stage2Data.compositeImg;
    ctx.putImageData(imgData, 0, 0);
  }, [stage2Data, stage1Data, tensorViewMode]);

  // Draw Stage 3
  useEffect(() => {
    if (!stage3Data || !stage1Data || !canvasStage3Ref.current) return;
    const canvas = canvasStage3Ref.current;
    canvas.width = stage1Data.width;
    canvas.height = stage1Data.height;
    const ctx = canvas.getContext('2d');
    const imgData = responseViewMode === 'heatmap' 
      ? stage3Data.heatmapImg 
      : stage3Data.cornernessImg;
    ctx.putImageData(imgData, 0, 0);
  }, [stage3Data, stage1Data, responseViewMode]);

  // Draw Stage 4
  useEffect(() => {
    if (!stage4Data || !originalImageData || !canvasStage4Ref.current) return;
    const canvas = canvasStage4Ref.current;
    canvas.width = originalImageData.width;
    canvas.height = originalImageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(stage4Data.thresholdImg, 0, 0);
  }, [stage4Data, originalImageData]);

  // Draw Stage 5
  useEffect(() => {
    if (!stage5Data || !originalImageData || !canvasStage5Ref.current) return;
    const canvas = canvasStage5Ref.current;
    canvas.width = originalImageData.width;
    canvas.height = originalImageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(stage5Data.finalImg, 0, 0);
  }, [stage5Data, originalImageData]);

  // ---------------------------------------------------------------------------
  // Stage Export Handlers
  // ---------------------------------------------------------------------------
  const handleExportCanvas = (canvasRef, filename) => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = filename;
    a.click();
  };

  const handleExportCoordinates = () => {
    if (!stage5Data?.finalCorners) return;
    const rows = ['index,x,y,harris_response'];
    stage5Data.finalCorners.forEach((c, idx) => {
      rows.push(`${idx + 1},${c.x},${c.y},${c.r.toFixed(4)}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harris_corners_coordinates_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset all stages to baseline parameters
  const handleResetAll = () => {
    setGradOperator('sobel');
    setGradViewMode('mag');
    setTensorKernelSize(5);
    setTensorSigma(1.4);
    setTensorViewMode('composite');
    setHarrisK(0.04);
    setResponseViewMode('heatmap');
    setThresholdRatio(0.05);
    setThresholdBgMode('overlay');
    setThresholdColor('gold');
    setNmsRadius(3);
    setMarkerStyle('target');
    setMarkerColor('red');
    setFinalBgMode('overlay');
    if (onReset) onReset();
  };

  return (
    <div className="harris-pipeline-container">
      {/* Top Banner Toolbar */}
      <header className="harris-pipeline-header glass-panel">
        <div className="harris-header-left">
          <div className="harris-header-title-wrap">
            <Target size={22} className="harris-header-icon" />
            <div>
              <h3>Harris Corner Detection Pipeline</h3>
              <p>5-Stage Mathematical Pipeline: Gradients → Structure Tensor → Response → Threshold → NMS</p>
            </div>
          </div>
        </div>

        <div className="harris-header-right">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => onImageUpload(event.target.result);
                reader.readAsDataURL(file);
              }
            }}
          />

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload an image to process through the Harris pipeline"
          >
            <Upload size={14} />
            <span>Upload Picture</span>
          </button>

          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleResetAll}
            title="Reset all pipeline parameters to defaults"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          {originalImageData && (
            <div className="dimension-pill mono">
              <Maximize2 size={12} />
              <span>{originalImageData.width} x {originalImageData.height}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Scrollable Content with 5 Distinct Stage Sections */}
      <div className="harris-pipeline-scroll-body">
        {/* ================================================================= */}
        {/* STAGE 1: IMAGE GRADIENTS (Ix & Iy)                                */}
        {/* ================================================================= */}
        <section className="pipeline-stage-card glass-panel" id="stage-1">
          <div className="stage-card-header">
            <div className="stage-badge-title">
              <span className="stage-number-badge">Stage 1</span>
              <div>
                <h4>Task 1: Understand Image Gradients (I_x &amp; I_y)</h4>
                <p>Calculate horizontal and vertical spatial intensity derivatives</p>
              </div>
            </div>

            <div className="stage-header-actions">
              {/* Question Help Button */}
              <button 
                className="btn-help-circle" 
                onClick={() => openQuestion('q1')}
                title="Explain in a side popup guide, the meaning of I_x and I_y"
              >
                <HelpCircle size={17} />
                <span>Explain I_x &amp; I_y</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCanvas(canvasStage1Ref, `harris_stage1_gradient_${gradViewMode}.png`)}
                disabled={!stage1Data}
              >
                <Download size={13} />
                <span>Export Gradient</span>
              </button>
            </div>
          </div>

          <div className="stage-body-grid">
            {/* Visualizer Canvas */}
            <div className="stage-canvas-wrapper">
              <canvas ref={canvasStage1Ref} className="stage-canvas" style={{ display: stage1Data ? 'block' : 'none' }} />
              {!stage1Data ? (
                <div className="stage-empty-hint">
                  <Upload size={24} />
                  <span>Upload a picture above to compute gradients</span>
                </div>
              ) : (
                <div className="canvas-overlay-tag">
                  {gradViewMode === 'ix' 
                    ? 'Horizontal Gradient (Ix)' 
                    : gradViewMode === 'iy' 
                    ? 'Vertical Gradient (Iy)' 
                    : 'Gradient Magnitude (|∇I|)'}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="stage-controls-panel">
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Gradient Operator</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn-toggle ${gradOperator === 'sobel' ? 'active' : ''}`}
                    onClick={() => setGradOperator('sobel')}
                  >
                    Sobel 3×3 (Smoothed)
                  </button>
                  <button
                    className={`btn-toggle ${gradOperator === 'differences' ? 'active' : ''}`}
                    onClick={() => setGradOperator('differences')}
                  >
                    Finite Differences [-1, 0, 1]
                  </button>
                </div>
              </div>

              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Visualized Component</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn-toggle ${gradViewMode === 'mag' ? 'active' : ''}`}
                    onClick={() => setGradViewMode('mag')}
                  >
                    Magnitude |∇I|
                  </button>
                  <button
                    className={`btn-toggle ${gradViewMode === 'ix' ? 'active' : ''}`}
                    onClick={() => setGradViewMode('ix')}
                  >
                    Ix (Horizontal)
                  </button>
                  <button
                    className={`btn-toggle ${gradViewMode === 'iy' ? 'active' : ''}`}
                    onClick={() => setGradViewMode('iy')}
                  >
                    Iy (Vertical)
                  </button>
                </div>
              </div>

              <div className="stage-math-pill">
                <code>I_x = ∂I/∂x, &nbsp; I_y = ∂I/∂y, &nbsp; |∇I| = √(I_x² + I_y²)</code>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* STAGE 2: STRUCTURE TENSOR (Second-Moment Matrix)                 */}
        {/* ================================================================= */}
        <section className="pipeline-stage-card glass-panel" id="stage-2">
          <div className="stage-card-header">
            <div className="stage-badge-title">
              <span className="stage-number-badge">Stage 2</span>
              <div>
                <h4>Task 2: Construct the Structure Tensor (Second-Moment Matrix)</h4>
                <p>Compute gradient outer products (Ix², Iy², IxIy) and smooth via Gaussian window</p>
              </div>
            </div>

            <div className="stage-header-actions">
              <button 
                className="btn-help-circle" 
                onClick={() => openQuestion('q2')}
                title="Explain why gradient products are smoothed & how the structure tensor describes local variation"
              >
                <HelpCircle size={17} />
                <span>Explain Structure Tensor</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCanvas(canvasStage2Ref, `harris_stage2_tensor_${tensorViewMode}.png`)}
                disabled={!stage2Data}
              >
                <Download size={13} />
                <span>Export Tensor</span>
              </button>
            </div>
          </div>

          <div className="stage-body-grid">
            <div className="stage-canvas-wrapper">
              <canvas ref={canvasStage2Ref} className="stage-canvas" style={{ display: stage2Data ? 'block' : 'none' }} />
              {!stage2Data ? (
                <div className="stage-empty-hint">
                  <Upload size={24} />
                  <span>Upload a picture above to compute tensor</span>
                </div>
              ) : (
                <div className="canvas-overlay-tag">
                  {tensorViewMode === 'composite'
                    ? 'RGB Tensor (R=Ixx, G=Iyy, B=|Ixy|)'
                    : tensorViewMode === 'ixx'
                    ? 'Smoothed ⟨Ixx⟩'
                    : tensorViewMode === 'iyy'
                    ? 'Smoothed ⟨Iyy⟩'
                    : 'Cross Component ⟨Ixy⟩'}
                </div>
              )}
            </div>

            <div className="stage-controls-panel">
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Tensor Map Component</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn-toggle ${tensorViewMode === 'composite' ? 'active' : ''}`}
                    onClick={() => setTensorViewMode('composite')}
                  >
                    RGB Composite
                  </button>
                  <button
                    className={`btn-toggle ${tensorViewMode === 'ixx' ? 'active' : ''}`}
                    onClick={() => setTensorViewMode('ixx')}
                  >
                    ⟨Ixx⟩
                  </button>
                  <button
                    className={`btn-toggle ${tensorViewMode === 'iyy' ? 'active' : ''}`}
                    onClick={() => setTensorViewMode('iyy')}
                  >
                    ⟨Iyy⟩
                  </button>
                  <button
                    className={`btn-toggle ${tensorViewMode === 'ixy' ? 'active' : ''}`}
                    onClick={() => setTensorViewMode('ixy')}
                  >
                    ⟨Ixy⟩
                  </button>
                </div>
              </div>

              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Gaussian Neighborhood Window</span>
                  <span className="value-badge mono">{tensorKernelSize}×{tensorKernelSize}</span>
                </label>
                <div className="btn-group">
                  {[3, 5, 7, 9].map(sz => (
                    <button
                      key={sz}
                      className={`btn-toggle ${tensorKernelSize === sz ? 'active' : ''}`}
                      onClick={() => setTensorKernelSize(sz)}
                    >
                      {sz}×{sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Gaussian Standard Deviation (σ)</span>
                  <span className="value-badge mono">σ = {tensorSigma.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="3.0"
                  step="0.1"
                  value={tensorSigma}
                  onChange={(e) => setTensorSigma(parseFloat(e.target.value))}
                />
              </div>

              <div className="stage-math-pill">
                <code>M = ∑ w(u,v) [ I_x² &nbsp; I_x·I_y ; I_x·I_y &nbsp; I_y² ]</code>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* STAGE 3: COMPUTE THE HARRIS RESPONSE (R)                          */}
        {/* ================================================================= */}
        <section className="pipeline-stage-card glass-panel" id="stage-3">
          <div className="stage-card-header">
            <div className="stage-badge-title">
              <span className="stage-number-badge">Stage 3</span>
              <div>
                <h4>Task 3: Compute the Harris Response Map (R)</h4>
                <p>Calculate determinant and trace: R = det(M) - k · (trace(M))²</p>
              </div>
            </div>

            <div className="stage-header-actions">
              <button 
                className="btn-help-circle" 
                onClick={() => openQuestion('q3')}
                title="Explain why the determinant alone is insufficient to distinguish corners from edges"
              >
                <HelpCircle size={17} />
                <span>Explain Response Formula</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCanvas(canvasStage3Ref, `harris_stage3_response_${responseViewMode}.png`)}
                disabled={!stage3Data}
              >
                <Download size={13} />
                <span>Export Response Map</span>
              </button>
            </div>
          </div>

          <div className="stage-body-grid">
            <div className="stage-canvas-wrapper">
              <canvas ref={canvasStage3Ref} className="stage-canvas" style={{ display: stage3Data ? 'block' : 'none' }} />
              {!stage3Data ? (
                <div className="stage-empty-hint">
                  <Upload size={24} />
                  <span>Upload a picture above to compute response</span>
                </div>
              ) : (
                <>
                  <div className="canvas-overlay-tag">
                    {responseViewMode === 'heatmap' ? 'Classification Heatmap' : 'Cornerness Intensity'}
                  </div>
                  <div className="response-heatmap-legend">
                    <span className="legend-item"><span className="legend-color gold"></span> R &gt; 0 Corner</span>
                    <span className="legend-item"><span className="legend-color blue"></span> R &lt; 0 Edge</span>
                    <span className="legend-item"><span className="legend-color dark"></span> R ≈ 0 Flat</span>
                  </div>
                </>
              )}
            </div>

            <div className="stage-controls-panel">
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Response Visualization Mode</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn-toggle ${responseViewMode === 'heatmap' ? 'active' : ''}`}
                    onClick={() => setResponseViewMode('heatmap')}
                  >
                    Classification Heatmap
                  </button>
                  <button
                    className={`btn-toggle ${responseViewMode === 'cornerness' ? 'active' : ''}`}
                    onClick={() => setResponseViewMode('cornerness')}
                  >
                    Cornerness (R &gt; 0)
                  </button>
                </div>
              </div>

              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Harris Constant (k)</span>
                  <span className="value-badge mono">k = {harrisK.toFixed(3)}</span>
                </label>
                <input
                  type="range"
                  min="0.02"
                  max="0.08"
                  step="0.005"
                  value={harrisK}
                  onChange={(e) => setHarrisK(parseFloat(e.target.value))}
                />
                <div className="range-hints">
                  <span>0.02 (Sharp Corners)</span>
                  <span>0.04 (Standard)</span>
                  <span>0.08 (Strict)</span>
                </div>
              </div>

              {stage3Data && (
                <div className="stat-boxes-row">
                  <div className="stat-box">
                    <span className="stat-label">Max Corner Response (R &gt; 0)</span>
                    <span className="stat-value mono">+{stage3Data.maxR.toExponential(2)}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Min Edge Response (R &lt; 0)</span>
                    <span className="stat-value mono">{stage3Data.minR.toExponential(2)}</span>
                  </div>
                </div>
              )}

              <div className="stage-math-pill">
                <code>R = det(M) - k·(trace(M))² = λ₁λ₂ - k·(λ₁ + λ₂)²</code>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* STAGE 4: THRESHOLDING (CANDIDATE CORNER CLUSTERS)                 */}
        {/* ================================================================= */}
        <section className="pipeline-stage-card glass-panel" id="stage-4">
          <div className="stage-card-header">
            <div className="stage-badge-title">
              <span className="stage-number-badge">Stage 4</span>
              <div>
                <h4>Task 4 (Part A): Response Thresholding (Candidate Clusters)</h4>
                <p>Filter candidates with R(x,y) &gt; Threshold (Illustrates cluster formation before NMS)</p>
              </div>
            </div>

            <div className="stage-header-actions">
              <button 
                className="btn-help-circle" 
                onClick={() => openQuestion('q4')}
                title="Explain why thresholding alone produces clusters of detections around a single physical corner"
              >
                <HelpCircle size={17} />
                <span>Explain Clustering</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCanvas(canvasStage4Ref, `harris_stage4_clusters_${thresholdBgMode}.png`)}
                disabled={!stage4Data}
              >
                <Download size={13} />
                <span>Export Clusters</span>
              </button>
            </div>
          </div>

          <div className="stage-body-grid">
            <div className="stage-canvas-wrapper">
              <canvas ref={canvasStage4Ref} className="stage-canvas" style={{ display: stage4Data ? 'block' : 'none' }} />
              {!stage4Data ? (
                <div className="stage-empty-hint">
                  <Upload size={24} />
                  <span>Upload a picture above to compute candidate clusters</span>
                </div>
              ) : (
                <div className="canvas-overlay-tag">
                  Thresholded Candidates: {stage4Data?.candidateCount.toLocaleString() || 0} pixels
                </div>
              )}
            </div>

            <div className="stage-controls-panel">
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Threshold Sensitivity (% of Max R)</span>
                  <span className="value-badge mono">{(thresholdRatio * 100).toFixed(1)}%</span>
                </label>
                <input
                  type="range"
                  min="0.005"
                  max="0.25"
                  step="0.005"
                  value={thresholdRatio}
                  onChange={(e) => setThresholdRatio(parseFloat(e.target.value))}
                />
                <div className="range-hints">
                  <span>Sensitive (Low T)</span>
                  <span>5% (Default)</span>
                  <span>Strict (High T)</span>
                </div>
              </div>

              {/* Radio buttons for Canvas background */}
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Canvas Background</span>
                </label>
                <div className="radio-group-container">
                  <label className={`radio-item-label ${thresholdBgMode === 'overlay' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="thresholdBg"
                      value="overlay"
                      checked={thresholdBgMode === 'overlay'}
                      onChange={() => setThresholdBgMode('overlay')}
                    />
                    <div className="radio-text">
                      <span className="radio-title">Overlay on Image</span>
                    </div>
                  </label>
                  <label className={`radio-item-label ${thresholdBgMode === 'black' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="thresholdBg"
                      value="black"
                      checked={thresholdBgMode === 'black'}
                      onChange={() => setThresholdBgMode('black')}
                    />
                    <div className="radio-text">
                      <span className="radio-title">Black Canvas</span>
                    </div>
                  </label>
                  <label className={`radio-item-label ${thresholdBgMode === 'white' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="thresholdBg"
                      value="white"
                      checked={thresholdBgMode === 'white'}
                      onChange={() => setThresholdBgMode('white')}
                    />
                    <div className="radio-text">
                      <span className="radio-title">White Canvas</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="stat-box highlight-stat">
                <span className="stat-label">Cluster Pixels Before NMS</span>
                <span className="stat-value mono">{stage4Data?.candidateCount.toLocaleString() || 0}</span>
                <small className="stat-sub">Dense blobs formed because response is smooth around physical corners</small>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* STAGE 5: NON-MAXIMUM SUPPRESSION (FINAL LOCALIZATION)            */}
        {/* ================================================================= */}
        <section className="pipeline-stage-card glass-panel stage-highlight" id="stage-5">
          <div className="stage-card-header">
            <div className="stage-badge-title">
              <span className="stage-number-badge final-badge">Stage 5</span>
              <div>
                <h4>Task 4 (Part B): Non-Maximum Suppression (Final Corners)</h4>
                <p>Retain local maxima in window neighborhood; suppress redundant cluster detections</p>
              </div>
            </div>

            <div className="stage-header-actions">
              <button 
                className="btn-help-circle" 
                onClick={() => openQuestion('q4')}
                title="How Non-Maximum Suppression localizes exact corner peaks and suppresses redundant points"
              >
                <HelpCircle size={17} />
                <span>Explain NMS</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCanvas(canvasStage5Ref, `harris_final_corners_${finalBgMode}.png`)}
                disabled={!stage5Data}
              >
                <Download size={13} />
                <span>Export Image</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={handleExportCoordinates}
                disabled={!stage5Data || stage5Data.cornerCount === 0}
                title="Download CSV file containing all (x, y) coordinates and response values"
              >
                <FileSpreadsheet size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="stage-body-grid">
            <div className="stage-canvas-wrapper">
              <canvas ref={canvasStage5Ref} className="stage-canvas" style={{ display: stage5Data ? 'block' : 'none' }} />
              {!stage5Data ? (
                <div className="stage-empty-hint">
                  <Upload size={24} />
                  <span>Upload a picture above to compute final corners</span>
                </div>
              ) : (
                <div className="canvas-overlay-tag final-tag">
                  Final Localized Corners: {stage5Data?.cornerCount || 0}
                </div>
              )}
            </div>

            <div className="stage-controls-panel">
              <div className="corner-counter-card">
                <div className="corner-counter-icon">
                  <Target size={20} />
                </div>
                <div className="corner-counter-text">
                  <span className="counter-number">{stage5Data?.cornerCount || 0}</span>
                  <span className="counter-label">Distinct Keypoints Localized</span>
                </div>
              </div>

              {/* NMS Neighborhood Window Size */}
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Suppression Neighborhood (NMS Window)</span>
                  <span className="value-badge mono">{2 * nmsRadius + 1}×{2 * nmsRadius + 1} (r={nmsRadius})</span>
                </label>
                <div className="btn-group">
                  {[
                    { r: 1, label: '3×3' },
                    { r: 2, label: '5×5' },
                    { r: 3, label: '7×7' },
                    { r: 4, label: '9×9' },
                    { r: 5, label: '11×11' }
                  ].map(w => (
                    <button
                      key={w.r}
                      className={`btn-toggle ${nmsRadius === w.r ? 'active' : ''}`}
                      onClick={() => setNmsRadius(w.r)}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marker Visual Style */}
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Marker Visual Style</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn-toggle ${markerStyle === 'point' ? 'active' : ''}`}
                    onClick={() => setMarkerStyle('point')}
                  >
                    Single Pixel
                  </button>
                  <button
                    className={`btn-toggle ${markerStyle === 'target' ? 'active' : ''}`}
                    onClick={() => setMarkerStyle('target')}
                  >
                    Target Ring
                  </button>
                  <button
                    className={`btn-toggle ${markerStyle === 'cross' ? 'active' : ''}`}
                    onClick={() => setMarkerStyle('cross')}
                  >
                    Crosshair
                  </button>
                  <button
                    className={`btn-toggle ${markerStyle === 'dot' ? 'active' : ''}`}
                    onClick={() => setMarkerStyle('dot')}
                  >
                    Solid Dot
                  </button>
                </div>
              </div>

              {/* Radio buttons for Canvas Background */}
              <div className="control-item">
                <label className="control-label">
                  <span className="label-text">Corner Display Mode</span>
                </label>
                <div className="radio-group-container">
                  <label className={`radio-item-label ${finalBgMode === 'overlay' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="finalBg"
                      value="overlay"
                      checked={finalBgMode === 'overlay'}
                      onChange={() => setFinalBgMode('overlay')}
                    />
                    <div className="radio-text">
                      <span className="radio-title">Overlay on Image</span>
                    </div>
                  </label>
                  <label className={`radio-item-label ${finalBgMode === 'black' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="finalBg"
                      value="black"
                      checked={finalBgMode === 'black'}
                      onChange={() => setFinalBgMode('black')}
                    />
                    <div className="radio-text">
                      <span className="radio-title">Corners Only (Black Canvas)</span>
                    </div>
                  </label>
                  <label className={`radio-item-label ${finalBgMode === 'white' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="finalBg"
                      value="white"
                      checked={finalBgMode === 'white'}
                      onChange={() => setFinalBgMode('white')}
                    />
                    <div className="radio-text">
                      <span className="radio-title">Corners Only (White Canvas)</span>
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
                      className={`color-swatch-btn ${markerColor === c.id ? 'active' : ''}`}
                      style={{ backgroundColor: c.color }}
                      onClick={() => setMarkerColor(c.id)}
                      title={c.name}
                    >
                      {markerColor === c.id && (
                        <span className="swatch-check" style={{ color: c.id === 'white' ? '#0f172a' : '#ffffff' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Harris Questions Explanation Modal */}
      <HarrisQuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        activeQuestionId={modalQuestionId}
      />
    </div>
  );
}

export default HarrisPipelineView;
