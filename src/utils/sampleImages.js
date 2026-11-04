/**
 * Sample Image Generators for Spatial Filtering Testing
 * Generates synthetic high-resolution canvases designed specifically
 * for analyzing spatial frequency, edge detection, and noise suppression.
 */

export function createGeometricTestChart(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1a1e29');
  bgGrad.addColorStop(1, '#0e121a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Checkerboard pattern in top-left
  const checkSize = 16;
  for (let y = 30; y < 160; y += checkSize) {
    for (let x = 30; x < 160; x += checkSize) {
      ctx.fillStyle = ((x / checkSize + y / checkSize) % 2 === 0) ? '#e2e8f0' : '#334155';
      ctx.fillRect(x, y, checkSize, checkSize);
    }
  }

  // Concentric frequency circles in top-right
  const cx = width - 100;
  const cy = 95;
  for (let r = 70; r > 5; r -= 6) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = (r % 12 === 0) ? '#38bdf8' : '#0f172a';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // High contrast star polygon in center
  ctx.save();
  ctx.translate(width / 2, height / 2 + 10);
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const r = i % 2 === 0 ? 80 : 35;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const starGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
  starGrad.addColorStop(0, '#f59e0b');
  starGrad.addColorStop(0.7, '#ef4444');
  starGrad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = starGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Fine edge resolution bar pattern in bottom-left
  for (let i = 0; i < 20; i++) {
    const x = 30 + i * 6;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#020617';
    ctx.fillRect(x, height - 140, 4, 100);
  }

  // Sharp diagonal lines in bottom-right
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#10b981';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(width - 150 + i * 10, height - 40);
    ctx.lineTo(width - 40, height - 150 + i * 10);
    ctx.stroke();
  }

  // Text with sharp edges
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('SPATIAL TEST CHART', 150, 40);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText('FREQ: HIGH / MED / LOW', 170, 60);

  return canvas.toDataURL('image/png');
}

