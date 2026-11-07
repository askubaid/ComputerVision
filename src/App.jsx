import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterSelector } from './components/FilterSelector';
import { FilterControls } from './components/FilterControls';
import { KernelVisualizer } from './components/KernelVisualizer';
import { ImageViewport } from './components/ImageViewport';
import { HistogramPanel } from './components/HistogramPanel';
import { TheoryModal } from './components/TheoryModal';
import { HarrisPipelineView } from './components/HarrisPipelineView';
import { ExperimentationsView } from './components/ExperimentationsView';

import { 
  STUDIO_TABS,
  FILTER_CATEGORIES, 
  FILTER_PRESETS, 
  DEFAULT_CUSTOM_KERNEL 
} from './utils/filterPresets';
import { 
  applyConvolution, 
  applyMedianFilter, 
  applyGradientFilter, 
  generateGaussianKernel, 
  generateBoxBlurKernel,
  applyHarrisCornerDetector
} from './utils/filterEngine';

import './App.css';

export function App() {
  // Top-Level View State ('studio' | 'experiments')
  const [currentView, setCurrentView] = useState('studio');

  // Navigation Tab State (Filters | Edge Detection | Corner Detection)
  const [activeTab, setActiveTab] = useState(STUDIO_TABS.FILTERS);
  const [selectedFilterId, setSelectedFilterId] = useState('box_blur');
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Dynamic Parameters for all filter families
  const [filterParams, setFilterParams] = useState({
    kernelSize: 3,
    sigma: 1.2,
    gradientMode: 'magnitude',
    gain: 1.0,
    // Harris corner parameters
    harrisK: 0.04,
    harrisSensitivity: 35,
    harrisStyle: 'target',
    harrisColor: 'red',
    harrisIsolated: false,
    harrisIsolatedBg: 'black'
  });

  // Corner counter state
  const [cornerCount, setCornerCount] = useState(0);

  // Custom Kernel State
  const [customKernel, setCustomKernel] = useState(DEFAULT_CUSTOM_KERNEL);
  const [customDivisor, setCustomDivisor] = useState(1);
  const [customBias, setCustomBias] = useState(0);

  // Image Data State (No default picture; user uploaded only)
  const [baseImageData, setBaseImageData] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [filteredImageData, setFilteredImageData] = useState(null);
  const [processTimeMs, setProcessTimeMs] = useState(0);

  // Modal State
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);

  const activeFilter = isCustomActive 
    ? { 
        id: 'custom', 
        name: 'Custom Convolution Kernel', 
        category: FILTER_CATEGORIES.CUSTOM,
        kernel: customKernel,
        divisor: customDivisor,
        bias: customBias
      }
    : FILTER_PRESETS.find(f => f.id === selectedFilterId) || FILTER_PRESETS[0];

  // Helper to load user uploaded image onto an offscreen canvas and obtain ImageData
  const loadImageDataFromSrc = useCallback((src) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Scale down large images to keep processing under 30ms for 60fps real-time feel
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      const maxDim = 640;
      if (w > maxDim || h > maxDim) {
        if (w >= h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);

      // Convert uploaded image directly to grayscale as the foundational first operation
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      setBaseImageData(imgData);
    };
    img.src = src;
  }, []);

  // Handle User Upload
  const handleUploadImage = (dataUrl) => {
    loadImageDataFromSrc(dataUrl);
  };

  // Reset to default parameter state
  const handleReset = () => {
    setFilterParams({
      kernelSize: 3,
      sigma: 1.2,
      gradientMode: 'magnitude',
      gain: 1.0,
      harrisK: 0.04,
      harrisSensitivity: 35,
      harrisStyle: 'target',
      harrisColor: 'red',
      harrisIsolated: false,
      harrisIsolatedBg: 'black'
    });
  };

  // Parameter Change Handlers
  const handleParamChange = (param, value) => {
    setFilterParams(prev => ({ ...prev, [param]: value }));
  };

  // Compute Current Convolution Kernel for Visualizer
  const getCurrentKernelDetails = () => {
    if (isCustomActive) {
      return { kernel: customKernel, divisor: customDivisor, bias: customBias };
    }

    if (activeFilter.kernelType === 'gaussian') {
      const { kernel } = generateGaussianKernel(filterParams.kernelSize, filterParams.sigma);
      return { kernel, divisor: 1, bias: 0 };
    }

    if (activeFilter.kernelType === 'box') {
      const { kernel, divisor } = generateBoxBlurKernel(filterParams.kernelSize);
      return { kernel, divisor, bias: 0 };
    }

    return { 
      kernel: activeFilter.kernel, 
      divisor: activeFilter.divisor || 1, 
      bias: activeFilter.bias || 0 
    };
  };

  // Main Processing Engine Runner
  useEffect(() => {
    if (!baseImageData) {
      setOriginalImageData(null);
      setFilteredImageData(null);
      setProcessTimeMs(0);
      setCornerCount(0);
      return;
    }

    setOriginalImageData(baseImageData);

    const startTime = performance.now();
    let result = null;

    if (isCustomActive) {
      result = applyConvolution(
        baseImageData, 
        customKernel, 
        customDivisor, 
        customBias, 
        true
      );
    } else if (activeFilter.kernelType === 'harris') {
      result = applyHarrisCornerDetector(
        baseImageData,
        filterParams.harrisK,
        filterParams.harrisSensitivity,
        filterParams.harrisStyle,
        filterParams.harrisColor,
        filterParams.harrisIsolated,
        filterParams.harrisIsolatedBg
      );
      setCornerCount(result.cornerCount || 0);
    } else if (activeFilter.kernelType === 'median') {
      result = applyMedianFilter(baseImageData, filterParams.kernelSize, true);
    } else if (activeFilter.kernelType === 'gradient') {
      result = applyGradientFilter(
        baseImageData,
        activeFilter.kernelX,
        activeFilter.kernelY,
        filterParams.gradientMode,
        filterParams.gain,
        true
      );
    } else if (activeFilter.kernelType === 'gaussian') {
      const { kernel, divisor } = generateGaussianKernel(filterParams.kernelSize, filterParams.sigma);
      result = applyConvolution(baseImageData, kernel, divisor, 0, true);
    } else if (activeFilter.kernelType === 'box') {
      const { kernel, divisor } = generateBoxBlurKernel(filterParams.kernelSize);
      result = applyConvolution(baseImageData, kernel, divisor, 0, true);
    } else {
      result = applyConvolution(
        baseImageData,
        activeFilter.kernel,
        activeFilter.divisor || 1,
        activeFilter.bias || 0,
        true
      );
    }

    const endTime = performance.now();
    setProcessTimeMs(endTime - startTime);
    setFilteredImageData(result);

  }, [
    baseImageData, 
    selectedFilterId, 
    isCustomActive, 
    filterParams, 
    customKernel, 
    customDivisor, 
    customBias
  ]);

  // Export processed image
  const handleDownload = () => {
    if (!filteredImageData) return;
    const canvas = document.createElement('canvas');
    canvas.width = filteredImageData.width;
    canvas.height = filteredImageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(filteredImageData, 0, 0);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `cv_${isCustomActive ? 'custom' : selectedFilterId}_${Date.now()}.png`;
    a.click();
  };

  const kernelDetails = getCurrentKernelDetails();

  return (
    <div className={`spatial-app ${currentView === 'experiments' ? 'experiments-mode' : ''}`}>
      {/* Top Academic Title Bar */}
      <Header 
        activeFilter={activeFilter} 
        currentView={currentView}
        onToggleView={setCurrentView}
      />

      {currentView === 'experiments' ? (
        <ExperimentationsView onBack={() => setCurrentView('studio')} />
      ) : (
        /* Main Studio Body */
        <main className="studio-layout">
          {/* Left Column: Filter Presets & Dynamic Sliders */}
          <aside className="studio-sidebar-left">
            <FilterSelector 
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsCustomActive(false);
              }}
              selectedFilterId={selectedFilterId}
              onSelectFilter={(id) => {
                setSelectedFilterId(id);
                setIsCustomActive(false);
                const found = FILTER_PRESETS.find(f => f.id === id);
                if (found) {
                  if (found.defaultKernelSize) {
                    setFilterParams(p => ({ ...p, kernelSize: found.defaultKernelSize }));
                  }
                  if (found.defaultSigma) {
                    setFilterParams(p => ({ ...p, sigma: found.defaultSigma }));
                  }
                  if (found.defaultHarrisK) {
                    setFilterParams(p => ({ ...p, harrisK: found.defaultHarrisK }));
                  }
                  if (found.defaultHarrisSensitivity) {
                    setFilterParams(p => ({ ...p, harrisSensitivity: found.defaultHarrisSensitivity }));
                  }
                }
              }}
              isCustomActive={isCustomActive}
              onSelectCustom={() => {
                setIsCustomActive(true);
                setActiveTab(STUDIO_TABS.FILTERS);
              }}
            />

            {activeTab !== STUDIO_TABS.CORNER_DETECTION && (
              <FilterControls 
                filter={activeFilter}
                params={filterParams}
                onParamChange={handleParamChange}
                isCustomActive={isCustomActive}
                cornerCount={cornerCount}
              />
            )}
          </aside>

          {/* Tab 3: Harris 5-Stage Interactive Pipeline */}
          {activeTab === STUDIO_TABS.CORNER_DETECTION ? (
            <section className="studio-harris-stage">
              <HarrisPipelineView 
                originalImageData={baseImageData}
                onImageUpload={handleUploadImage}
                onReset={handleReset}
              />
            </section>
          ) : (
            <>
              {/* Center Column: Viewport Stage (Tabs 1 & 2 Remain Intact) */}
              <section className="studio-viewport-stage">
                <ImageViewport 
                  originalImageData={originalImageData}
                  filteredImageData={filteredImageData}
                  processTimeMs={processTimeMs}
                  onImageDrop={handleUploadImage}
                  onReset={handleReset}
                  onDownload={handleDownload}
                  onOpenTheory={() => setIsTheoryOpen(true)}
                />
              </section>

              {/* Right Column: Kernel Matrix & Frequency Histogram */}
              <aside className="studio-sidebar-right">
                <KernelVisualizer 
                  filter={activeFilter}
                  kernel={kernelDetails.kernel}
                  divisor={kernelDetails.divisor}
                  bias={kernelDetails.bias}
                  isCustom={isCustomActive}
                  onCustomKernelChange={setCustomKernel}
                  onCustomDivisorChange={setCustomDivisor}
                  onCustomBiasChange={setCustomBias}
                />

                <HistogramPanel 
                  originalImageData={originalImageData}
                  filteredImageData={filteredImageData}
                />
              </aside>
            </>
          )}
        </main>
      )}

      {/* DIP Education & Theory Modal */}
      <TheoryModal 
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />
    </div>
  );
}

export default App;
