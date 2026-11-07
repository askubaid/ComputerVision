import React from 'react';
import istLogo from '../../IST.jpg';
import { Activity, ArrowLeft } from 'lucide-react';

export function Header({ activeFilter = {}, currentView = 'studio', onToggleView }) {
  return (
    <header className="app-header glass-panel">
      <div className="header-brand">
        <div className="brand-logo">
          <div className="ist-logo-container" title="Institute of Space Technology (IST), Islamabad">
            <img
              src={istLogo}
              alt="Institute of Space Technology (IST) Logo"
              className="ist-logo-img"
            />
          </div>
          <div className="brand-text-block">
            <div className="brand-title">
              Computer Vision Filters <span>Playground</span>
            </div>
            <div className="brand-academic-meta">
              <span className="academic-author">
                Developed by <strong>Ubaid ur Rehman</strong>
              </span>
              <span className="academic-divider">•</span>
              <span className="academic-role">MS scholar, at IST</span>
              <span className="academic-divider">-</span>
              <span className="academic-supervisor">
                Subject Supervised by <strong>Dr. Benish Amin</strong>
              </span>
              <span className="academic-supervisor">
                Institute Of Space Technology Islamabad Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-nav-actions">
        {currentView === 'studio' ? (
          <button
            className="btn-header-nav-experiment"
            onClick={() => onToggleView && onToggleView('experiments')}
            title="Open 5-Experiment Evaluation Dashboard (A, B, C, D, E)"
          >
            <Activity size={16} className="btn-icon" />
            <span className="btn-text">Experimental Evaluations</span>
            <span className="btn-hot-badge">5 Experiments</span>
          </button>
        ) : (
          <button
            className="btn-header-nav-studio"
            onClick={() => onToggleView && onToggleView('studio')}
            title="Return to interactive Studio Playground"
          >
            <ArrowLeft size={16} className="btn-icon" />
            <span className="btn-text">Studio Playground</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
