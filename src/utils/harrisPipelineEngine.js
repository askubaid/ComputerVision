/**
 * Harris Corner Detection Multi-Stage Pipeline Engine
 * Strictly written according to assignment specifications without ready-made/built-in detectors.
 */

import { generateGaussianKernel, clamp } from './filterEngine';

/**
 * Stage 1: Compute Horizontal and Vertical Intensity Gradients (Ix, Iy)
 * @param {ImageData} srcData - Grayscale source image
 * @param {string} operator - 'sobel' | 'differences'
 * @returns {object} Gradient arrays and visualized ImageData objects
 */
export function computeGradients(srcData, operator = 'sobel') {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const totalPixels = width * height;

  // Extract luminance array
  const gray = new Float32Array(totalPixels);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    gray[p] = src[i];
  }

  const ix = new Float32Array(totalPixels);
  const iy = new Float32Array(totalPixels);
  const mag = new Float32Array(totalPixels);

  if (operator === 'differences') {
    // Central finite differences: f'(x) ≈ (f(x+1) - f(x-1)) / 2
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const xPrev = Math.max(0, x - 1);
        const xNext = Math.min(width - 1, x + 1);
        const yPrev = Math.max(0, y - 1);
        const yNext = Math.min(height - 1, y + 1);

        const gx = (gray[rowOffset + xNext] - gray[rowOffset + xPrev]) * 0.5;
        const gy = (gray[yNext * width + x] - gray[yPrev * width + x]) * 0.5;

        const idx = rowOffset + x;
        ix[idx] = gx;
        iy[idx] = gy;
        mag[idx] = Math.hypot(gx, gy);
      }
    }
  } else {
    // 3x3 Sobel kernels
    const kx = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    const ky = [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1]
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let gx = 0;
        let gy = 0;

        for (let dy = -1; dy <= 1; dy++) {
          const py = Math.min(Math.max(y + dy, 0), height - 1);
          const rowOffset = py * width;
          const kRowX = kx[dy + 1];
          const kRowY = ky[dy + 1];

          for (let dx = -1; dx <= 1; dx++) {
            const px = Math.min(Math.max(x + dx, 0), width - 1);
            const val = gray[rowOffset + px];
            gx += val * kRowX[dx + 1];
            gy += val * kRowY[dx + 1];
          }
        }

        // Scale by 1/4 to normalize Sobel derivative magnitude
        gx *= 0.25;
        gy *= 0.25;

        const idx = y * width + x;
        ix[idx] = gx;
        iy[idx] = gy;
        mag[idx] = Math.hypot(gx, gy);
      }
    }
  }

  // Generate visualization ImageData objects
  // Mode 1: Bipolar (0 mapped to mid-gray 128)
  const ixBipolarImg = new ImageData(width, height);
  const iyBipolarImg = new ImageData(width, height);
  const magImg = new ImageData(width, height);

  const dIx = ixBipolarImg.data;
  const dIy = iyBipolarImg.data;
  const dMag = magImg.data;

  // Find max magnitude for normalization
  let maxMag = 0.001;
  for (let p = 0; p < totalPixels; p++) {
    if (mag[p] > maxMag) maxMag = mag[p];
  }

  for (let p = 0; p < totalPixels; p++) {
    const dstIdx = p * 4;

    // Ix: -128..+128 mapped to 0..255 (128 = flat/no gradient)
    const valX = clamp(ix[p] * 2.0 + 128);
    dIx[dstIdx] = valX;
    dIx[dstIdx + 1] = valX;
    dIx[dstIdx + 2] = valX;
    dIx[dstIdx + 3] = 255;

    // Iy: -128..+128 mapped to 0..255
    const valY = clamp(iy[p] * 2.0 + 128);
    dIy[dstIdx] = valY;
    dIy[dstIdx + 1] = valY;
    dIy[dstIdx + 2] = valY;
    dIy[dstIdx + 3] = 255;

    // Gradient Magnitude: scaled 0..255
    const valMag = clamp((mag[p] / maxMag) * 255);
    dMag[dstIdx] = valMag;
    dMag[dstIdx + 1] = valMag;
    dMag[dstIdx + 2] = valMag;
    dMag[dstIdx + 3] = 255;
  }

  return {
    width,
    height,
    ix,
    iy,
    mag,
    maxMag,
    ixImg: ixBipolarImg,
    iyImg: iyBipolarImg,
    magImg: magImg
  };
}

