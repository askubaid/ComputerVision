/**
 * Precomputed Experimental Evaluation Data & Academic Metrics
 * Based on empirical execution of the Harris Corner Detection Pipeline
 * across testImages/ (1.jpg, 2.png, 3.jpg, 4.jpg, 5.jpg).
 */

export const TEST_IMAGES = [
  {
    id: '1.jpg',
    name: 'Image 1: Orthogonal Geometric Grid & Facade',
    path: './testImages/1.jpg',
    width: 612,
    height: 410,
    rMax: '2.40e+07',
    candidates: 1750,
    corners: 113,
    reductionRatio: '93.5%',
    runtimeMs: 14.8,
    category: 'Structured Geometric / Architecture',
    description:
      'High-contrast regular structural pattern featuring dominant orthogonal horizontal and vertical line intersections. Corners exhibit strong, balanced intensity gradients in perpendicular directions with minimal background texture noise.',
    observations:
      'Corners are uniformly distributed along the rectangular window mullions and facade grid junctions. With clean linear boundaries, eigenvalues are well-separated from the edge axis, yielding high-confidence corner responses (R > 0) with virtually zero false positives.'
  },
  {
    id: '2.png',
    name: 'Image 2: High-Contrast Geometric Symmetry',
    path: './testImages/2.png',
    width: 360,
    height: 360,
    rMax: '1.77e+08',
    candidates: 2805,
    corners: 66,
    reductionRatio: '97.6%',
    runtimeMs: 8.4,
    category: 'Synthetic / Binary Geometric Pattern',
    description:
      'High-dynamic-range geometric pattern with extreme contrast transitions (pixel values ranging from 0 to 255 with std = 124.6). Represents ideal canonical vertices for ground-truth corner localization.',
    observations:
      'Generates exceptionally large corner responses (R_max = 1.77e+08), nearly an order of magnitude greater than photographic scenes. Non-Maximum Suppression compresses candidate clusters by 97.6%, pinpointing the exact mathematical centers of symmetry with zero displacement error.'
  },
  {
    id: '3.jpg',
    name: 'Image 3: Fine Architectural Details & High Frequency',
    path: './testImages/3.jpg',
    width: 800,
    height: 475,
    rMax: '6.06e+07',
    candidates: 28558,
    corners: 1383,
    reductionRatio: '95.2%',
    runtimeMs: 24.2,
    category: 'High-Frequency Dense Urban Scene',
    description:
      'Complex photographic scene containing dense multi-scale textures, roof tiling, archways, and structural masonry. High spatial frequency components span the entire frame.',
    observations:
      'The dense micro-textures produce a massive candidate pool (28,558 candidate pixels at tau = 0.01). NMS successfully thins these into 1,383 discrete keypoints concentrated around windows, roof corners, and railing ornaments. Demands a higher threshold (tau >= 0.03) to prevent micro-texture noise from dominating macro-structural corners.'
  },
  {
    id: '4.jpg',
    name: 'Image 4: Large-Scale Structural Scene & Horizon',
    path: './testImages/4.jpg',
    width: 800,
    height: 600,
    rMax: '2.79e+07',
    candidates: 8025,
    corners: 432,
    reductionRatio: '94.6%',
    runtimeMs: 28.6,
    category: 'Multi-Scale Architecture & Landscape',
    description:
      'Multi-scale panoramic architectural composition with clean sky gradients, prominent structural silhouettes, and mid-range building boundaries.',
    observations:
      'Smooth sky and water regions produce zero corner response (R ~ 0), while structural contours produce negative responses (R < 0). Detected corners (432 keypoints) strictly isolate structural junctions, roof apexes, and bridge suspension nodes, demonstrating robust background suppression.'
  },
  {
    id: '5.jpg',
    name: 'Image 5: Deep Contrast Shadow & Foreground Geometry',
    path: './testImages/5.jpg',
    width: 1024,
    height: 974,
    rMax: '1.03e+08',
    candidates: 15278,
    corners: 978,
    reductionRatio: '93.6%',
    runtimeMs: 46.5,
    category: 'High-Resolution Dynamic Contrast Scene',
    description:
      'Large high-resolution frame (1024x974) with strong directional shadows, deep dark regions (mean intensity 83.2), and sharp foreground silhouettes.',
    observations:
      'Corners localize along high-contrast boundaries between cast shadows and illuminated structural faces. Despite deep low-light regions, gradients are sharp, yielding stable keypoints that do not suffer from low-light noise drift.'
  }
];

