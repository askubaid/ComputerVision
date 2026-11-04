/**
 * Spatial Filters Core Processing Engine
 * High-performance 2D Convolution and Spatial Filter Algorithms
 */

// Helper to clamp values to [0, 255]
export function clamp(val) {
  return val < 0 ? 0 : val > 255 ? 255 : Math.round(val);
}

/**
 * Generate 2D Gaussian Kernel
 * @param {number} size - Odd integer (3, 5, 7, etc.)
 * @param {number} sigma - Standard deviation
 * @returns {{ kernel: number[][], divisor: number }}
 */
export function generateGaussianKernel(size = 3, sigma = 1.0) {
  const kernel = [];
  const radius = Math.floor(size / 2);
  let sum = 0;

  for (let y = -radius; y <= radius; y++) {
    const row = [];
    for (let x = -radius; x <= radius; x++) {
      const g = (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      row.push(g);
      sum += g;
    }
    kernel.push(row);
  }

  // Normalize so sum of kernel equals 1
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] = kernel[y][x] / sum;
    }
  }

  return { kernel, divisor: 1, bias: 0 };
}

/**
 * Generate Box Blur (Averaging / Mean) Kernel
 */
export function generateBoxBlurKernel(size = 3) {
  const kernel = [];
  const total = size * size;
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push(1);
    }
    kernel.push(row);
  }
  return { kernel, divisor: total, bias: 0 };
}

/**
 * Perform 2D Spatial Convolution on an ImageData object
 * Handles RGB or Grayscale mode with border replication
 */
export function applyConvolution(srcData, kernel, divisor = 1, bias = 0, isGrayscale = false) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const output = new ImageData(width, height);
  const dst = output.data;

  const kHeight = kernel.length;
  const kWidth = kernel[0].length;
  const halfH = Math.floor(kHeight / 2);
  const halfW = Math.floor(kWidth / 2);

  const invDiv = divisor !== 0 ? 1 / divisor : 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kHeight; ky++) {
        const py = Math.min(Math.max(y + ky - halfH, 0), height - 1);
        const rowOffset = py * width * 4;
        const kRow = kernel[ky];

        for (let kx = 0; kx < kWidth; kx++) {
          const px = Math.min(Math.max(x + kx - halfW, 0), width - 1);
          const idx = rowOffset + px * 4;
          const weight = kRow[kx];

          r += src[idx] * weight;
          g += src[idx + 1] * weight;
          b += src[idx + 2] * weight;
        }
      }

      const dstIdx = (y * width + x) * 4;
      let finalR = clamp(r * invDiv + bias);
      let finalG = clamp(g * invDiv + bias);
      let finalB = clamp(b * invDiv + bias);

      if (isGrayscale) {
        // Luminance conversion (BT.601)
        const gray = clamp(0.299 * finalR + 0.587 * finalG + 0.114 * finalB);
        dst[dstIdx] = gray;
        dst[dstIdx + 1] = gray;
        dst[dstIdx + 2] = gray;
      } else {
        dst[dstIdx] = finalR;
        dst[dstIdx + 1] = finalG;
        dst[dstIdx + 2] = finalB;
      }
      dst[dstIdx + 3] = src[dstIdx + 3]; // Maintain original alpha
    }
  }

  return output;
}

/**
 * Fast Median Filter (Non-linear Spatial Filter)
 * Superb at removing salt-and-pepper noise while preserving sharp boundaries
 */
export function applyMedianFilter(srcData, size = 3, isGrayscale = false) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const output = new ImageData(width, height);
  const dst = output.data;

  const half = Math.floor(size / 2);
  const total = size * size;
  const midIndex = Math.floor(total / 2);

  const rArr = new Uint8Array(total);
  const gArr = new Uint8Array(total);
  const bArr = new Uint8Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let count = 0;
      for (let ky = -half; ky <= half; ky++) {
        const py = Math.min(Math.max(y + ky, 0), height - 1);
        const rowOffset = py * width * 4;
        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const idx = rowOffset + px * 4;
          rArr[count] = src[idx];
          gArr[count] = src[idx + 1];
          bArr[count] = src[idx + 2];
          count++;
        }
      }

      // Sort small arrays to find median
      rArr.sort();
      gArr.sort();
      bArr.sort();

      const dstIdx = (y * width + x) * 4;
      let finalR = rArr[midIndex];
      let finalG = gArr[midIndex];
      let finalB = bArr[midIndex];

      if (isGrayscale) {
        const gray = Math.round(0.299 * finalR + 0.587 * finalG + 0.114 * finalB);
        dst[dstIdx] = gray;
        dst[dstIdx + 1] = gray;
        dst[dstIdx + 2] = gray;
      } else {
        dst[dstIdx] = finalR;
        dst[dstIdx + 1] = finalG;
        dst[dstIdx + 2] = finalB;
      }
      dst[dstIdx + 3] = src[dstIdx + 3];
    }
  }

  return output;
}

