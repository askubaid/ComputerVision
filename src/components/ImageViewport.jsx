import React, { useRef, useState, useEffect } from 'react';
import { 
  SplitSquareVertical, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Activity,
  Upload,
  Download,
  BookOpen,
  UploadCloud,
  Maximize2
} from 'lucide-react';

export function ImageViewport({
  originalImageData,
  filteredImageData,
  processTimeMs = 0,
  onImageDrop,
  onReset,
  onDownload,
  onOpenTheory
}) {
  const [splitPos, setSplitPos] = useState(50); // percentage 0-100
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0); // 1.0 = 100%, up to 10.0 = 1000%
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const stageWrapperRef = useRef(null);
  const curtainWrapperRef = useRef(null);
  const splitOrigCanvasRef = useRef(null);
  const splitFiltCanvasRef = useRef(null);

  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const width = originalImageData?.width || 512;
  const height = originalImageData?.height || 512;

  // Zoom helpers (up to 1000% max zoom)
  const handleZoomIn = () => {
    setZoomLevel(prev => {
      let step = 0.25;
      if (prev >= 4.0) step = 1.0;
      else if (prev >= 2.0) step = 0.5;
      return Math.min(Number((prev + step).toFixed(2)), 10.0);
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      let step = 0.25;
      if (prev > 4.0) step = 1.0;
      else if (prev > 2.0) step = 0.5;
      return Math.max(Number((prev - step).toFixed(2)), 0.25);
    });
  };

  const handleResetZoomAndPan = () => {
    setZoomLevel(1.0);
    setPanPosition({ x: 0, y: 0 });
  };

  // Handle file picker selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleResetZoomAndPan();
        onImageDrop(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render original canvas for curtain split
  useEffect(() => {
    if (originalImageData && splitOrigCanvasRef.current) {
      const ctx = splitOrigCanvasRef.current.getContext('2d');
      splitOrigCanvasRef.current.width = width;
      splitOrigCanvasRef.current.height = height;
      ctx.putImageData(originalImageData, 0, 0);
    }
  }, [originalImageData, width, height]);

  // Render filtered canvas for curtain split
  useEffect(() => {
    if (filteredImageData && splitFiltCanvasRef.current) {
      const ctx = splitFiltCanvasRef.current.getContext('2d');
      splitFiltCanvasRef.current.width = width;
      splitFiltCanvasRef.current.height = height;
      ctx.putImageData(filteredImageData, 0, 0);
    }
  }, [filteredImageData, width, height]);

  // Handle curtain slider mouse drag
  const handleSplitMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSplit(true);
  };

  // Handle start dragging to pan image
  const handleStageMouseDown = (e) => {
    if (!originalImageData) return;
    if (e.target.closest('.curtain-divider-line')) return;
    if (e.button !== 0 && e.button !== 1) return; // Left or middle click

    e.preventDefault();
    setIsPanning(true);
    isPanningRef.current = true;
    startPanRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panPosition.x,
      panY: panPosition.y
    };
  };

  // Global mousemove and mouseup listeners for both Split dragging and Stage Panning
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSplit && curtainWrapperRef.current) {
        const rect = curtainWrapperRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const relX = clientX - rect.left;
        const percent = Math.min(Math.max((relX / rect.width) * 100, 1), 99);
        setSplitPos(percent);
      } else if (isPanningRef.current) {
        const dx = e.clientX - startPanRef.current.x;
        const dy = e.clientY - startPanRef.current.y;
        setPanPosition({
          x: Math.round(startPanRef.current.panX + dx),
          y: Math.round(startPanRef.current.panY + dy)
        });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplit) setIsDraggingSplit(false);
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanning(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Mouse wheel listener for natural scrolling pan & Ctrl-wheel zoom
  useEffect(() => {
    const stageEl = stageWrapperRef.current;
    if (!stageEl) return;

    const onWheel = (e) => {
      if (!originalImageData) return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoomLevel(prev => {
          return Math.min(Math.max(Number((prev + zoomDelta).toFixed(2)), 0.25), 10.0);
        });
      } else {
        e.preventDefault();
        setPanPosition(prev => ({
          x: Math.round(prev.x - e.deltaX),
          y: Math.round(prev.y - e.deltaY)
        }));
      }
    };

    stageEl.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      stageEl.removeEventListener('wheel', onWheel);
    };
  }, [originalImageData]);

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleResetZoomAndPan();
        onImageDrop(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={`viewport-container glass-panel ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Top Toolbar */}
      <div className="viewport-toolbar">
        {/* Action Buttons */}
        <div className="viewport-center-actions">
          {/* Upload Button */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload picture from your computer (JPG, PNG, WebP)"
          >
            <Upload size={15} />
            <span>Upload Picture</span>
          </button>

          {/* Reset button - placed right next to upload button */}
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => {
              handleResetZoomAndPan();
              onReset();
            }}
            disabled={!originalImageData}
            title="Reset to default filter parameters and center view"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          {/* Export button */}
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onDownload}
            disabled={!filteredImageData}
            title="Export and Download Processed Image"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          {/* DIP Guide button */}
          <button 
            className="btn btn-guide btn-sm" 
            onClick={onOpenTheory}
            title="Open Image Processing Theory & Math Guide"
          >
            <BookOpen size={15} />
            <span>DIP Guide</span>
          </button>
        </div>

        {/* Right: Performance Figures, Image Dimensions & Zoom Controls */}
        <div className="viewport-status-bar">
          {/* Performance figures */}
          <div className="benchmark-pill mono" title="Filter Processing Latency">
            <Activity size={13} className="pulse-icon" />
            <span>{processTimeMs.toFixed(1)} ms</span>
          </div>

          {/* Picture Dimensions (displayed like '400 x 500' between performance and zoom) */}
          {originalImageData && (
            <div className="dimension-pill mono" title="Uploaded Picture Dimensions (Width x Height)">
              <Maximize2 size={12} />
              <span>{width} x {height}</span>
            </div>
          )}

          {/* Zoom controls */}
          <div className="zoom-controls">
            <button 
              className="btn-icon" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.25}
              title="Zoom Out (Down to 25%)"
            >
              <ZoomOut size={14} />
            </button>
            <span className="zoom-label mono" title="Current Zoom Level (up to 1000%)">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              className="btn-icon" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 10.0}
              title="Zoom In (Up to 1000%)"
            >
              <ZoomIn size={14} />
            </button>
            <button 
              className="btn-icon" 
              onClick={handleResetZoomAndPan}
              title="Reset Zoom to 100% & Center Pan Position"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Display Area */}
      <div 
        className={`canvas-stage-wrapper ${originalImageData ? 'has-image' : ''} ${isPanning ? 'panning' : ''}`}
        ref={stageWrapperRef}
        onMouseDown={handleStageMouseDown}
      >
        {!originalImageData ? (
          <div className="viewport-empty-placeholder">
            <div className="empty-placeholder-box">
              <div className="empty-icon-ring">
                <UploadCloud size={46} className="empty-cloud-icon" />
              </div>
              <h3 className="empty-title">No Picture Loaded</h3>
              <p className="empty-description">
                Upload a picture from your computer or drag &amp; drop an image file here to explore 2D spatial convolution and filter effects in real time.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Upload Picture</span>
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="canvas-stage"
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.12s ease-out'
            }}
          >
            {/* CURTAIN SPLIT SLIDER VIEW */}
            <div 
              className="curtain-split-wrapper" 
              ref={curtainWrapperRef}
              style={{ width, height }}
            >
              {/* Filtered image on bottom */}
              <canvas ref={splitFiltCanvasRef} className="curtain-canvas" />

              {/* Original image on top, clipped by split position */}
              <div 
                className="curtain-clip-layer"
                style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
              >
                <canvas ref={splitOrigCanvasRef} className="curtain-canvas" />
                <span className="curtain-label label-orig">Original</span>
              </div>
              <span className="curtain-label label-filt">Filtered</span>

              {/* Interactive Divider Line with Handle */}
              <div 
                className="curtain-divider-line"
                style={{ left: `${splitPos}%` }}
                onMouseDown={handleSplitMouseDown}
              >
                <div className="curtain-handle">
                  <SplitSquareVertical size={16} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="drop-overlay">
          <UploadCloud size={48} className="drop-icon" />
          <h3>Drop your image here</h3>
          <p>Instant spatial filter processing</p>
        </div>
      )}
    </div>
  );
}