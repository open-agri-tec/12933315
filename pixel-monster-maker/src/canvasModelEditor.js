const SKELETON_POINTS = {
  round: {
    center: [32, 32], head: [32, 19], body: [32, 36], eyeLeft: [25, 25], eyeRight: [39, 25], nose: [32, 31],
    armLeft: [14, 35], armRight: [50, 35], legLeft: [24, 55], legRight: [40, 55]
  },
  line: {
    top: [32, 8], center: [32, 31], bottom: [32, 52], eyeLeft: [27, 21], eyeRight: [37, 21],
    branchLeft: [17, 28], branchRight: [47, 28], footLeft: [24, 58], footRight: [40, 58]
  },
  cluster: {
    center: [32, 32], budTop: [32, 15], budLeft: [18, 31], budRight: [46, 31], budBottom: [32, 46],
    eyeLeft: [26, 29], eyeRight: [38, 29], stem: [32, 53], footLeft: [25, 59], footRight: [39, 59]
  }
};

const OPTIONAL_PART_BASES = new Set([
  'wingLeft', 'wingRight',
  'legFrontLeft', 'legFrontRight', 'legBackLeft', 'legBackRight',
  'horn', 'tail',
  'antennaLeft', 'antennaRight',
  'earLeft', 'earRight'
]);

export const PARTS_ORDER_TEMPLATE = [
  'tail', 'wingLeft', 'wingRight', 'legBackLeft', 'legBackRight',
  'legLeft', 'legRight', 'body', 'belly',
  'legFrontLeft', 'legFrontRight', 'armLeft', 'armRight', 'eyeLeft', 'eyeRight', 'nose',
  'horn', 'antennaLeft', 'antennaRight', 'earLeft', 'earRight'
];

export function createDefaultSkeleton(skeletonType, size = 64) {
  const template = SKELETON_POINTS[skeletonType] || SKELETON_POINTS.round;
  const scale = size / 64;
  return Object.fromEntries(
    Object.entries(template).map(([key, [x, y]]) => [key, { x: Math.round(x * scale), y: Math.round(y * scale) }])
  );
}

export function buildPartsFromSkeleton(skeleton, profile) {
  const type = profile.skeletonType;
  const baseParts = type === 'line' ? buildLineParts(skeleton, profile) : type === 'cluster' ? buildClusterParts(skeleton, profile) : buildRoundParts(skeleton, profile);
  return { ...baseParts, ...buildOptionalParts(skeleton) };
}

export function buildPartsOrder(parts) {
  const keys = Object.keys(parts || {});
  const ordered = [];
  for (const templateKey of PARTS_ORDER_TEMPLATE) {
    for (const key of keys) {
      if (key === templateKey || baseBoneName(key) === templateKey) addUnique(ordered, key);
    }
  }
  for (const key of keys) addUnique(ordered, key);
  return ordered;
}