/**
 * Gradient Filter: Sobel or Prewitt
 * Computes horizontal Gx, vertical Gy, and Gradient Magnitude = sqrt(Gx^2 + Gy^2)
 */
export function applyGradientFilter(srcData, kernelX, kernelY, mode = 'magnitude', gain = 1.0, isGrayscale = true) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const output = new ImageData(width, height);
  const dst = output.data;

  const half = 1; // 3x3 gradient operators

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rx = 0, gx = 0, bx = 0;
      let ry = 0, gy = 0, by = 0;

      for (let ky = -half; ky <= half; ky++) {
        const py = Math.min(Math.max(y + ky, 0), height - 1);
        const rowOffset = py * width * 4;
        const kRowIdx = ky + half;

        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const idx = rowOffset + px * 4;
          const kColIdx = kx + half;

          const wx = kernelX[kRowIdx][kColIdx];
          const wy = kernelY[kRowIdx][kColIdx];

          const lum = 0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2];

          rx += lum * wx;
          ry += lum * wy;

          if (!isGrayscale) {
            gx += src[idx + 1] * wx;
            gy += src[idx + 1] * wy;
            bx += src[idx + 2] * wx;
            by += src[idx + 2] * wy;
          }
        }
      }

      const dstIdx = (y * width + x) * 4;

      if (isGrayscale) {
        let val = 0;
        if (mode === 'magnitude') {
          val = Math.sqrt(rx * rx + ry * ry) * gain;
        } else if (mode === 'gx') {
          val = Math.abs(rx) * gain;
        } else if (mode === 'gy') {
          val = Math.abs(ry) * gain;
        }
        const clampedVal = clamp(val);
        dst[dstIdx] = clampedVal;
        dst[dstIdx + 1] = clampedVal;
        dst[dstIdx + 2] = clampedVal;
      } else {
        let finalR = 0, finalG = 0, finalB = 0;
        if (mode === 'magnitude') {
          finalR = Math.sqrt(rx * rx + ry * ry) * gain;
          finalG = Math.sqrt(gx * gx + gy * gy) * gain;
          finalB = Math.sqrt(bx * bx + by * by) * gain;
        } else if (mode === 'gx') {
          finalR = Math.abs(rx) * gain;
          finalG = Math.abs(gx) * gain;
          finalB = Math.abs(bx) * gain;
        } else if (mode === 'gy') {
          finalR = Math.abs(ry) * gain;
          finalG = Math.abs(gy) * gain;
          finalB = Math.abs(by) * gain;
        }
        dst[dstIdx] = clamp(finalR);
        dst[dstIdx + 1] = clamp(finalG);
        dst[dstIdx + 2] = clamp(finalB);
      }
      dst[dstIdx + 3] = src[dstIdx + 3];
    }
  }

  return output;
}

/**
 * High-Boost Filtering & Unsharp Masking
 * Formula: f_hb = f + k * (f - f_blur)
 * When k = 1: Standard Unsharp Mask
 * When k > 1: High-Boost Filtering
 */
export function applyHighBoostFilter(srcData, blurRadius = 3, boostK = 1.5, isGrayscale = false) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;

  // 1. Generate Gaussian blurred version
  const { kernel, divisor } = generateGaussianKernel(blurRadius, 1.2);
  const blurredData = applyConvolution(srcData, kernel, divisor, 0, false);
  const blurred = blurredData.data;

  const output = new ImageData(width, height);
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    const origR = src[i];
    const origG = src[i + 1];
    const origB = src[i + 2];

    const blurR = blurred[i];
    const blurG = blurred[i + 1];
    const blurB = blurred[i + 2];

    // Mask = Original - Blurred
    const maskR = origR - blurR;
    const maskG = origG - blurG;
    const maskB = origB - blurB;

    // High boost result = Original + k * Mask
    let resR = clamp(origR + boostK * maskR);
    let resG = clamp(origG + boostK * maskG);
    let resB = clamp(origB + boostK * maskB);

    if (isGrayscale) {
      const gray = clamp(0.299 * resR + 0.587 * resG + 0.114 * resB);
      dst[i] = gray;
      dst[i + 1] = gray;
      dst[i + 2] = gray;
    } else {
      dst[i] = resR;
      dst[i + 1] = resG;
      dst[i + 2] = resB;
    }
    dst[i + 3] = src[i + 3];
  }

  return output;
}

