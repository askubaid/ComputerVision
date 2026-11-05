# Computer Vision Playground — Interactive Spatial Filters & DIP Studio

An interactive, high-performance web platform built with **React.js** and **Vite** for studying, exploring, and applying **Spatial Domain Filters**, **Gradient Edge Detection**, and **Multi-Stage Feature Extraction** in Digital Image Processing (DIP) and Computer Vision.

🌐 **Live Demo:** [https://askubaid.github.io/ComputerVision/](https://askubaid.github.io/ComputerVision/)  
📂 **GitHub Repository:** [https://github.com/askubaid/ComputerVision](https://github.com/askubaid/ComputerVision)

---

## 👨‍💻 Academic & Research Attribution

- **Developed by:** **Ubaid ur Rehman** (MS Scholar)
- **Institution:** **Institute of Space Technology (IST), Islamabad, Pakistan**
- **Supervised by:** **Dr. Benish Amin** (Assistant Professor, Department of Computer Science, Institute of Space Technology - IST, Islamabad)

---

## 🎨 Overview & Studio Architecture

The application is structured into three dedicated, highly interactive studio workstations:

```
Computer Vision Studio
├── Tab 1: Filters (Low-Pass Smoothing & Custom 2D Convolution)
├── Tab 2: Edge Detection (Sobel & Prewitt Spatial Gradients)
└── Tab 3: Corner Detection (5-Stage Interactive Harris Keypoint Pipeline)
```

---

## 🔍 1. Available Spatial Filters

Located under the **Filters** tab, this module focuses on spatial domain smoothing, noise reduction, and custom convolution:

### A. Low-Pass Smoothing Filters
Low-pass filters attenuate high spatial frequencies (responsible for sharp variations, fine details, and noise) while allowing low spatial frequencies (smooth surfaces and overall illumination) to pass unaffected.

1. **Mean (Box) Filter**:
   - Uniform spatial neighborhood averaging.
   - Formula:
     $$h(x,y) = \frac{1}{M \times N} \sum_{s} \sum_{t} f(x+s, y+t)$$
   - Available kernel window sizes: $3\times3$, $5\times5$, $7\times7$.
   - Effective for general noise reduction and uniform spatial blurring.

2. **Gaussian Blur Filter**:
   - 2D rotationally symmetric (isotropic) Gaussian bell-curve convolution.
   - Continuous kernel formula:
     $$G(x,y) = \frac{1}{2\pi\sigma^2} \exp\left(-\frac{x^2 + y^2}{2\sigma^2}\right)$$
   - Dynamically generated kernel weights with adjustable window sizes ($3\times3$, $5\times5$, $7\times7$) and configurable standard deviation ($\sigma \in [0.3, 4.0]$).
   - Suppresses high-frequency noise with zero directional bias and no frequency-domain ringing.

3. **Weighted Average Filter**:
   - Discrete binomial approximation kernel:
     $$W = \frac{1}{16} \begin{bmatrix} 1 & 2 & 1 \\ 2 & 4 & 2 \\ 1 & 2 & 1 \end{bmatrix}$$
   - Gives greatest weight to center pixels, providing gentle smoothing while preserving edge sharpness better than a uniform box blur.

4. **Median Filter (Non-linear Order-Statistic)**:
   - Non-linear neighborhood ranking filter:
     $$g(x,y) = \text{median}\left\{ f(x+s, y+t) \mid (s,t) \in S \right\}$$
   - Selects the median intensity in the local window.
   - Extremely effective at removing **impulse (salt-and-pepper) noise** without blurring structural step edges.

### B. Custom 2D Convolution Kernel Designer
- **Interactive Matrix Editor**: Live editable $3\times3$ and $5\times5$ numeric matrix cells.
- **Dynamic Normalization**: Configurable integer/float divisor and DC bias offset.
- **Interactive Presets**: Quick-load templates for Identity, Ridge Detection, Emboss, and High-Frequency Sharpening.
- **NumPy Code Export**: One-click generation of Python/NumPy array definitions ready for OpenCV and scientific scripts.

---

## ⚡ 2. Implemented Edge Detection Algorithms

Located under the **Edge Detection** tab, this module implements classic first-order spatial gradient operators for identifying object boundaries:

### A. Sobel Gradient Operator
The Sobel operator performs discrete differentiation combined with perpendicular Gaussian smoothing to reduce sensitivity to noise.
- **Horizontal Gradient Kernel ($G_x$)**:
  $$G_x = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}$$
- **Vertical Gradient Kernel ($G_y$)**:
  $$G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}$$