/**
 * Stage 2: Construct the Structure Tensor (Second-Moment Matrix) with Gaussian Smoothing
 */
export function computeStructureTensor(ix, iy, width, height, kernelSize = 5, sigma = 1.4) {
  const totalPixels = width * height;
  const ixx = new Float32Array(totalPixels);
  const iyy = new Float32Array(totalPixels);
  const ixy = new Float32Array(totalPixels);

  // Raw gradient products
  for (let p = 0; p < totalPixels; p++) {
    const x = ix[p];
    const y = iy[p];
    ixx[p] = x * x;
    iyy[p] = y * y;
    ixy[p] = x * y;
  }

  // Gaussian filter on tensor elements
  const { kernel: gKernel } = generateGaussianKernel(kernelSize, sigma);
  const halfG = Math.floor(kernelSize / 2);

  const sIxx = new Float32Array(totalPixels);
  const sIyy = new Float32Array(totalPixels);
  const sIxy = new Float32Array(totalPixels);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumXX = 0, sumYY = 0, sumXY = 0;

      for (let ky = -halfG; ky <= halfG; ky++) {
        const py = Math.min(Math.max(y + ky, 0), height - 1);
        const rowOffset = py * width;
        const kRow = gKernel[ky + halfG];

        for (let kx = -halfG; kx <= halfG; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const pIdx = rowOffset + px;
          const w = kRow[kx + halfG];

          sumXX += ixx[pIdx] * w;
          sumYY += iyy[pIdx] * w;
          sumXY += ixy[pIdx] * w;
        }
      }

      const idx = y * width + x;
      sIxx[idx] = sumXX;
      sIyy[idx] = sumYY;
      sIxy[idx] = sumXY;
    }
  }

  // Find max values for normalized visualization
  let maxXX = 0.001, maxYY = 0.001, maxXY = 0.001;
  for (let p = 0; p < totalPixels; p++) {
    if (sIxx[p] > maxXX) maxXX = sIxx[p];
    if (sIyy[p] > maxYY) maxYY = sIyy[p];
    const aXY = Math.abs(sIxy[p]);
    if (aXY > maxXY) maxXY = aXY;
  }

  // Visualizations
  const ixxImg = new ImageData(width, height);
  const iyyImg = new ImageData(width, height);
  const ixyImg = new ImageData(width, height);
  const compositeImg = new ImageData(width, height);

  const dXX = ixxImg.data;
  const dYY = iyyImg.data;
  const dXY = ixyImg.data;
  const dComp = compositeImg.data;

  for (let p = 0; p < totalPixels; p++) {
    const dstIdx = p * 4;

    const vXX = clamp((sIxx[p] / maxXX) * 255);
    dXX[dstIdx] = vXX; dXX[dstIdx + 1] = vXX; dXX[dstIdx + 2] = vXX; dXX[dstIdx + 3] = 255;

    const vYY = clamp((sIyy[p] / maxYY) * 255);
    dYY[dstIdx] = vYY; dYY[dstIdx + 1] = vYY; dYY[dstIdx + 2] = vYY; dYY[dstIdx + 3] = 255;

    // Ixy has both signs -> midgray centered
    const vXY = clamp((sIxy[p] / maxXY) * 127 + 128);
    dXY[dstIdx] = vXY; dXY[dstIdx + 1] = vXY; dXY[dstIdx + 2] = vXY; dXY[dstIdx + 3] = 255;

    // Composite: R = Ixx, G = Iyy, B = |Ixy|
    dComp[dstIdx] = vXX;
    dComp[dstIdx + 1] = vYY;
    dComp[dstIdx + 2] = clamp((Math.abs(sIxy[p]) / maxXY) * 255);
    dComp[dstIdx + 3] = 255;
  }

  return {
    sIxx,
    sIyy,
    sIxy,
    ixxImg,
    iyyImg,
    ixyImg,
    compositeImg
  };
}

/**
 * Stage 3: Compute the Harris Response Map R = det(M) - k*(trace(M))^2
 */