/**
 * Add Synthetic Noise (for demonstration of filter denoising abilities)
 * @param {ImageData} srcData
 * @param {'salt_and_pepper'|'gaussian'} type
 * @param {number} amount - 0 to 1
 */
export function injectNoise(srcData, type = 'salt_and_pepper', amount = 0.05) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const output = new ImageData(width, height);
  const dst = output.data;
  dst.set(src);

  if (amount <= 0) return output;

  if (type === 'salt_and_pepper') {
    for (let i = 0; i < dst.length; i += 4) {
      const rand = Math.random();
      if (rand < amount / 2) {
        // Pepper (black)
        dst[i] = 0;
        dst[i + 1] = 0;
        dst[i + 2] = 0;
      } else if (rand < amount) {
        // Salt (white)
        dst[i] = 255;
        dst[i + 1] = 255;
        dst[i + 2] = 255;
      }
    }
  } else if (type === 'gaussian') {
    const factor = amount * 128;
    for (let i = 0; i < dst.length; i += 4) {
      // Box-Muller transform for Gaussian random value
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const noise = z * factor;

      dst[i] = clamp(dst[i] + noise);
      dst[i + 1] = clamp(dst[i + 1] + noise);
      dst[i + 2] = clamp(dst[i + 2] + noise);
    }
  }

  return output;
}

/**
 * Compute Difference Heatmap between Filtered and Original
 * (|Filtered - Original|)
 */
export function computeDifferenceMap(origImgData, filteredImgData) {
  const width = origImgData.width;
  const height = origImgData.height;
  const orig = origImgData.data;
  const filt = filteredImgData.data;
  const output = new ImageData(width, height);
  const dst = output.data;

  for (let i = 0; i < orig.length; i += 4) {
    const diffR = Math.abs(filt[i] - orig[i]);
    const diffG = Math.abs(filt[i + 1] - orig[i + 1]);
    const diffB = Math.abs(filt[i + 2] - orig[i + 2]);
    const diff = Math.max(diffR, diffG, diffB) * 2.5; // Amplified for clear visual feedback

    // Pseudo-color heat map: Jet style
    const norm = Math.min(diff / 255, 1.0);
    // Cyan to Yellow to Red heat map
    dst[i] = Math.round(255 * Math.sin(norm * Math.PI * 0.5));
    dst[i + 1] = Math.round(255 * Math.sin(norm * Math.PI));
    dst[i + 2] = Math.round(255 * Math.cos(norm * Math.PI * 0.5));
    dst[i + 3] = 255;
  }

  return output;
}

/**
 * Calculate Intensity Histogram (256 bins)
 */
export function calculateHistogram(imgData) {
  const counts = new Uint32Array(256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    counts[lum]++;
  }
  return counts;
}

/**
 * Canny Edge Detector (Multi-stage Optimal Edge Detector)
 * 1. Grayscale luminance
 * 2. Gaussian smoothing
 * 3. Sobel gradient magnitude & directional angle
 * 4. Non-Maximum Suppression (NMS thinning)
 * 5. Double thresholding & Hysteresis edge tracking
 */
