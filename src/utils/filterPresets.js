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
  // TAB 2: EDGE DETECTION (Prewitt, Sobel)
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