export function computeHarrisResponse(sIxx, sIyy, sIxy, width, height, k = 0.04) {
  const totalPixels = width * height;
  const rMap = new Float32Array(totalPixels);

  let maxR = 0;
  let minR = 0;

  for (let p = 0; p < totalPixels; p++) {
    const A = sIxx[p];
    const B = sIyy[p];
    const C = sIxy[p];

    // det(M) = A*B - C^2
    const det = A * B - C * C;
    // trace(M) = A + B
    const trace = A + B;
    // R = det - k * trace^2
    const R = det - k * (trace * trace);
    rMap[p] = R;

    if (R > maxR) maxR = R;
    if (R < minR) minR = R;
  }

  // Generate Response Heatmap Image
  // Interpretation:
  // R > 0 (Corners) -> Warm Yellow to Bright Red
  // R < 0 (Edges)   -> Deep Blue to Cyan
  // R ~ 0 (Flat)    -> Dark Slate / Black
  const heatmapImg = new ImageData(width, height);
  const cornernessImg = new ImageData(width, height);

  const dHeat = heatmapImg.data;
  const dCorn = cornernessImg.data;

  const posScale = maxR > 0 ? 1 / maxR : 1;
  const negScale = minR < 0 ? 1 / Math.abs(minR) : 1;

  for (let p = 0; p < totalPixels; p++) {
    const dstIdx = p * 4;
    const R = rMap[p];

    if (R > 0) {
      // Corner: Golden Yellow to Bright Orange-Red
      const norm = Math.min(1.0, Math.pow(R * posScale, 0.45)); // Gamma boost for visual clarity
      dHeat[dstIdx] = clamp(255 * norm);
      dHeat[dstIdx + 1] = clamp(200 * (1 - norm * 0.4));
      dHeat[dstIdx + 2] = clamp(20 * (1 - norm));
      dHeat[dstIdx + 3] = 255;

      const cVal = clamp(norm * 255);
      dCorn[dstIdx] = cVal;
      dCorn[dstIdx + 1] = cVal;
      dCorn[dstIdx + 2] = cVal;
      dCorn[dstIdx + 3] = 255;
    } else if (R < 0) {
      // Edge: Deep Blue to Cyan
      const norm = Math.min(1.0, Math.pow(Math.abs(R) * negScale, 0.45));
      dHeat[dstIdx] = clamp(15 * (1 - norm));
      dHeat[dstIdx + 1] = clamp(100 * norm);
      dHeat[dstIdx + 2] = clamp(235 * norm);
      dHeat[dstIdx + 3] = 255;

      dCorn[dstIdx] = 0;
      dCorn[dstIdx + 1] = 0;
      dCorn[dstIdx + 2] = 0;
      dCorn[dstIdx + 3] = 255;
    } else {
      // Flat: Dark neutral
      dHeat[dstIdx] = 15;
      dHeat[dstIdx + 1] = 23;
      dHeat[dstIdx + 2] = 42;
      dHeat[dstIdx + 3] = 255;

      dCorn[dstIdx] = 0;
      dCorn[dstIdx + 1] = 0;
      dCorn[dstIdx + 2] = 0;
      dCorn[dstIdx + 3] = 255;
    }
  }

  return {
    rMap,
    maxR,
    minR,
    heatmapImg,
    cornernessImg
  };
}

/**
 * Stage 4: Threshold the Response Map to Select Candidate Corners (Shows Clusters Before NMS)
 */
export function applyHarrisThreshold(
  rMap,
  maxR,
  width,
  height,
  srcData,
  thresholdRatio = 0.05, // Fraction of maxR
  bgMode = 'overlay',    // 'overlay' | 'black' | 'white'
  markerColor = 'gold'
) {
  const thresholdVal = Math.max(0.0001, maxR * thresholdRatio);
  const totalPixels = width * height;
  const candidatePoints = [];

  const outputImg = new ImageData(width, height);
  const dst = outputImg.data;
  const src = srcData.data;

  // Background initialization
  if (bgMode === 'black') {
    dst.fill(0);
    for (let i = 3; i < dst.length; i += 4) dst[i] = 255;
  } else if (bgMode === 'white') {
    dst.fill(255);
  } else {
    dst.set(src);
  }

  // Color selection
  let mR = 250, mG = 204, mB = 21; // Gold
  if (markerColor === 'red') {
    mR = 255; mG = 30; mB = 40;
  } else if (markerColor === 'cyan') {
    mR = 6; mG = 214; mB = 240;
  } else if (markerColor === 'green') {
    mR = 16; mG = 235; mB = 80;
  }

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (rMap[idx] >= thresholdVal) {
        candidatePoints.push({ x, y, r: rMap[idx] });

        // Highlight candidate pixel directly (showing raw clustering)
        const dstIdx = idx * 4;
        dst[dstIdx] = mR;
        dst[dstIdx + 1] = mG;
        dst[dstIdx + 2] = mB;
        dst[dstIdx + 3] = 255;
      }
    }
  }

  return {
    thresholdVal,
    candidatePoints,
    candidateCount: candidatePoints.length,
    thresholdImg: outputImg
  };
}

