/**
 * Experiment Runner & Live Pipeline Execution
 * Supports real-time client-side re-computation for all 5 experiments.
 */

import {
  computeGradients,
  computeStructureTensor,
  computeHarrisResponse,
  applyHarrisThreshold,
  applyNMS
} from './harrisPipelineEngine';

/**
 * Loads an image from a URL into an offscreen canvas and returns an ImageData object.
 */
export function loadImageData(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Ensure grayscale luminance
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        data[i + 3] = 255;
      }

      resolve(imgData);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Converts ImageData to a dataURL string for direct <img> or <canvas> rendering.
 */
export function imageDataToDataUrl(imgData) {
  const canvas = document.createElement('canvas');
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Executes full Harris Corner detection pipeline with custom parameters.
 */
export function executeHarrisPipeline(
  srcData,
  {
    operator = 'sobel',
    sigma = 1.2,
    kernelSize = 5,
    k = 0.04,
    thresholdRatio = 0.01,
    nmsRadius = 2,
    markerStyle = 'target',
    markerColor = 'red',
    bgMode = 'overlay'
  } = {}
) {
  const startTime = performance.now();

  // 1. Gradients
  const grad = computeGradients(srcData, operator);

  // 2. Structure Tensor
  const tensor = computeStructureTensor(
    grad.ix,
    grad.iy,
    srcData.width,
    srcData.height,
    kernelSize,
    sigma
  );

  // 3. Response Map R
  const resp = computeHarrisResponse(
    tensor.sIxx,
    tensor.sIyy,
    tensor.sIxy,
    srcData.width,
    srcData.height,
    k
  );

  // 4. Thresholding (Candidates)
  const thresh = applyHarrisThreshold(
    resp.rMap,
    resp.maxR,
    srcData.width,
    srcData.height,
    srcData,
    thresholdRatio,
    'overlay',
    'gold'
  );

  // 5. NMS (Final Keypoints)
  const nms = applyNMS(
    resp.rMap,
    thresh.candidatePoints,
    srcData.width,
    srcData.height,
    srcData,
    nmsRadius,
    markerStyle,
    markerColor,
    bgMode
  );

  const endTime = performance.now();

  return {
    width: srcData.width,
    height: srcData.height,
    rMax: resp.maxR,
    candidatesCount: thresh.candidateCount,
    cornersCount: nms.cornerCount,
    thresholdVal: thresh.thresholdVal,
    thresholdImg: thresh.thresholdImg,
    finalImg: nms.finalImg,
    corners: nms.finalCorners,
    runtimeMs: parseFloat((endTime - startTime).toFixed(1))
  };
}

/**
 * Creates a perturbed version of an ImageData object for Experiment E.
 */
export function applyPerturbation(srcData, type = 'noise') {
  const width = srcData.width;
  const height = srcData.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(srcData, 0, 0);

  if (type === 'noise') {
    const outData = ctx.getImageData(0, 0, width, height);
    const d = outData.data;
    // Additive Gaussian noise (sigma = 15) using Box-Muller transform
    for (let i = 0; i < d.length; i += 4) {
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const noisy = Math.min(255, Math.max(0, Math.round(d[i] + z0 * 15)));
      d[i] = noisy;
      d[i + 1] = noisy;
      d[i + 2] = noisy;
    }
    return outData;
  }

  if (type === 'contrast') {
    const outData = ctx.getImageData(0, 0, width, height);
    const d = outData.data;
    // alpha = 0.75, beta = +30
    for (let i = 0; i < d.length; i += 4) {
      const shifted = Math.min(255, Math.max(0, Math.round(0.75 * d[i] + 30)));
      d[i] = shifted;
      d[i + 1] = shifted;
      d[i + 2] = shifted;
    }
    return outData;
  }

  if (type === 'rotation') {
    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = width;
    rotCanvas.height = height;
    const rotCtx = rotCanvas.getContext('2d');
    rotCtx.fillStyle = '#808080';
    rotCtx.fillRect(0, 0, width, height);

    rotCtx.translate(width / 2, height / 2);
    rotCtx.rotate((20 * Math.PI) / 180);
    rotCtx.drawImage(canvas, -width / 2, -height / 2);

    return rotCtx.getImageData(0, 0, width, height);
  }

  return srcData;
}
