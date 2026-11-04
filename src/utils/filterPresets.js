/**
 * Spatial Filters Presets & Computer Vision Theoretical Metadata
 */

export const STUDIO_TABS = {
  FILTERS: 'filters',
  EDGE_DETECTION: 'edge_detection',
  CORNER_DETECTION: 'corner_detection'
};

export const FILTER_CATEGORIES = {
  LOW_PASS: 'low_pass',
  HIGH_PASS: 'high_pass',
  CUSTOM: 'custom',
  EDGE_DETECTION: 'edge_detection',
  CORNER_DETECTION: 'corner_detection'
};

export const FILTER_PRESETS = [
  // =========================================================================
  // TAB 1: FILTERS (SECTION 1: LOW-PASS)
  // =========================================================================
  {
    id: 'box_blur',
    name: 'Mean (Box) Filter',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.LOW_PASS,
    badge: 'Smoothing',
    tagline: 'Uniform spatial averaging for noise reduction and smoothing',
    description:
      'Replaces each pixel value with the average of its neighbors. Attenuates sharp intensity variations and high-frequency noise, at the cost of blurring object edges.',
    formula: 'h(x,y) = \\frac{1}{M \\times N} \\sum_{s,t} f(x+s, y+t)',
    frequencyResponse: 'Sinc function: H(u,v) = \\text{sinc}(u) \\text{sinc}(v) with side lobes',
    kernelType: 'box',
    defaultKernelSize: 3,
    supportsSizeSelection: true,
    availableSizes: [3, 5, 7],
    divisor: 9,
    bias: 0,
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]
  },
  {
    id: 'gaussian_blur',
    name: 'Gaussian Filter',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.LOW_PASS,
    badge: 'Optimal Blur',
    tagline: 'Isotropic 2D Gaussian distribution smoothing with edge preservation',
    description:
      'Weights neighborhood pixels by distance using a 2D Gaussian bell curve. Unlike box filters, Gaussian has no ringing artifacts because its Fourier transform is also a smooth Gaussian.',
    formula: 'G(x,y) = \\frac{1}{2\\pi\\sigma^2} e^{-\\frac{x^2+y^2}{2\\sigma^2}}',
    frequencyResponse: 'H(u,v) = e^{-2\\pi^2 \\sigma^2 (u^2 + v^2)} (No ringing)',
    kernelType: 'gaussian',
    defaultKernelSize: 3,
    supportsSizeSelection: true,
    availableSizes: [3, 5, 7],
    defaultSigma: 1.2,
    hasSigmaControl: true,
    divisor: 1,
    bias: 0,
    kernel: [
      [0.075, 0.124, 0.075],
      [0.124, 0.204, 0.124],
      [0.075, 0.124, 0.075]
    ]
  },
  {
    id: 'weighted_average',
    name: 'Weighted Average Filter',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.LOW_PASS,
    badge: 'Center Weighted',
    tagline: 'Integer approximation of Gaussian blur with binomial coefficients',
    description:
      'Gives greater weight to pixels near the center of the mask. Provides softer smoothing than a box filter and reduces blur distortion along boundaries.',
    formula: 'W = \\frac{1}{16} \\begin{bmatrix} 1 & 2 & 1 \\\\ 2 & 4 & 2 \\\\ 1 & 2 & 1 \\end{bmatrix}',
    frequencyResponse: 'Low-pass with reduced ripple compared to uniform averaging',
    kernelType: 'static',
    defaultKernelSize: 3,
    supportsSizeSelection: false,
    divisor: 16,
    bias: 0,
    kernel: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ]
  },
  {
    id: 'median_filter',
    name: 'Median Filter (Non-linear)',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.LOW_PASS,
    badge: 'Noise Removal',
    tagline: 'Rank-order non-linear filter for salt-and-pepper noise removal',
    description:
      'Replaces the central pixel with the median intensity in the window. Highly effective at stripping isolated impulse noise without blurring sharp step edges.',
    formula: 'g(x,y) = \\text{median}\\{f(x+s, y+t) \\mid (s,t) \\in S\\}',
    frequencyResponse: 'Non-linear order statistic filter (preserves step edges)',
    kernelType: 'median',
    defaultKernelSize: 3,
    supportsSizeSelection: true,
    availableSizes: [3, 5],
    divisor: 1,
    bias: 0,
    kernel: [
      ['med', 'med', 'med'],
      ['med', 'med', 'med'],
      ['med', 'med', 'med']
    ]
  },

  // =========================================================================
  // TAB 1: FILTERS (SECTION 2: HIGH-PASS)
  // =========================================================================
  {
    id: 'laplacian_4',
    name: 'Laplacian (4-Connected)',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.HIGH_PASS,
    badge: '2nd Derivative',
    tagline: 'Isotropic second-order derivative highlighting rapid intensity changes',
    description:
      'Measures the second spatial derivative of the image intensity. Yields zero in uniform regions, positive on one side of an edge, and negative on the other (zero-crossing detector).',
    formula: '\\nabla^2 f = \\frac{\\partial^2 f}{\\partial x^2} + \\frac{\\partial^2 f}{\\partial y^2}',
    frequencyResponse: 'H(u,v) \\propto -(u^2 + v^2) (Zero response at DC, high gain at high frequencies)',
    kernelType: 'static',
    defaultKernelSize: 3,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 128,
    kernel: [
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0]
    ]
  },
  {
    id: 'laplacian_8',
    name: 'Laplacian (8-Connected)',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.HIGH_PASS,
    badge: 'Isotropic Edge',
    tagline: '8-neighbor omnidirectional second-derivative operator',
    description:
      'Includes diagonal neighbor derivatives for true rotationally invariant edge detection. Accentuates all sharp edges regardless of their orientation.',
    formula: '\\nabla^2_8 f = \\sum_{(s,t) \\in N_8} f(x+s,y+t) - 8f(x,y)',
    frequencyResponse: 'High-pass filter with enhanced isotropic frequency response',
    kernelType: 'static',
    defaultKernelSize: 3,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 128,
    kernel: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1]
    ]
  },
  {
    id: 'laplacian_sharpen',
    name: 'Laplacian Sharpening',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.HIGH_PASS,
    badge: 'Detail Boost',
    tagline: 'Original image minus Laplacian for crisp edge enhancement',
    description:
      'Combines original image intensities with the negative Laplacian: g(x,y) = f(x,y) - ∇²f(x,y). Sharpens blurred outlines while maintaining background brightness.',
    formula: 'g(x,y) = f(x,y) - \\nabla^2 f(x,y)',
    frequencyResponse: 'H_{sharp}(u,v) = 1 + c(u^2 + v^2)',
    kernelType: 'static',
    defaultKernelSize: 3,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 0,
    kernel: [
      [-1, -1, -1],
      [-1, 9, -1],
      [-1, -1, -1]
    ]
  },
  {
    id: 'high_boost',
    name: 'High-Boost / Unsharp Mask',
    tab: STUDIO_TABS.FILTERS,
    category: FILTER_CATEGORIES.HIGH_PASS,
    badge: 'Tunable Boost',
    tagline: 'Unsharp masking with amplification factor k for fine detail recovery',
    description:
      'Subtracts a smoothed version of the image to obtain a high-frequency mask, then amplifies and adds it back: f_hb = f + k * (f - f_blur). When k=1, this is unsharp masking; when k>1, high-boost.',
    formula: 'f_{\\text{hb}}(x,y) = f(x,y) + k \\cdot [f(x,y) - \\bar{f}(x,y)]',
    frequencyResponse: 'Composite filter: Low frequencies scaled by 1, high frequencies boosted by (1 + k)',
    kernelType: 'high_boost',
    hasBoostControl: true,
    defaultBoostK: 1.8,
    defaultKernelSize: 3,
    supportsSizeSelection: true,
    availableSizes: [3, 5],
    divisor: 1,
    bias: 0,
    kernel: [
      [-0.1, -0.2, -0.1],
      [-0.2, 2.2, -0.2],
      [-0.1, -0.2, -0.1]
    ]
  },

  // =========================================================================
  // TAB 2: EDGE DETECTION (Prewitt, Sobel, Canny)
  // =========================================================================
  {
    id: 'prewitt_gradient',
    name: 'Prewitt Edge Detector',
    tab: STUDIO_TABS.EDGE_DETECTION,
    category: FILTER_CATEGORIES.EDGE_DETECTION,
    badge: 'Gradient Mask',
    tagline: 'Differential operator for boundary detection without extra center weighting',
    description:
      'Discrete gradient operator utilizing uniform perpendicular averaging [-1 0 1]. Computes orthogonal gradient components Gx and Gy with tunable contrast gain.',
    formula: 'G_x = \\begin{bmatrix} -1 & 0 & 1 \\\\ -1 & 0 & 1 \\\\ -1 & 0 & 1 \\end{bmatrix}, \\quad G_y = \\begin{bmatrix} -1 & -1 & -1 \\\\ 0 & 0 & 0 \\\\ 1 & 1 & 1 \\end{bmatrix}',
    frequencyResponse: 'Directional difference operator with uniform perpendicular integration',
    kernelType: 'gradient',
    hasGradientModes: true,
    defaultGradientMode: 'magnitude',
    defaultGain: 1.0,
    hasGainControl: true,
    defaultKernelSize: 3,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 0,
    kernelX: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1]
    ],
    kernelY: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1]
    ],
    kernel: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1]
    ]
  },
  {
    id: 'sobel_gradient',
    name: 'Sobel Edge Detector',
    tab: STUDIO_TABS.EDGE_DETECTION,
    category: FILTER_CATEGORIES.EDGE_DETECTION,
    badge: '1st Derivative',
    tagline: 'Discrete gradient operator with Gaussian smoothing in perpendicular direction',
    description:
      'Calculates the gradient vector [Gx, Gy] with center weighting. Computes gradient magnitude M(x,y) = sqrt(Gx² + Gy²) to reveal edge boundaries with high noise immunity.',
    formula: 'M(x,y) = \\sqrt{G_x^2 + G_y^2}, \\quad \\theta = \\arctan(G_y / G_x)',
    frequencyResponse: 'Directional derivative combined with triangular low-pass smoothing',
    kernelType: 'gradient',
    hasGradientModes: true,
    defaultGradientMode: 'magnitude',
    defaultGain: 1.0,
    hasGainControl: true,
    defaultKernelSize: 3,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 0,
    kernelX: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ],
    kernelY: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ],
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ]
  },
  {
    id: 'canny_edge',
    name: 'Canny Edge Detector',
    tab: STUDIO_TABS.EDGE_DETECTION,
    category: FILTER_CATEGORIES.EDGE_DETECTION,
    badge: 'Multi-Stage Optimal',
    tagline: 'Optimal edge detection with Gaussian blur, NMS & hysteresis tracking',
    description:
      'John F. Canny (1986) multi-stage edge detector. Applies Gaussian pre-smoothing, Sobel gradients, Non-Maximum Suppression (thinning to 1-pixel width), and double thresholding with hysteresis edge linking.',
    formula: '\\text{Canny} = \\text{Hysteresis}(\\text{NMS}(\\|\\nabla(G_\\sigma * I)\\|), T_{\\text{low}}, T_{\\text{high}})',
    frequencyResponse: 'Optimal trade-off between low error rate, precise localization, and single response',
    kernelType: 'canny',
    hasCannyControls: true,
    defaultLowThreshold: 30,
    defaultHighThreshold: 80,
    defaultSigma: 1.2,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 0,
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ]
  },

  // =========================================================================
  // TAB 3: CORNER DETECTION (Harris)
  // =========================================================================
  {
    id: 'harris_corner',
    name: 'Harris Corner Detector',
    tab: STUDIO_TABS.CORNER_DETECTION,
    category: FILTER_CATEGORIES.CORNER_DETECTION,
    badge: 'Feature Keypoints',
    tagline: 'Structure tensor eigenvalues measuring omnidirectional intensity variance',
    description:
      'Chris Harris & Mike Stephens (1988) corner detector. Computes local auto-correlation structure matrix M from spatial derivatives Ix and Iy. Detects distinctive keypoints where image gradient varies in all directions.',
    formula: 'R = \\det(M) - k \\cdot (\\text{trace}(M))^2, \\quad M = \\begin{bmatrix} \\langle I_x^2 \\rangle & \\langle I_x I_y \\rangle \\\\ \\langle I_x I_y \\rangle & \\langle I_y^2 \\rangle \\end{bmatrix}',
    frequencyResponse: '2D structure tensor curvature analysis with local non-maximum suppression',
    kernelType: 'harris',
    hasHarrisControls: true,
    defaultHarrisK: 0.04,
    defaultHarrisSensitivity: 35,
    supportsSizeSelection: false,
    divisor: 1,
    bias: 0,
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ]
  }
];

export const DEFAULT_CUSTOM_KERNEL = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0]
];