export function createCircuitBoardChart(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Dark PCB Green background
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, width, height);

  // PCB Grid dots
  ctx.fillStyle = '#047857';
  for (let y = 16; y < height; y += 24) {
    for (let x = 16; x < width; x += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Copper traces (sharp horizontal and vertical lines)
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;

  const traces = [
    [[50, 50], [120, 50], [150, 80], [250, 80]],
    [[50, 90], [100, 90], [130, 120], [200, 120], [200, 200]],
    [[300, 50], [380, 50], [420, 90], [420, 180]],
    [[80, 300], [80, 380], [140, 440], [250, 440]],
    [[350, 300], [400, 350], [400, 450], [460, 450]],
    [[220, 350], [260, 350], [290, 380], [290, 450]],
    [[50, 220], [160, 220], [180, 240], [280, 240]]
  ];

  traces.forEach(pts => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

    // Solder pads at endpoints
    const end = pts[pts.length - 1];
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(end[0], end[1], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(end[0], end[1], 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Central IC Processor Chip
  const chipSize = 130;
  const chipX = (width - chipSize) / 2;
  const chipY = (height - chipSize) / 2;

  // Chip pins
  ctx.fillStyle = '#94a3b8';
  for (let i = 0; i < 9; i++) {
    // Top & Bottom pins
    ctx.fillRect(chipX + 15 + i * 12, chipY - 12, 6, 12);
    ctx.fillRect(chipX + 15 + i * 12, chipY + chipSize, 6, 12);
    // Left & Right pins
    ctx.fillRect(chipX - 12, chipY + 15 + i * 12, 12, 6);
    ctx.fillRect(chipX + chipSize, chipY + 15 + i * 12, 12, 6);
  }

  // Chip body
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(chipX, chipY, chipSize, chipSize);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(chipX, chipY, chipSize, chipSize);

  // IC Label
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DSP-2026', width / 2, height / 2 - 10);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.fillText('SPATIAL-ACCEL', width / 2, height / 2 + 10);
  ctx.fillStyle = '#64748b';
  ctx.fillText('REV 2.4', width / 2, height / 2 + 25);
  ctx.textAlign = 'start';

  return canvas.toDataURL('image/png');
}

export function createNoisyAstronomyChart(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Deep space background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, width, height);

  // Glowing Nebula Gas Clouds
  const nebula1 = ctx.createRadialGradient(160, 200, 20, 160, 200, 150);
  nebula1.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
  nebula1.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
  nebula1.addColorStop(1, 'rgba(3, 7, 18, 0)');
  ctx.fillStyle = nebula1;
  ctx.fillRect(0, 0, width, height);

  const nebula2 = ctx.createRadialGradient(360, 320, 10, 360, 320, 140);
  nebula2.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
  nebula2.addColorStop(0.6, 'rgba(239, 68, 68, 0.15)');
  nebula2.addColorStop(1, 'rgba(3, 7, 18, 0)');
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, width, height);

  // Bright Celestial Planet with Rings
  const px = 380;
  const py = 130;
  const pr = 40;

  // Planet body
  const planetGrad = ctx.createRadialGradient(px - 10, py - 10, 5, px, py, pr);
  planetGrad.addColorStop(0, '#fef08a');
  planetGrad.addColorStop(0.6, '#f97316');
  planetGrad.addColorStop(1, '#9a3412');
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fill();

  // Planet rings
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.4);
  ctx.beginPath();
  ctx.ellipse(0, 0, 75, 18, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(254, 215, 170, 0.7)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Natural Stars
  for (let i = 0; i < 90; i++) {
    const sx = Math.floor(Math.sin(i * 997.3) * 10000) % width;
    const sy = Math.floor(Math.cos(i * 443.7) * 10000) % height;
    const starX = Math.abs(sx);
    const starY = Math.abs(sy);
    const brightness = (i % 3 === 0) ? '#ffffff' : (i % 3 === 1) ? '#67e8f9' : '#fde047';
    ctx.fillStyle = brightness;
    ctx.fillRect(starX, starY, (i % 7 === 0) ? 2.5 : 1.5, (i % 7 === 0) ? 2.5 : 1.5);
  }

  // Simulated Salt & Pepper Telescope Sensor Noise (to showcase Median filtering!)
  for (let i = 0; i < 400; i++) {
    const nx = Math.floor(Math.random() * width);
    const ny = Math.floor(Math.random() * height);
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(nx, ny, 1.5, 1.5);
  }

  return canvas.toDataURL('image/png');
}

export function createPortraitChart(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Studio backdrop
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft portrait face
  const cx = width / 2;
  const cy = height / 2 - 20;

  // Neck and shoulders
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(cx - 70, height);
  ctx.lineTo(cx - 40, cy + 90);
  ctx.lineTo(cx + 40, cy + 90);
  ctx.lineTo(cx + 70, height);
  ctx.closePath();
  ctx.fill();

  // Face oval
  const faceGrad = ctx.createRadialGradient(cx - 20, cy - 20, 20, cx, cy, 100);
  faceGrad.addColorStop(0, '#fed7aa');
  faceGrad.addColorStop(0.7, '#fb923c');
  faceGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 75, 95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes with fine lashes (sharp high frequencies)
  [-30, 30].forEach(offsetX => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + offsetX, cy - 10, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx + offsetX, cy - 10, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + offsetX, cy - 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    for (let l = -3; l <= 3; l++) {
      ctx.beginPath();
      ctx.moveTo(cx + offsetX + l * 4, cy - 19);
      ctx.lineTo(cx + offsetX + l * 5, cy - 26);
      ctx.stroke();
    }
  });

  // Lips
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 45, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Detailed hat / high frequency textures
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.arc(cx, cy - 80, 85, Math.PI, 0);
  ctx.fill();

  // Hat brim
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 75, 110, 20, -0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Feathers with high frequency strands
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.2;
  for (let f = 0; f < 30; f++) {
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy - 75);
    const endX = cx - 110 - Math.sin(f * 0.2) * 30;
    const endY = cy - 140 - f * 3;
    ctx.quadraticCurveTo(cx - 90, cy - 120, endX, endY);
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

export const SAMPLE_IMAGES = [
  {
    id: 'geometric',
    name: 'Geometric Test Chart',
    category: 'Edges & Frequencies',
    description: 'Concentric rings, checkerboard, and crisp star polygon',
    generator: createGeometricTestChart
  },
  {
    id: 'circuit',
    name: 'Microchip PCB Circuit',
    category: 'Directional Gradients',
    description: 'Horizontal & vertical copper traces and silicon IC die',
    generator: createCircuitBoardChart
  },
  {
    id: 'noisy_astronomy',
    name: 'Cosmic Field & Noise',
    category: 'Noise Removal',
    description: 'Saturn-like planet and sensor noise for Median filter testing',
    generator: createNoisyAstronomyChart
  },
  {
    id: 'portrait',
    name: 'Portrait & Textures',
    category: 'Natural Detail',
    description: 'Smooth skin gradients and fine hair/feather strands',
    generator: createPortraitChart
  }
];
