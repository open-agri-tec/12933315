const PALETTES = {
  green: { body: '#50c878', belly: '#b4f2a3', eye: '#f7fff7', pupil: '#111827', nose: '#f59e0b', limb: '#2f9e55', wing: '#8ce99a', accent: '#ffd43b', line: '#162014' },
  blue: { body: '#4dabf7', belly: '#a5d8ff', eye: '#f8fbff', pupil: '#0b1020', nose: '#ffd43b', limb: '#1971c2', wing: '#74c0fc', accent: '#91f2ff', line: '#101828' },
  red: { body: '#ff6b6b', belly: '#ffc9c9', eye: '#fff5f5', pupil: '#1f0f0f', nose: '#ffd43b', limb: '#e03131', wing: '#ffa8a8', accent: '#ffd43b', line: '#220b0b' },
  purple: { body: '#9775fa', belly: '#e5dbff', eye: '#ffffff', pupil: '#120d24', nose: '#ffb86b', limb: '#7048e8', wing: '#b197fc', accent: '#f783ac', line: '#1d1233' }
};

export function renderMonsterFromParts(canvas, monsterJson, state = 'idle') {
  canvas.width = monsterJson.canvasModel?.canvasWidth || 64;
  canvas.height = monsterJson.canvasModel?.canvasHeight || 64;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const palette = PALETTES[monsterJson.visualProfile?.palette] || PALETTES.green;
  const order = monsterJson.canvasModel?.partsOrder || Object.keys(monsterJson.parts || {});
  for (const key of order) {
    const part = monsterJson.parts?.[key];
    if (part?.enabled) drawPart(ctx, applyStateToPart(key, part, state), palette, state);
  }
}

export function drawPart(ctx, part, palette, state) {
  if (!part?.enabled) return;
  const color = resolveColor(part, palette, state);
  if (state === 'sleep' && part.colorRole === 'eye') {
    const x = part.x ?? ((part.x1 + part.x2) / 2);
    const y = part.y ?? ((part.y1 + part.y2) / 2);
    drawLinePart(ctx, { x1: x - 3, y1: y, x2: x + 3, y2: y }, palette.line);
    return;
  }
  if (part.type === 'rect') drawRectPart(ctx, part, color);
  if (part.type === 'circle') drawCirclePart(ctx, part, color);
  if (part.type === 'ellipse') drawEllipsePart(ctx, part, color);
  if (part.type === 'line') drawLinePart(ctx, part, color);
}

export function drawRectPart(ctx, part, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(part.x), Math.round(part.y), Math.round(part.w || 1), Math.round(part.h || 1));
}

export function drawCirclePart(ctx, part, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(part.x, part.y, part.r || 1, 0, Math.PI * 2);
  ctx.fill();
  if (part.colorRole === 'eye') drawPupil(ctx, part.x, part.y, part.r || 1);
}

export function drawEllipsePart(ctx, part, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(part.x, part.y, part.rx || 1, part.ry || 1, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawLinePart(ctx, part, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = part.lineWidth || 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(part.x1, part.y1);
  ctx.lineTo(part.x2, part.y2);
  ctx.stroke();
}

function applyStateToPart(key, part, state) {
  const p = structuredClone(part);
  if (state === 'happy') {
    if (['body', 'belly', 'eyeLeft', 'eyeRight', 'nose'].includes(key)) movePart(p, 0, -2);
    if (key === 'armLeft') p.y2 = (p.y2 ?? p.y) - 5;
    if (key === 'armRight') p.y2 = (p.y2 ?? p.y) - 5;
  }
  if (state === 'dislike') {
    if (['body', 'belly', 'eyeLeft', 'eyeRight', 'nose'].includes(key)) movePart(p, key === 'body' ? -2 : 2, 0);
    if (p.colorRole === 'eye' && p.type === 'circle') { p.type = 'ellipse'; p.rx = (p.r || 2) + 1; p.ry = 1; }
  }
  if (state === 'eating') {
    if (key === 'body') { p.ry = Math.max(1, (p.ry || 10) - 3); p.rx = (p.rx || 10) + 2; }
    if (key === 'belly') { p.rx = (p.rx || 8) + 3; p.ry = (p.ry || 6) + 2; }
  }
  if (state === 'sleep' && ['body', 'belly', 'eyeLeft', 'eyeRight', 'nose'].includes(key)) movePart(p, 0, 2);
  return p;
}

function movePart(part, dx, dy) {
  for (const key of ['x', 'x1', 'x2']) if (Number.isFinite(part[key])) part[key] += dx;
  for (const key of ['y', 'y1', 'y2']) if (Number.isFinite(part[key])) part[key] += dy;
}

function resolveColor(part, palette, state) {
  if (part.colorRole === 'eye' && state === 'happy') return lighten(palette.eye, 25);
  return palette[part.colorRole] || part.color || palette.body;
}

function drawPupil(ctx, x, y, r) {
  ctx.fillStyle = '#101014';
  ctx.beginPath();
  ctx.arc(x + Math.max(1, r * 0.2), y, Math.max(0.8, r * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

function lighten(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = Math.min(255, (value >> 16) + amount);
  const g = Math.min(255, ((value >> 8) & 255) + amount);
  const b = Math.min(255, (value & 255) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