export function drawSkeletonBase(ctx, skeleton, selectedKey) {
  ctx.save();
  ctx.lineWidth = 1;
  const entries = Object.entries(skeleton);
  ctx.strokeStyle = 'rgba(127, 219, 255, 0.7)';
  ctx.beginPath();
  entries.forEach(([, point], index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  for (const [key, point] of entries) {
    const selected = key === selectedKey;
    ctx.fillStyle = selected ? '#ffdf6e' : '#69f0ae';
    ctx.strokeStyle = '#101522';
    ctx.beginPath();
    ctx.arc(point.x, point.y, selected ? 2.4 : 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSkeletonLabels(ctx, skeleton, selectedKey, options = {}) {
  const { labelMode = 'selected', showLabels = true, width = 320, height = 320, scale = 5, preserveExisting = false } = options;
  ctx.save();
  if (!preserveExisting) ctx.clearRect(0, 0, width, height);
  ctx.font = '14px monospace';
  ctx.textBaseline = 'top';

  if (!showLabels || labelMode === 'none') {
    ctx.restore();
    return;
  }

  const placed = [];
  if (selectedKey) drawLabel(ctx, `選択: ${selectedKey}`, 8, 8, width, height, '#ffdf6e', placed);
  drawLabel(ctx, 'Drag bones / select blank area', 8, height - 26, width, height, '#eaffff', placed);

  const entries = labelMode === 'selected' && selectedKey && skeleton[selectedKey]
    ? [[selectedKey, skeleton[selectedKey]]]
    : Object.entries(skeleton);

  for (const [key, point] of entries) {
    drawLabel(ctx, key, point.x * scale + 10, point.y * scale - 18, width, height, key === selectedKey ? '#ffdf6e' : '#eaffff', placed);
  }
  ctx.restore();
}

function drawLabel(ctx, text, x, y, width, height, color, placed = []) {
  const paddingX = 4;
  const paddingY = 4;
  const metrics = ctx.measureText(text);
  const labelWidth = Math.ceil(metrics.width) + paddingX * 2;
  const labelHeight = 22;
  let px = Math.max(0, Math.min(width - labelWidth, Math.round(x)));
  let py = Math.max(0, Math.min(height - labelHeight, Math.round(y)));
  let guard = 0;
  while (placed.some((box) => intersects({ x: px, y: py, w: labelWidth, h: labelHeight }, box)) && guard < 10) {
    py = Math.min(height - labelHeight, py + labelHeight + 3);
    guard += 1;
  }
  const box = { x: px, y: py, w: labelWidth, h: labelHeight };
  placed.push(box);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
  ctx.fillRect(px, py, labelWidth, labelHeight);
  ctx.strokeStyle = 'rgba(127, 219, 255, 0.35)';
  ctx.strokeRect(px + 0.5, py + 0.5, labelWidth - 1, labelHeight - 1);
  ctx.fillStyle = color;
  ctx.fillText(text, px + paddingX, py + paddingY);
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function buildRoundParts(s, profile) {
  const center = s.center || s.body || { x: 32, y: 32 };
  const body = s.body || center;
  const eyeLeft = s.eyeLeft || offset(center, -7, -7);
  const eyeRight = s.eyeRight || offset(center, 7, -7);
  const nose = s.nose || offset(center, 0, -1);
  const armLeft = s.armLeft || offset(center, -18, 3);
  const armRight = s.armRight || offset(center, 18, 3);
  const legLeft = s.legLeft || offset(center, -8, 23);
  const legRight = s.legRight || offset(center, 8, 23);
  return {
    body: ellipse(body.x, body.y, 18, 20, 'body'),
    belly: { ...ellipse(center.x, center.y + 8, 10, 8, 'belly'), enabled: Boolean(profile.belly) },
    eyeLeft: circle(eyeLeft.x, eyeLeft.y, profile.eyeType === 'small' ? 2 : 3, 'eye'),
    eyeRight: circle(eyeRight.x, eyeRight.y, profile.eyeType === 'small' ? 2 : 3, 'eye'),
    nose: circle(nose.x, nose.y, 2, 'nose'),
    armLeft: line(center.x - 12, center.y + 2, armLeft.x, armLeft.y, 'limb'),
    armRight: line(center.x + 12, center.y + 2, armRight.x, armRight.y, 'limb'),
    legLeft: line(center.x - 6, center.y + 17, legLeft.x, legLeft.y, 'limb'),
    legRight: line(center.x + 6, center.y + 17, legRight.x, legRight.y, 'limb')
  };
}

function buildLineParts(s, profile) {
  const center = s.center || { x: 32, y: 31 };
  const top = s.top || offset(center, 0, -23);
  const bottom = s.bottom || offset(center, 0, 21);
  const eyeLeft = s.eyeLeft || offset(center, -5, -10);
  const eyeRight = s.eyeRight || offset(center, 5, -10);
  const branchLeft = s.branchLeft || offset(center, -15, -3);
  const branchRight = s.branchRight || offset(center, 15, -3);
  const footLeft = s.footLeft || offset(bottom, -8, 6);
  const footRight = s.footRight || offset(bottom, 8, 6);
  return {
    body: line(top.x, top.y, bottom.x, bottom.y, 'body'),
    belly: { ...ellipse(center.x, center.y + 7, 7, 6, 'belly'), enabled: Boolean(profile.belly) },
    eyeLeft: circle(eyeLeft.x, eyeLeft.y, 2, 'eye'),
    eyeRight: circle(eyeRight.x, eyeRight.y, 2, 'eye'),
    nose: circle(center.x, center.y - 3, 1.5, 'nose'),
    armLeft: line(center.x, center.y, branchLeft.x, branchLeft.y, 'limb'),
    armRight: line(center.x, center.y, branchRight.x, branchRight.y, 'limb'),
    legLeft: line(bottom.x, bottom.y, footLeft.x, footLeft.y, 'limb'),
    legRight: line(bottom.x, bottom.y, footRight.x, footRight.y, 'limb')
  };
}

function buildClusterParts(s, profile) {
  const center = s.center || { x: 32, y: 32 };
  const budBottom = s.budBottom || offset(center, 0, 14);
  const eyeLeft = s.eyeLeft || offset(center, -6, -3);
  const eyeRight = s.eyeRight || offset(center, 6, -3);
  const budLeft = s.budLeft || offset(center, -14, -1);
  const budRight = s.budRight || offset(center, 14, -1);
  const stem = s.stem || offset(center, 0, 21);
  const footLeft = s.footLeft || offset(stem, -7, 6);
  const footRight = s.footRight || offset(stem, 7, 6);
  return {
    body: ellipse(center.x, center.y, 16, 14, 'body'),
    belly: { ...ellipse(budBottom.x, budBottom.y, 9, 7, 'belly'), enabled: Boolean(profile.belly) },
    eyeLeft: circle(eyeLeft.x, eyeLeft.y, 2.5, 'eye'),
    eyeRight: circle(eyeRight.x, eyeRight.y, 2.5, 'eye'),
    nose: circle(center.x, center.y + 2, 1.5, 'nose'),
    armLeft: ellipse(budLeft.x, budLeft.y, 8, 10, 'limb'),
    armRight: ellipse(budRight.x, budRight.y, 8, 10, 'limb'),
    legLeft: line(stem.x, stem.y, footLeft.x, footLeft.y, 'limb'),
    legRight: line(stem.x, stem.y, footRight.x, footRight.y, 'limb')
  };
}

function buildOptionalParts(skeleton) {
  const parts = {};
  const center = anchorPoint(skeleton, ['center', 'body', 'bottom', 'budBottom']) || { x: 32, y: 32 };
  const head = anchorPoint(skeleton, ['head', 'top', 'budTop', 'body', 'center']) || center;
  const body = anchorPoint(skeleton, ['body', 'center', 'bottom', 'budBottom']) || center;
  for (const [key, point] of Object.entries(skeleton)) {
    const base = baseBoneName(key);
    if (!OPTIONAL_PART_BASES.has(base)) continue;
    if (base.startsWith('wing')) parts[key] = ellipse(point.x, point.y, 9, 13, 'wing');
    else if (base.startsWith('legFront')) parts[key] = line(center.x + sideOffset(base, 5), center.y + 12, point.x, point.y, 'limb');
    else if (base.startsWith('legBack')) parts[key] = line(center.x + sideOffset(base, 8), center.y + 15, point.x, point.y, 'limb');
    else if (base === 'horn') parts[key] = line(head.x, head.y - 8, point.x, point.y, 'accent', 2);
    else if (base === 'tail') parts[key] = line(body.x, body.y + 7, point.x, point.y, 'limb');
    else if (base.startsWith('antenna')) parts[key] = line(head.x + sideOffset(base, 4), head.y - 7, point.x, point.y, 'accent', 2);
    else if (base.startsWith('ear')) parts[key] = ellipse(point.x, point.y, 5, 7, 'body');
  }
  return parts;
}

function offset(point, dx, dy) {
  return { x: point.x + dx, y: point.y + dy };
}

function anchorPoint(skeleton, keys) {
  return keys.map((key) => skeleton[key]).find(Boolean);
}

function sideOffset(key, amount) {
  return key.includes('Left') ? -amount : amount;
}

function baseBoneName(key) {
  return key.replace(/\d+$/, '');
}

function addUnique(items, key) {
  if (!items.includes(key)) items.push(key);
}

function ellipse(x, y, rx, ry, colorRole) {
  return { enabled: true, type: 'ellipse', x, y, rx, ry, colorRole };
}
function circle(x, y, r, colorRole) {
  return { enabled: true, type: 'circle', x, y, r, colorRole };
}
function line(x1, y1, x2, y2, colorRole, lineWidth = 3) {
  return { enabled: true, type: 'line', x1, y1, x2, y2, colorRole, lineWidth };
}
