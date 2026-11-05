import React from 'react';
import { 
  Waves, 
  Edit3, 
  Sparkles, 
  Scan, 
  Compass, 
  BoxSelect,
  Layers,
  Activity,
  Crosshair,
  SlidersHorizontal
} from 'lucide-react';
import { STUDIO_TABS, FILTER_CATEGORIES, FILTER_PRESETS } from '../utils/filterPresets';

const FILTER_ICONS = {
  box_blur: BoxSelect,
  gaussian_blur: Waves,
  weighted_average: Layers,
  median_filter: Sparkles,
  prewitt_gradient: Compass,
  sobel_gradient: Activity,
  harris_corner: Crosshair
};

export function FilterSelector({ 
  activeTab = STUDIO_TABS.FILTERS,
  onTabChange, 
  selectedFilterId, 
  onSelectFilter,
  isCustomActive,
  onSelectCustom
}) {
  const lowPassFilters = FILTER_PRESETS.filter(f => f.category === FILTER_CATEGORIES.LOW_PASS);
  const edgeFilters = FILTER_PRESETS.filter(f => f.tab === STUDIO_TABS.EDGE_DETECTION);
  const cornerFilters = FILTER_PRESETS.filter(f => f.tab === STUDIO_TABS.CORNER_DETECTION);

  // Helper to render filter card
  const renderFilterCard = (filter) => {
    const Icon = FILTER_ICONS[filter.id] || Sparkles;
    const isSelected = selectedFilterId === filter.id && !isCustomActive;

    return (
      <div 
        key={filter.id}
        className={`filter-item-card ${isSelected ? 'selected' : ''} ${filter.category}`}
        onClick={() => onSelectFilter(filter.id)}
      >
        <div className="card-top">
          <div className="card-icon-wrap">
            <Icon size={18} />
          </div>
          <span className="card-badge">{filter.badge}</span>
        </div>
        <div className="card-body">
          <h4 className="card-title">{filter.name}</h4>
          <p className="card-tagline">{filter.tagline}</p>
        </div>
        <div className="card-footer">
          <span className="kernel-size-indicator mono">
            {filter.kernelType === 'median' 
              ? 'Rank Order' 
              : filter.kernelType === 'harris'
              ? 'Structure Tensor'
              : `${filter.defaultKernelSize}×${filter.defaultKernelSize}`}
          </span>
          {isSelected && <span className="active-pill">ACTIVE</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="filter-selector-card glass-panel">
      {/* 3 Main Navigation Tabs */}
      <div className="category-tabs top-studio-tabs">
        {/* Tab 1: Filters */}
        <button 
          className={`cat-tab ${activeTab === STUDIO_TABS.FILTERS ? 'active' : ''}`}
          onClick={() => {
            onTabChange(STUDIO_TABS.FILTERS);
            if (!isCustomActive && !lowPassFilters.some(f => f.id === selectedFilterId)) {
              onSelectFilter(lowPassFilters[0].id);
            }
          }}
          title="Low-Pass Smoothing and Custom Convolution Filters"
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
        </button>

        {/* Tab 2: Edge Detection */}
        <button 
          className={`cat-tab ${activeTab === STUDIO_TABS.EDGE_DETECTION ? 'active' : ''}`}
          onClick={() => {
            onTabChange(STUDIO_TABS.EDGE_DETECTION);
            if (!edgeFilters.some(f => f.id === selectedFilterId)) {
              onSelectFilter(edgeFilters[0].id);
            }
          }}
          title="Edge Detection Operators (Prewitt, Sobel)"
        >
          <Scan size={15} />
          <span>Edge Detection</span>
          <span className="count-pill">{edgeFilters.length}</span>
        </button>

        {/* Tab 3: Corner Detection */}
        <button 
          className={`cat-tab ${activeTab === STUDIO_TABS.CORNER_DETECTION ? 'active' : ''}`}
          onClick={() => {
            onTabChange(STUDIO_TABS.CORNER_DETECTION);
            if (!cornerFilters.some(f => f.id === selectedFilterId)) {
              onSelectFilter(cornerFilters[0].id);
            }
          }}
          title="Corner Feature Detection (Harris Corner Detector)"
        >
          <Crosshair size={15} />
          <span>Corner Detection</span>
        </button>
      </div>

      {/* Tab 1 Content: Low-Pass and Custom Kernel */}
      {activeTab === STUDIO_TABS.FILTERS && (
        <div className="tab-filters-sections">
          {/* Section 1: Low-Pass */}
          <div className="filter-section-group">
            <div className="section-label-header">
              <span className="section-dot low-pass-dot"></span>
              <span className="section-title">1. Low-Pass Filters (Smoothing)</span>
            </div>
            <div className="filter-cards-grid">
              {lowPassFilters.map(renderFilterCard)}
            </div>
          </div>

          {/* Section 2: Custom Kernel */}
          <div className="filter-section-group">
            <div className="section-label-header">
              <span className="section-dot custom-dot"></span>
              <span className="section-title">2. Custom Convolution Kernel</span>
            </div>
            <div 
              className={`filter-item-card custom-kernel-select-card ${isCustomActive ? 'selected' : ''}`}
              onClick={onSelectCustom}
            >
              <div className="card-top">
                <div className="card-icon-wrap custom-icon-wrap">
                  <Edit3 size={18} />
                </div>
                <span className="card-badge">Interactive Matrix</span>
              </div>
              <div className="card-body">
                <h4 className="card-title">Custom Convolution Kernel</h4>
                <p className="card-tagline">Design your own impulse response matrix, divisor scale &amp; bias</p>
              </div>
              <div className="card-footer">
                <span className="kernel-size-indicator mono">Interactive 3×3 / 5×5</span>
                {isCustomActive && <span className="active-pill">ACTIVE</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 Content: Edge Detection (Prewitt and Sobel) */}
      {activeTab === STUDIO_TABS.EDGE_DETECTION && (
        <div className="tab-edge-section">
          <div className="section-label-header">
            <span className="section-dot edge-dot"></span>
            <span className="section-title">Gradient Edge Detectors (Prewitt, Sobel)</span>
          </div>
          <div className="filter-cards-grid">
            {edgeFilters.map(renderFilterCard)}
          </div>
        </div>
      )}

      {/* Tab 3 Content: Corner Detection */}
      {activeTab === STUDIO_TABS.CORNER_DETECTION && (
        <div className="tab-corner-section">
          <div className="section-label-header">
            <span className="section-dot corner-dot"></span>
            <span className="section-title">Harris Detector &amp; Pipeline</span>
          </div>
          <div className="filter-cards-grid">
            {cornerFilters.map(renderFilterCard)}
          </div>
          <div className="pipeline-quick-nav">
            <span className="nav-title">Quick Stage Jump:</span>
            <div className="nav-links">
              <a href="#stage-1" className="stage-jump-btn">1. Gradients (Ix, Iy)</a>
              <a href="#stage-2" className="stage-jump-btn">2. Structure Tensor</a>
              <a href="#stage-3" className="stage-jump-btn">3. Response Map R</a>
              <a href="#stage-4" className="stage-jump-btn">4. Threshold Clusters</a>
              <a href="#stage-5" className="stage-jump-btn">5. NMS Keypoints</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default FilterSelector;