- **Gradient Metrics**:
  - Magnitude: $|G| = \sqrt{G_x^2 + G_y^2}$
  - Direction: $\theta = \arctan\left(\frac{G_y}{G_x}\right)$
- **Interactive Controls**: Toggle between Gradient Magnitude, Horizontal ($|G_x|$), and Vertical ($|G_y|$) components with adjustable edge contrast gain ($0.5\times$ to $3.5\times$).

### B. Prewitt Gradient Operator
The Prewitt operator evaluates spatial intensity differences using uniform box weighting in the orthogonal direction.
- **Horizontal Gradient Kernel ($G_x$)**:
  $$G_x = \begin{bmatrix} -1 & 0 & 1 \\ -1 & 0 & 1 \\ -1 & 0 & 1 \end{bmatrix}$$
- **Vertical Gradient Kernel ($G_y$)**:
  $$G_y = \begin{bmatrix} -1 & -1 & -1 \\ 0 & 0 & 0 \\ 1 & 1 & 1 \end{bmatrix}$$
- **Interactive Controls**: Directional mode selection (magnitude, $G_x$, $G_y$) and gain amplification.

---

## 🎯 3. Harris Corner Detection Implementation

Located under the **Corner Detection** tab, the application provides an interactive **5-stage modular pipeline** allowing students, researchers, and engineers to inspect every intermediate step of the Harris & Stephens (1988) corner detector.

### Theory & Mathematical Foundation
A corner is defined as an image location where the intensity changes significantly in all spatial directions. The auto-correlation function for a spatial shift $(\Delta x, \Delta y)$ is approximated using a local Taylor expansion:

$$E(\Delta x, \Delta y) \approx [\Delta x, \Delta y] \cdot M \cdot \begin{bmatrix} \Delta x \\ \Delta y \end{bmatrix}$$

where $M$ is the local **Structure Tensor (Second Moment Matrix)**.

---

### The 5 Interactive Pipeline Stages

#### Stage 1: Spatial Derivative Computation ($I_x, I_y$)
- The grayscale image $I(x,y)$ is convolved with horizontal and vertical Sobel gradient kernels:
  $$I_x = I \ast G_x, \quad I_y = I \ast G_y$$
- **Viewport Features**: Synchronized dual display of horizontal ($I_x$) and vertical ($I_y$) derivative intensity maps with normalized bipolar rendering.

#### Stage 2: Structure Tensor Construction ($M$)
- Three intermediate products are computed at each pixel coordinate:
  $$I_x^2 = I_x \cdot I_x, \quad I_y^2 = I_y \cdot I_y, \quad I_x I_y = I_x \cdot I_y$$
- A Gaussian spatial window function $w(x,y; \sigma)$ is convolved over each product to smooth local spatial variations:
  $$\langle I_x^2 \rangle = I_x^2 \ast w, \quad \langle I_y^2 \rangle = I_y^2 \ast w, \quad \langle I_x I_y \rangle = I_x I_y \ast w$$
- The structure tensor matrix at each pixel is:
  $$M = \begin{bmatrix} \langle I_x^2 \rangle & \langle I_x I_y \rangle \\ \langle I_x I_y \rangle & \langle I_y^2 \rangle \end{bmatrix}$$
- **Interactive Controls**: Gaussian integration window scale ($\sigma \in [0.5, 3.5]$).

#### Stage 3: Harris Corner Response Function ($R$)
- Rather than performing direct eigenvalue decomposition of $M$ (which is computationally expensive), the Harris response $R$ is computed using the determinant and trace:
  $$R = \det(M) - k \cdot (\text{trace}(M))^2$$
  where:
  $$\det(M) = \langle I_x^2 \rangle \langle I_y^2 \rangle - \langle I_x I_y \rangle^2$$
  $$\text{trace}(M) = \langle I_x^2 \rangle + \langle I_y^2 \rangle$$
