import React from 'react';
import istLogo from '../../IST.jpg';

export function Header({ activeFilter = {} }) {
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
    </header>
  );
}