/**
 * Stage 5: Non-Maximum Suppression (NMS) to Localize Sharp Corners
 */
export function applyNMS(
  rMap,
  candidatePoints,
  width,
  height,
  srcData,
  nmsRadius = 3,         // Neighborhood radius (e.g. 3 = 7x7 window)
  markerStyle = 'target', // 'point' | 'target' | 'cross' | 'dot'
  markerColor = 'red',
  bgMode = 'overlay'      // 'overlay' | 'black' | 'white'
) {
  const finalCorners = [];

  for (const { x, y, r } of candidatePoints) {
    if (x < nmsRadius || x >= width - nmsRadius || y < nmsRadius || y >= height - nmsRadius) {
      continue;
    }

    let isLocalMax = true;

    // Check (2*radius + 1) neighborhood
    for (let dy = -nmsRadius; dy <= nmsRadius; dy++) {
      const rowOffset = (y + dy) * width;
      for (let dx = -nmsRadius; dx <= nmsRadius; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (rMap[rowOffset + (x + dx)] > r) {
          isLocalMax = false;
          break;
        }
      }
      if (!isLocalMax) break;
    }

    if (isLocalMax) {
      finalCorners.push({ x, y, r });
    }
  }

  // Render output image
  const outputImg = new ImageData(width, height);
  const dst = outputImg.data;
  const src = srcData.data;

  if (bgMode === 'black') {
    dst.fill(0);
    for (let i = 3; i < dst.length; i += 4) dst[i] = 255;
  } else if (bgMode === 'white') {
    dst.fill(255);
  } else {
    dst.set(src);
  }

  let mR = 255, mG = 30, mB = 40; // Crimson red
  if (markerColor === 'cyan') {
    mR = 6; mG = 214; mB = 240;
  } else if (markerColor === 'green') {
    mR = 16; mG = 235; mB = 80;
  } else if (markerColor === 'yellow') {
    mR = 250; mG = 204; mB = 21;
  } else if (markerColor === 'black') {
    mR = 15; mG = 23; mB = 42;
  } else if (markerColor === 'white') {
    mR = 255; mG = 255; mB = 255;
  }

  const putPixel = (px, py, r, g, b) => {
    if (px < 0 || px >= width || py < 0 || py >= height) return;
    const dstIdx = (py * width + px) * 4;
    dst[dstIdx] = r;
    dst[dstIdx + 1] = g;
    dst[dstIdx + 2] = b;
    dst[dstIdx + 3] = 255;
  };

  for (const { x, y } of finalCorners) {
    if (markerStyle === 'point') {
      putPixel(x, y, mR, mG, mB);
    } else if (markerStyle === 'cross' || markerStyle === 'target') {
      for (let d = -4; d <= 4; d++) {
        putPixel(x + d, y, mR, mG, mB);
        putPixel(x, y + d, mR, mG, mB);
      }
    }

    if (markerStyle === 'dot') {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy <= 5) {
            putPixel(x + dx, y + dy, mR, mG, mB);
          }
        }
      }
    } else if (markerStyle === 'target') {
      const r = 4;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const dist2 = dx * dx + dy * dy;
          if (dist2 >= 10 && dist2 <= 18) {
            putPixel(x + dx, y + dy, mR, mG, mB);
          }
        }
      }
    }
  }

  return {
    finalCorners,
    cornerCount: finalCorners.length,
    finalImg: outputImg
  };
}