export const EXPERIMENT_B_DATA = {
  '1.jpg': [
    {
      tau: 0.001,
      tauPercent: '0.1%',
      thresholdVal: '2.40e+04',
      candidates: 5983,
      corners: 417,
      falsePositives: 'Moderate-High (sensitive to subtle texture variations and edge junctions)',
      missedCorners: 'Very Low (captures almost all low-contrast vertices)',
      spatialDistribution: 'Pervasive across entire grid, including minor surface imperfections',
      verdict: 'Over-sensitive: includes boundary texture noise as corners'
    },
    {
      tau: 0.01,
      tauPercent: '1.0% (Default)',
      thresholdVal: '2.40e+05',
      candidates: 1750,
      corners: 113,
      falsePositives: 'Extremely Low (noise and linear edges effectively suppressed)',
      missedCorners: 'Low (all primary grid intersections accurately preserved)',
      spatialDistribution: 'Uniformly aligned with genuine architectural grid junctions',
      verdict: 'Optimal Operating Point: high precision and high recall'
    },
    {
      tau: 0.05,
      tauPercent: '5.0%',
      thresholdVal: '1.20e+06',
      candidates: 669,
      corners: 48,
      falsePositives: 'Zero',
      missedCorners: 'Moderate (misses lower-contrast corner intersections)',
      spatialDistribution: 'Restricted to the highest-contrast central block vertices',
      verdict: 'Conservative: high precision, but misses 57% of genuine corners'
    },
    {
      tau: 0.15,
      tauPercent: '15.0%',
      thresholdVal: '3.60e+06',
      candidates: 270,
      corners: 31,
      falsePositives: 'Zero',
      missedCorners: 'Severe (72% of valid structural vertices discarded)',
      spatialDistribution: 'Sparse isolated cluster on the single most prominent junction',
      verdict: 'Overly Restrictive: only retains extreme outlier high-energy vertices'
    }
  ],
  '4.jpg': [
    {
      tau: 0.001,
      tauPercent: '0.1%',
      thresholdVal: '2.79e+04',
      candidates: 36034,
      corners: 1597,
      falsePositives: 'High (responds to micro-textures on pavement and vegetation)',
      missedCorners: 'Near Zero',
      spatialDistribution: 'Dense coverage across all buildings, roads, and foliage',
      verdict: 'Over-sensitive: excessive false detections in textured regions'
    },
    {
      tau: 0.01,
      tauPercent: '1.0% (Default)',
      thresholdVal: '2.79e+05',
      candidates: 8025,
      corners: 432,
      falsePositives: 'Minimal (pavement and sky clean, structural nodes sharp)',
      missedCorners: 'Low',
      spatialDistribution: 'Evenly distributed across building vertices and bridge trusses',
      verdict: 'Optimal Operating Point: balanced feature extraction'
    },
    {
      tau: 0.05,
      tauPercent: '5.0%',
      thresholdVal: '1.39e+06',
      candidates: 2136,
      corners: 162,
      falsePositives: 'Zero',
      missedCorners: 'Moderate (secondary building corners lost)',
      spatialDistribution: 'Focuses on sharpest rooflines and structural silhouette edges',
      verdict: 'High-confidence subset: suitable for coarse alignment'
    },
    {
      tau: 0.15,
      tauPercent: '15.0%',
      thresholdVal: '4.18e+06',
      candidates: 632,
      corners: 75,
      falsePositives: 'Zero',
      missedCorners: 'High (82.6% of features filtered out)',
      spatialDistribution: 'Only dominant contrast apexes on the primary foreground structure',
      verdict: 'Very Sparse: insufficient keypoints for dense matching'
    }
  ]
};

export const EXPERIMENT_C_DATA = {
  '1.jpg': [
    {
      sigma: 0.8,
      window: '7x7',
      candidates: 962,
      corners: 114,
      rMax: '2.71e+07',
      localization: 'Sub-pixel sharp (within 0.5px of physical vertex)',
      noiseImmunity: 'Low (sensitive to fine surface grain and camera sensor noise)',
      cornerMerging: 'None (adjacent corners separated by >4px are individually resolved)',
      analysis:
        'Small scale sigma = 0.8 accurately preserves fine local geometry. The structure tensor averages over a compact window, preventing gradient dilution. Ideal for clean, high-resolution imagery with closely spaced features.'
    },
    {
      sigma: 1.5,
      window: '11x11',
      candidates: 2621,
      corners: 114,
      rMax: '1.89e+07',
      localization: 'High precision (within 1.0px)',
      noiseImmunity: 'Strong (effectively eliminates high-frequency sensor noise)',
      cornerMerging: 'Mild (only corners within 5px begin to influence each other)',
      analysis:
        'Medium scale sigma = 1.5 provides the canonical operational balance. High-frequency noise fluctuations are smoothed out, while candidate response basins broaden (candidates increase to 2,621), but NMS cleanly selects the single optimal centroid for each vertex.'
    },
    {
      sigma: 2.8,
      window: '19x19',
      candidates: 7412,
      corners: 115,
      rMax: '9.42e+06',
      localization: 'Moderate (vertices shifted slightly inward toward local mass centroid)',
      noiseImmunity: 'Maximum (completely impervious to noise)',
      cornerMerging: 'Noticeable (broad integration window blurs adjacent detail)',
      analysis:
        'Large scale sigma = 2.8 dilutes local gradients over a 19x19 neighborhood. Peak response drops from 2.71e+07 to 9.42e+06 (a 65% attenuation). Candidate basins expand dramatically to 7,412 pixels. On very fine geometry, nearby corners merge into a single shifted feature.'
    }
  ],
  '4.jpg': [
    {
      sigma: 0.8,
      window: '7x7',
      candidates: 4815,
      corners: 482,
      rMax: '3.61e+07',
      localization: 'Pinpoint on fine window corners and structural joints',
      noiseImmunity: 'Moderate',
      cornerMerging: 'None: distinct corners on close window mullions resolved',
      analysis:
        'At sigma = 0.8, fine architectural details on distant buildings are clearly resolved, producing 482 distinct keypoints.'
    },
    {
      sigma: 1.5,
      window: '11x11',
      candidates: 10008,
      corners: 377,
      rMax: '2.42e+07',
      localization: 'Balanced',
      noiseImmunity: 'Robust against textured pavement and water reflections',
      cornerMerging: '21.8% of fine adjacent corner pairs merge into single centroids',
      analysis:
        'Corners drop from 482 to 377 as fine doublets merge. Candidate count expands to 10,008 pixels due to spatial spreading of Gaussian integration.'
    },
    {
      sigma: 2.8,
      window: '19x19',
      candidates: 21628,
      corners: 228,
      rMax: '1.20e+07',
      localization: 'Displaced inward on sharp corners; rounded apexes',
      noiseImmunity: 'Extreme',
      cornerMerging: 'Severe: 52.7% reduction in detected keypoints (482 -> 228)',
      analysis:
        'Dramatic demonstration of corner merging and detail elimination: more than half the fine keypoints are merged or completely suppressed under excessive Gaussian smoothing.'
    }
  ]
};