export function applyCannyEdgeDetector(srcData, lowThresh = 30, highThresh = 80, sigma = 1.2, invert = false) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const totalPixels = width * height;

  // 1. Grayscale luminance conversion
  const gray = new Float32Array(totalPixels);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    gray[p] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
  }

  // 2. Gaussian Pre-smoothing
  const blurred = new Float32Array(totalPixels);
  const kSize = Math.max(3, Math.min(7, (Math.round(sigma * 3) * 2) + 1));
  const { kernel } = generateGaussianKernel(kSize, sigma);
  const halfK = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -halfK; ky <= halfK; ky++) {
        const py = Math.min(Math.max(y + ky, 0), height - 1);
        const rowOffset = py * width;
        const kRow = kernel[ky + halfK];
        for (let kx = -halfK; kx <= halfK; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          sum += gray[rowOffset + px] * kRow[kx + halfK];
        }
      }
      blurred[y * width + x] = sum;
    }
  }

  // 3. Sobel Gradients
  const mag = new Float32Array(totalPixels);
  const dir = new Uint8Array(totalPixels); // 0 = 0 deg, 1 = 45 deg, 2 = 90 deg, 3 = 135 deg

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -1 * blurred[(y - 1) * width + (x - 1)] + 1 * blurred[(y - 1) * width + (x + 1)] +
        -2 * blurred[y * width + (x - 1)]       + 2 * blurred[y * width + (x + 1)] +
        -1 * blurred[(y + 1) * width + (x - 1)] + 1 * blurred[(y + 1) * width + (x + 1)];

      const gy =
        -1 * blurred[(y - 1) * width + (x - 1)] - 2 * blurred[(y - 1) * width + x] - 1 * blurred[(y - 1) * width + (x + 1)] +
         1 * blurred[(y + 1) * width + (x - 1)] + 2 * blurred[(y + 1) * width + x] + 1 * blurred[(y + 1) * width + (x + 1)];

      const m = Math.sqrt(gx * gx + gy * gy);
      mag[idx] = m;

      let angle = (Math.atan2(gy, gx) * 180) / Math.PI;
      if (angle < 0) angle += 180;

      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        dir[idx] = 0; // horizontal edge
      } else if (angle >= 22.5 && angle < 67.5) {
        dir[idx] = 1; // 45 deg
      } else if (angle >= 67.5 && angle < 112.5) {
        dir[idx] = 2; // vertical edge
      } else {
        dir[idx] = 3; // 135 deg
      }
    }
  }

  // 4. Non-Maximum Suppression (NMS)
  const nms = new Float32Array(totalPixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const m = mag[idx];
      if (m === 0) continue;

      const d = dir[idx];
      let n1 = 0, n2 = 0;

      if (d === 0) {
        n1 = mag[idx - 1];
        n2 = mag[idx + 1];
      } else if (d === 1) {
        n1 = mag[(y - 1) * width + (x + 1)];
        n2 = mag[(y + 1) * width + (x - 1)];
      } else if (d === 2) {
        n1 = mag[(y - 1) * width + x];
        n2 = mag[(y + 1) * width + x];
      } else if (d === 3) {
        n1 = mag[(y - 1) * width + (x - 1)];
        n2 = mag[(y + 1) * width + (x + 1)];
      }

      if (m >= n1 && m >= n2) {
        nms[idx] = m;
      } else {
        nms[idx] = 0;
      }
    }
  }

  // 5. Double Thresholding & Hysteresis
  const edgeState = new Uint8Array(totalPixels); // 0: none, 1: weak, 2: strong
  const queue = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const v = nms[idx];
      if (v >= highThresh) {
        edgeState[idx] = 2;
        queue.push(idx);
      } else if (v >= lowThresh) {
        edgeState[idx] = 1;
      }
    }
  }

  // BFS edge tracking
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cy = Math.floor(curr / width);
    const cx = curr % width;

    for (let dy = -1; dy <= 1; dy++) {
      const ny = cy + dy;
      if (ny < 0 || ny >= height) continue;
      const rowOffset = ny * width;
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        if (nx < 0 || nx >= width) continue;
        const nIdx = rowOffset + nx;
        if (edgeState[nIdx] === 1) {
          edgeState[nIdx] = 2;
          queue.push(nIdx);
        }
      }
    }
  }

  // 6. Output image construction
  const output = new ImageData(width, height);
  const dst = output.data;
  const edgeColor = invert ? 0 : 255;
  const bgColor = invert ? 255 : 0;

  for (let p = 0; p < totalPixels; p++) {
    const isEdge = edgeState[p] === 2;
    const val = isEdge ? edgeColor : bgColor;
    const dstIdx = p * 4;
    dst[dstIdx] = val;
    dst[dstIdx + 1] = val;
    dst[dstIdx + 2] = val;
    dst[dstIdx + 3] = 255;
  }

  return output;
}

/**
 * Harris Corner Detection Algorithm
 * Structure tensor eigenvalues analysis for finding robust invariant corners
 */
