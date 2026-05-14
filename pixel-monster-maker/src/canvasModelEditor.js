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

export function createDefaultSkeleton(skeletonType, size = 64) {
  const template = SKELETON_POINTS[skeletonType] || SKELETON_POINTS.round;
  const scale = size / 64;
  return Object.fromEntries(
    Object.entries(template).map(([key, [x, y]]) => [key, { x: Math.round(x * scale), y: Math.round(y * scale) }])
  );
}

export function buildPartsFromSkeleton(skeleton, profile) {
  const type = profile.skeletonType;
  if (type === 'line') return buildLineParts(skeleton, profile);
  if (type === 'cluster') return buildClusterParts(skeleton, profile);
  return buildRoundParts(skeleton, profile);
}

export function drawSkeletonOverlay(ctx, skeleton, selectedKey) {
  ctx.save();
  ctx.font = '4px monospace';
  ctx.textBaseline = 'top';
  ctx.lineWidth = 1;
  const entries = Object.entries(skeleton);
  ctx.strokeStyle = 'rgba(127, 219, 255, 0.7)';
  ctx.beginPath();
  for (const [, point] of entries) ctx.lineTo(point.x, point.y);
  ctx.stroke();

  for (const [key, point] of entries) {
    const selected = key === selectedKey;
    ctx.fillStyle = selected ? '#ffdf6e' : '#69f0ae';
    ctx.strokeStyle = '#101522';
    ctx.beginPath();
    ctx.arc(point.x, point.y, selected ? 2.4 : 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = selected ? '#ffdf6e' : '#ffffff';
    ctx.fillText(key, Math.min(point.x + 3, 48), Math.max(0, point.y - 4));
  }
  ctx.restore();
}

function buildRoundParts(s, profile) {
  const body = s.body || s.center;
  const center = s.center || body;
  return {
    body: ellipse(body.x, body.y, 18, 20, 'body'),
    belly: { ...ellipse(center.x, center.y + 8, 10, 8, 'belly'), enabled: Boolean(profile.belly) },
    eyeLeft: circle(s.eyeLeft.x, s.eyeLeft.y, profile.eyeType === 'small' ? 2 : 3, 'eye'),
    eyeRight: circle(s.eyeRight.x, s.eyeRight.y, profile.eyeType === 'small' ? 2 : 3, 'eye'),
    nose: circle(s.nose.x, s.nose.y, 2, 'nose'),
    armLeft: line(center.x - 12, center.y + 2, s.armLeft.x, s.armLeft.y, 'limb'),
    armRight: line(center.x + 12, center.y + 2, s.armRight.x, s.armRight.y, 'limb'),
    legLeft: line(center.x - 6, center.y + 17, s.legLeft.x, s.legLeft.y, 'limb'),
    legRight: line(center.x + 6, center.y + 17, s.legRight.x, s.legRight.y, 'limb')
  };
}

function buildLineParts(s, profile) {
  return {
    body: line(s.top.x, s.top.y, s.bottom.x, s.bottom.y, 'body'),
    belly: { ...ellipse(s.center.x, s.center.y + 7, 7, 6, 'belly'), enabled: Boolean(profile.belly) },
    eyeLeft: circle(s.eyeLeft.x, s.eyeLeft.y, 2, 'eye'),
    eyeRight: circle(s.eyeRight.x, s.eyeRight.y, 2, 'eye'),
    nose: circle(s.center.x, s.center.y - 3, 1.5, 'nose'),
    armLeft: line(s.center.x, s.center.y, s.branchLeft.x, s.branchLeft.y, 'limb'),
    armRight: line(s.center.x, s.center.y, s.branchRight.x, s.branchRight.y, 'limb'),
    legLeft: line(s.bottom.x, s.bottom.y, s.footLeft.x, s.footLeft.y, 'limb'),
    legRight: line(s.bottom.x, s.bottom.y, s.footRight.x, s.footRight.y, 'limb')
  };
}

function buildClusterParts(s, profile) {
  return {
    body: ellipse(s.center.x, s.center.y, 16, 14, 'body'),
    belly: { ...ellipse(s.budBottom.x, s.budBottom.y, 9, 7, 'belly'), enabled: Boolean(profile.belly) },
    eyeLeft: circle(s.eyeLeft.x, s.eyeLeft.y, 2.5, 'eye'),
    eyeRight: circle(s.eyeRight.x, s.eyeRight.y, 2.5, 'eye'),
    nose: circle(s.center.x, s.center.y + 2, 1.5, 'nose'),
    armLeft: ellipse(s.budLeft.x, s.budLeft.y, 8, 10, 'limb'),
    armRight: ellipse(s.budRight.x, s.budRight.y, 8, 10, 'limb'),
    legLeft: line(s.stem.x, s.stem.y, s.footLeft.x, s.footLeft.y, 'limb'),
    legRight: line(s.stem.x, s.stem.y, s.footRight.x, s.footRight.y, 'limb')
  };
}

function ellipse(x, y, rx, ry, colorRole) {
  return { enabled: true, type: 'ellipse', x, y, rx, ry, colorRole };
}
function circle(x, y, r, colorRole) {
  return { enabled: true, type: 'circle', x, y, r, colorRole };
}
function line(x1, y1, x2, y2, colorRole) {
  return { enabled: true, type: 'line', x1, y1, x2, y2, colorRole };
}
