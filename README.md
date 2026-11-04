# Computer Vision Playground — Interactive Spatial Filters & DIP Studio

An interactive, high-performance web application built with **React.js** and **Vite** for studying, visualizing, and applying **Spatial Domain Filters** (Digital Image Processing & Computer Vision).

**Developed by:** Ubaid ur Rehman (MS Scholar, Institute of Space Technology - IST)  
**Supervised by:** Dr. Benish Amin (Assistant Professor, Department of Computer Science, IST)  

---

## 🚀 Features

### 1. Image Upload & Presets
- **Picture Upload**: Upload your own images via file selector or drag & drop directly onto the canvas stage.
- **Built-in High-Frequency DIP Test Charts**:
  - *Geometric Test Chart*: Concentric frequency rings, checkerboards, star polygons, and step edges.
  - *Microchip PCB Circuit*: Orthogonal copper traces and silicon IC die for directional derivative analysis.
  - *Cosmic Field & Noise*: Nebula clouds, celestial rings, and telescope sensor noise.
  - *Portrait & Textures*: Facial gradients, fine hair strands, and delicate feather edges.

### 2. Spatial Low-Pass Filters (Smoothing & Noise Reduction)
- **Mean (Box) Filter**: Uniform averaging mask ($3\times3$, $5\times5$, $7\times7$) with divisor normalization.
- **Gaussian Blur Filter**: 2D bell-curve convolution with adjustable standard deviation ($\sigma$) and kernel size.
- **Weighted Average Filter**: Center-weighted binomial approximation ($[1\ 2\ 1;\ 2\ 4\ 2;\ 1\ 2\ 1] / 16$).
- **Median Filter (Non-linear)**: Order-statistic rank filter that removes impulse (salt-and-pepper) noise without blurring step edges.

### 3. Spatial High-Pass Filters (Sharpening & Edge Detection)
- **Laplacian (4-Connected)**: Second-derivative operator detecting rapid intensity changes.
- **Laplacian (8-Connected)**: Isotropic omnidirectional second-derivative edge detector.
- **Laplacian Sharpening**: Detail enhancement mask subtracting the Laplacian from original intensities.
- **Sobel Gradient Operator**: First-order discrete gradients with directional components ($G_x$ horizontal, $G_y$ vertical, and magnitude $|G| = \sqrt{G_x^2 + G_y^2}$).
- **Prewitt Edge Detector**: Directional differential masks with uniform perpendicular averaging.
- **High-Boost / Unsharp Masking**: Tunable detail enhancement with boost factor $k$ ($k=1$ standard unsharp mask, $k > 1$ high-boost).
- **Directional Emboss Filter**: 3D bas-relief visual effect with positive DC offset.

### 4. Interactive Custom Kernel Designer
- Live editable $3\times3$ / $5\times5$ matrix grid.
- Custom divisor/normalization scale and DC bias offset controls.
- One-click presets (Identity, Sharpen, Edge Detect, Box Blur).
- One-click **Copy NumPy / Python Array** code snippet generation.

### 5. Multi-View Comparison Viewport
- **Curtain Split Slider**: Draggable interactive divider allowing real-time Before/After comparison.
- **Side-by-Side View**: Synchronized display of original and processed images.
- **Difference Heatmap**: Jet pseudo-color heat map ($|Filtered - Original|$) visualizing frequency suppression and edge extraction.
- **Filtered Only & Original Only** view modes.
- **Zoom & Pan Controls** (50% to 250%).

### 6. Interactive Noise Injection Suite & Analysis
- **Salt & Pepper (Impulse) Noise**: Test filter denoising performance in real time (watch the Median filter clean it up completely!).
- **Gaussian Sensor Noise**: Evaluate Gaussian vs Box smoothing on random noise.
- **256-Level Intensity Histogram**: Live comparison between input and output distributions.
- **DIP Guide & Mathematical Reference**: Built-in modal explaining spatial convolution, derivatives, and frequency correspondence.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running Locally

```bash
# Clone or navigate to the directory
cd "c:\Users\ubaid\Desktop\works\Spatial Filters"

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🏗️ Project Architecture

```
Spatial Filters/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                     # Core application orchestrator
    ├── App.css                     # Workstation UI layout & responsive styling
    ├── index.css                   # Design tokens, fonts, and scrollbars
    ├── components/
    │   ├── Header.jsx              # Navigation, image upload, preset picker, export
    │   ├── FilterSelector.jsx      # Low-Pass / High-Pass / Custom tabs & cards
    │   ├── FilterControls.jsx      # Kernel size, sigma, gradient mode, noise suite
    │   ├── KernelVisualizer.jsx    # Live 2D matrix heatmap & custom editor
    │   ├── ImageViewport.jsx       # Curtain split slider, side-by-side, difference map
    │   ├── HistogramPanel.jsx      # 256-level real-time intensity histogram
    │   └── TheoryModal.jsx         # DIP principles & mathematical reference modal
    └── utils/
        ├── filterEngine.js         # Fast 2D convolution, median, gradient & noise algorithms
        ├── filterPresets.js        # Filter definitions, formulas, and kernel matrices
        └── sampleImages.js         # Synthetic high-resolution DIP test patterns
```