export function applyHarrisCornerDetector(
  srcData,
  k = 0.04,
  sensitivity = 35,
  markerStyle = 'target',
  markerColor = 'red',
  isolatedOnly = false,
  isolatedBg = 'black'
) {
  const width = srcData.width;
  const height = srcData.height;
  const src = srcData.data;
  const totalPixels = width * height;

  // 1. Grayscale conversion
  const gray = new Float32Array(totalPixels);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    gray[p] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
  }

  // 2. Gradients Ix and Iy
  const ix = new Float32Array(totalPixels);
  const iy = new Float32Array(totalPixels);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      ix[idx] =
        (-1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)] +
         -2 * gray[y * width + (x - 1)]       + 2 * gray[y * width + (x + 1)] +
         -1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)]) / 8;

      iy[idx] =
        (-1 * gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - 1 * gray[(y - 1) * width + (x + 1)] +
          1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)]) / 8;
    }
  }

  // 3. Tensor components Ixx, Iyy, Ixy
  const ixx = new Float32Array(totalPixels);
  const iyy = new Float32Array(totalPixels);
  const ixy = new Float32Array(totalPixels);

  for (let p = 0; p < totalPixels; p++) {
    const x = ix[p];
    const y = iy[p];
    ixx[p] = x * x;
    iyy[p] = y * y;
    ixy[p] = x * y;
  }

  // 4. Gaussian smoothing on tensor elements
  const { kernel: gKernel } = generateGaussianKernel(5, 1.4);
  const halfG = 2;

  const aMat = new Float32Array(totalPixels);
  const bMat = new Float32Array(totalPixels);
  const cMat = new Float32Array(totalPixels);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumA = 0, sumB = 0, sumC = 0;
      for (let ky = -halfG; ky <= halfG; ky++) {
        const py = Math.min(Math.max(y + ky, 0), height - 1);
        const rowOffset = py * width;
        const kRow = gKernel[ky + halfG];
        for (let kx = -halfG; kx <= halfG; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const pIdx = rowOffset + px;
          const w = kRow[kx + halfG];
          sumA += ixx[pIdx] * w;
          sumB += iyy[pIdx] * w;
          sumC += ixy[pIdx] * w;
        }
      }
      const idx = y * width + x;
      aMat[idx] = sumA;
      bMat[idx] = sumB;
      cMat[idx] = sumC;
    }
  }

  // 5. Response measure R = det(M) - k * (trace(M))^2
  const rMat = new Float32Array(totalPixels);
  let maxR = 0;

  for (let p = 0; p < totalPixels; p++) {
    const A = aMat[p];
    const B = bMat[p];
    const C = cMat[p];
    const det = A * B - C * C;
    const trace = A + B;
    const R = det - k * (trace * trace);
    if (R > 0) {
      rMat[p] = R;
      if (R > maxR) maxR = R;
    } else {
      rMat[p] = 0;
    }
  }

  // 6. Dynamic thresholding & 5x5 Non-Maximum Suppression
  const normSens = Math.max(0.001, (101 - sensitivity) / 100);
  const thresholdVal = maxR * Math.pow(normSens, 2.6);

  const corners = [];
  const nmsRadius = 3;

  for (let y = nmsRadius; y < height - nmsRadius; y++) {
    for (let x = nmsRadius; x < width - nmsRadius; x++) {
      const idx = y * width + x;
      const val = rMat[idx];

      if (val < thresholdVal || val <= 0) continue;

      let isLocalMax = true;
      for (let dy = -nmsRadius; dy <= nmsRadius; dy++) {
        const rowOffset = (y + dy) * width;
        for (let dx = -nmsRadius; dx <= nmsRadius; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (rMat[rowOffset + (x + dx)] > val) {
            isLocalMax = false;
            break;
          }
        }
        if (!isLocalMax) break;
      }

      if (isLocalMax) {
        corners.push({ x, y });
      }
    }
  }

  // 7. Render output with marked corners
  const output = new ImageData(width, height);
  const dst = output.data;

  if (isolatedOnly) {
    // Fill canvas with uniform black (0) or white (255) pixels, removing everything else
    const bgVal = isolatedBg === 'white' ? 255 : 0;
    for (let i = 0; i < dst.length; i += 4) {
      dst[i] = bgVal;
      dst[i + 1] = bgVal;
      dst[i + 2] = bgVal;
      dst[i + 3] = 255;
    }
  } else {
    // Retain underlying image
    dst.set(src);
  }

  let mR = 255, mG = 30, mB = 40; // Neon crimson red
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

  for (const { x, y } of corners) {
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

  output.cornerCount = corners.length;
  return output;
}
