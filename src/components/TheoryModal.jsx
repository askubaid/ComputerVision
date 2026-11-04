import React from 'react';
import { 
  X, 
  BookOpen, 
  Waves, 
  Zap, 
  Sparkles, 
  Cpu, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { MathView } from './MathView';

export function TheoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen size={20} className="modal-title-icon" />
            <div>
              <h3>Digital Image Processing — Spatial Filtering Principles</h3>
              <p>Theoretical reference for Spatial Domain filtering &amp; 2D Convolution</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1: Spatial Domain Convolution */}
          <section className="theory-section">
            <div className="section-title">
              <Cpu size={16} />
              <h4>1. What is Spatial Filtering &amp; 2D Convolution?</h4>
            </div>
            <p>
              Spatial filtering operates directly on the pixels of an image. A sub-image called a 
              <strong> filter mask</strong> (also called kernel, template, or window) is moved across 
              each pixel coordinate $(x,y)$. The response at each coordinate is computed by taking 
              the sum of products between the mask coefficients and the corresponding neighborhood pixels:
            </p>
            <div className="math-box">
              <MathView 
                latex="g(x,y) = \sum_{s=-a}^{a} \sum_{t=-b}^{b} w(s,t) \cdot f(x+s, y+t)" 
                displayMode={true} 
              />
            </div>
            <p className="theory-subtext">
              By the Convolution Theorem, spatial domain convolution is mathematically equivalent 
              to pointwise multiplication in the Frequency Domain: 
              <span className="mono"> f(x,y) * h(x,y) ⟺ F(u,v) · H(u,v)</span>.
            </p>
          </section>

          {/* Section 2: Low-Pass Filters */}
          <section className="theory-section">
            <div className="section-title low-pass-color">
              <Waves size={16} />
              <h4>2. Low-Pass Filters (Smoothing &amp; Noise Reduction)</h4>
            </div>
            <p>
              Low-pass filters attenuate high spatial frequencies (responsible for sharp transitions, 
              fine details, and noise) while allowing low frequencies (overall luminance and smooth surfaces) 
              to pass unaffected.
            </p>
            <div className="theory-cards-grid">
              <div className="theory-card">
                <h5>Mean (Box) Filter</h5>
                <p>
                  Uniform weights <span className="mono">1/(N×N)</span>. Simple and fast, but introduces 
                  slight directional blurring along axes and can create ringing in the frequency domain 
                  due to the sinc transfer function.
                </p>
              </div>
              <div className="theory-card">
                <h5>Gaussian Filter</h5>
                <p>
                  Bell-shaped weights proportional to distance from center: 
                  <span className="mono"> G(r) ∝ exp(-r² / 2σ²)</span>. Isotropic (rotationally symmetric), 
                  with no side lobes or frequency ringing.
                </p>
              </div>
              <div className="theory-card">
                <h5>Median Filter (Non-linear)</h5>
                <p>
                  Replaces the center pixel with the median value in the neighborhood. 
                  Exceptional at eliminating <em>impulse (salt-and-pepper) noise</em> without smearing step edges!
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: High-Pass Filters */}
          <section className="theory-section">
            <div className="section-title high-pass-color">
              <Zap size={16} />
              <h4>3. High-Pass Filters (Sharpening &amp; Edge Detection)</h4>
            </div>
            <p>
              High-pass filters suppress low-frequency background illumination and accentuate rapid 
              intensity transitions (edges, contours, object boundaries, fine textures).
            </p>
            <div className="theory-cards-grid">
              <div className="theory-card">
                <h5>Sobel &amp; Prewitt (1st Derivative)</h5>
                <p>
                  Computes the spatial gradient vector:
                  <span className="mono"> ∇f = [Gx, Gy]ᵀ</span>. The gradient magnitude 
                  <span className="mono"> M = √(Gx² + Gy²)</span> detects edge intensity, while 
                  the angle indicates edge orientation.
                </p>
              </div>
              <div className="theory-card">
                <h5>Laplacian (2nd Derivative)</h5>
                <p>
                  Isotropic operator: <span className="mono"> ∇²f = ∂²f/∂x² + ∂²f/∂y²</span>. 
                  Produces zero in smooth areas, positive/negative response across edges, and 
                  identifies precise edge locations via <em>zero-crossings</em>.
                </p>
              </div>
              <div className="theory-card">
                <h5>High-Boost / Unsharp Masking</h5>
                <p>
                  Subtracts a smoothed version of the image to obtain a crisp edge mask:
                  <span className="mono"> f_hb = f + k·(f - f_blur)</span>. When 
                  <span className="mono">k=1</span>, it is classic unsharp masking; when 
                  <span className="mono">k &gt; 1</span>, it is high-boost filtering.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Canny Edge Detection */}
          <section className="theory-section">
            <div className="section-title edge-color">
              <Sparkles size={16} />
              <h4>4. Canny Optimal Edge Detector (Multi-Stage)</h4>
            </div>
            <p>
              Developed by John F. Canny in 1986, this algorithm satisfies three fundamental criteria: low error rate, precise localization, and single edge response.
            </p>
            <div className="theory-cards-grid">
              <div className="theory-card">
                <h5>1. Gaussian Smoothing</h5>
                <p>Convolves with a 2D Gaussian kernel to suppress camera noise without excessive edge degradation.</p>
              </div>
              <div className="theory-card">
                <h5>2. Gradient &amp; Non-Maximum Suppression</h5>
                <p>Computes gradient vector magnitude and orientation, then thins candidate edges to strict 1-pixel widths.</p>
              </div>
              <div className="theory-card">
                <h5>3. Hysteresis Double Thresholding</h5>
                <p>Uses dual thresholds (T_high and T_low). Preserves continuous contours by linking weak edges to strong edges.</p>
              </div>
            </div>
          </section>

          {/* Section 5: Harris Corner Detection */}
          <section className="theory-section">
            <div className="section-title corner-color">
              <Cpu size={16} />
              <h4>5. Harris Corner &amp; Feature Keypoint Detector</h4>
            </div>
            <p>
              Developed by Chris Harris &amp; Mike Stephens in 1988. Finds distinctive 2D points with large intensity gradients in all spatial directions.
            </p>
            <div className="theory-cards-grid">
              <div className="theory-card">
                <h5>Structure Tensor Matrix (M)</h5>
                <p>Constructs auto-correlation matrix <span className="mono">M = Σ w(x,y) [Ix² IxIy; IxIy Iy²]</span> via smoothed spatial derivatives.</p>
              </div>
              <div className="theory-card">
                <h5>Corner Response Measure (R)</h5>
                <p><span className="mono">R = det(M) - k·(trace(M))²</span>. Large positive R indicates a robust corner keypoint; negative R denotes an edge; near-zero denotes flat terrain.</p>
              </div>
              <div className="theory-card">
                <h5>Feature Invariance</h5>
                <p>Harris corners are invariant to rotation and illumination offset, making them indispensable for tracking, panorama stitching, and SLAM.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <span className="footer-note">Computer Vision Playground — Developed by Ubaid ur Rehman (MS Scholar, IST) | Supervised by Dr. Benish Amin</span>
          <button className="btn btn-primary" onClick={onClose}>
            Got it, return to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