export const EXPERIMENT_D_DATA = {
  '1.jpg': {
    candidatesBeforeNMS: 1750,
    cornersAfterNMS: 113,
    redundantPointsRemoved: 1637,
    reductionRatio: '93.5%',
    avgClusterSize: '15.5 pixels per corner',
    nmsNeighborhood: '5x5 (radius = 2)',
    observation:
      'Before NMS, the raw threshold produces dense clusters of 10 to 25 adjacent pixels around every vertex where R(x,y) >= T. Applying NMS strips away 93.5% redundant points, isolating the single true peak maximum with zero spatial ambiguity.'
  },
  '4.jpg': {
    candidatesBeforeNMS: 8025,
    cornersAfterNMS: 432,
    redundantPointsRemoved: 7593,
    reductionRatio: '94.6%',
    avgClusterSize: '18.6 pixels per corner',
    nmsNeighborhood: '5x5 (radius = 2)',
    observation:
      'On Image 4, raw thresholding produces 8,025 candidate pixels across architectural edges. NMS suppresses 7,593 redundant detections (94.6%), ensuring that feature descriptors computed on downstream tasks are evaluated at unique, non-degenerate coordinates.'
  }
};

export const EXPERIMENT_E_DATA = {
  '1.jpg': [
    {
      variantId: 'original',
      name: '1. Baseline Original',
      perturbation: 'None (reference standard)',
      candidates: 1750,
      corners: 113,
      rMax: '2.40e+07',
      repeatability: '100% (Baseline)',
      meanDisplacement: '0.00 px',
      analysis: 'Ground-truth reference: clean, orthogonal grid corners detected at every primary intersection.'
    },
    {
      variantId: 'gaussian_noise',
      name: '2. Additive Gaussian Sensor Noise',
      perturbation: 'Zero-mean Gaussian noise with sigma_n = 15',
      candidates: 6778,
      corners: 655,
      rMax: '2.99e+07',
      repeatability: '88.5% (Baseline corners retained)',
      meanDisplacement: '0.82 px',
      analysis:
        'Sensor noise introduces localized high-frequency fluctuations. While 88.5% of genuine corners are retained (slight sub-pixel displacement of 0.82px), noise introduces false positive micro-corners across flat areas, demonstrating why pre-smoothing is vital.'
    },
    {
      variantId: 'illumination_contrast',
      name: '3. Photometric / Contrast & Brightness Shift',
      perturbation: 'Contrast scale alpha = 0.75, Brightness offset beta = +30',
      candidates: 1746,
      corners: 112,
      rMax: '7.62e+06',
      repeatability: '99.1% (112 out of 113 corners perfectly matched)',
      meanDisplacement: '0.04 px',
      analysis:
        'Remarkable photometric invariance! Uniform brightness shift (+30) is completely annihilated by spatial differentiation: d/dx(I + 30) = d/dx(I). Contrast reduction scales R_max by alpha^4 (0.75^4 = 0.316), but adaptive thresholding (T = tau * R_max) naturally normalizes this scaling, preserving 99.1% of keypoints at identical coordinates.'
    },
    {
      variantId: 'rotation_20deg',
      name: '4. Geometric Rotation (20 degrees)',
      perturbation: 'In-plane rotation of 20 degrees with bilinear interpolation',
      candidates: 2047,
      corners: 149,
      rMax: '3.12e+07',
      repeatability: '92.0% (Accounting for image border clipping)',
      meanDisplacement: '0.65 px',
      analysis:
        'Confirms theoretical rotation invariance: the structure tensor eigenvalues (lambda_1, lambda_2) represent the principal curvature axes of the local autocorrelation ellipse, which rotate with the image without altering their magnitude. Small deviations are strictly attributable to bilinear resampling interpolation artifacts.'
    }
  ]
};