- **Physical Interpretation**:
  - $R > 0$ (large positive): Corner feature (both eigenvalues $\lambda_1, \lambda_2$ are large).
  - $R < 0$ (large negative): Linear edge boundary ($\lambda_1 \gg \lambda_2$ or $\lambda_2 \gg \lambda_1$).
  - $|R| \approx 0$: Flat, homogeneous texture region.
- **Interactive Controls**: Empirical sensitivity parameter $k \in [0.01, 0.20]$ (canonical default $k = 0.04$).
- **Colorized Jet Heatmap**: Displays high corner responses in crimson/red, flat regions in cyan/green, and edges in dark blue.

#### Stage 4: Thresholding & Candidate Keypoint Clusters
- An adaptive threshold $T$ is applied to suppress flat regions, edges, and sensor noise:
  $$T = \tau \cdot \max_{(x,y)} R(x,y)$$
  where $\tau$ is a normalized sensitivity fraction ($0.1\%$ to $25\%$).
- Any pixel with $R(x,y) \ge T$ is marked as a candidate corner point.
- **Visual Display**: Highlights candidate clusters overlaid on the dimmed image.

#### Stage 5: Non-Maximum Suppression (NMS) & Final Keypoint Localization
- Multiple adjacent pixels within a corner cluster pass the threshold. Non-Maximum Suppression thins these clusters to precise single-pixel local maxima.
- Over a sliding spatial neighborhood $\mathcal{N}$ of radius $r$ (e.g. $3\times3$ to $15\times15$):
  $$\text{Keypoint at } (x,y) \iff R(x,y) = \max_{(dx, dy) \in \mathcal{N}} R(x+dx, y+dy) \quad \text{and} \quad R(x,y) \ge T$$
- **Interactive Keypoint Overlay Controls**:
  - Marker styles: Precision Reticle Target, Solid Dot, Crosshair, Diamond, Circle.
  - Marker colors: Crimson Red, Emerald Green, Cyan, Gold Yellow, Pure White, Obsidian Black.
  - **Isolated Mode**: Option to paint only corner keypoints on a clean black or white canvas, removing background image data.
  - **Live Keypoint Counter**: Displays the total count of localized corners in real time.

---

## 🖥️ Viewport & Interactive Features

- **Full-Height Responsive Viewport**: Maximizes vertical workspace for high-resolution inspection.
- **Pan & Zoom up to 1000%**: Smooth mouse-drag panning and fine zoom slider ($25\%$ to $1000\%$) for sub-pixel inspection.
- **Image Resolution Display**: Real-time display of uploaded image dimensions (e.g., `640 × 480`) centered in the stage header.
- **Curtain Split Slider & Multi-View**: Real-time before/after comparison divider, side-by-side view, and difference heatmap.
- **Independent Stage Export**: Every stage of the Harris pipeline and every filter view includes a dedicated PNG download button.
- **Built-in DIP Theory Reference**: Interactive modal detailing mathematical equations, spatial frequency concepts, and kernel matrices.

---

## 💻 Tech Stack & Performance

- **Framework:** React 18 with Vite
- **Styling:** Modular CSS3 with glassmorphic UI design tokens
- **Rendering:** HTML5 Canvas 2D Context with hardware-accelerated image buffers
- **Mathematical Layout:** Native MathML and KaTeX formatting
- **Icons:** Lucide React

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- `npm` or `pnpm`

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/askubaid/ComputerVision.git
cd ComputerVision

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
```

---

## 📜 Open Source & Contact

This project is open-source and free for academic, educational, and research use.

If you have any questions, suggestions, feedback, or collaboration ideas, feel free to contact:

- **Author:** **Ubaid ur Rehman**
- **Institution:** **Institute of Space Technology (IST), Islamabad, Pakistan**
- **Email:** [`askubaid@gmail.com`](mailto:askubaid@gmail.com)
