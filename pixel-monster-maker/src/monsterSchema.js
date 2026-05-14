export const DEFAULT_CANVAS_MODEL = {
  drawMode: 'parts',
  canvasWidth: 64,
  canvasHeight: 64,
  displayScale: 4,
  partsOrder: ['legLeft', 'legRight', 'body', 'belly', 'armLeft', 'armRight', 'eyeLeft', 'eyeRight', 'nose']
};

export const DEFAULT_ANIMATIONS = {
  idle: { type: 'breath', frames: 2, targetParts: ['body', 'belly', 'eyeLeft', 'eyeRight'] },
  happy: { type: 'jump', frames: 3, targetParts: ['body', 'armLeft', 'armRight', 'eyeLeft', 'eyeRight'] },
  dislike: { type: 'shake', frames: 3, targetParts: ['body', 'eyeLeft', 'eyeRight'] },
  eating: { type: 'squash', frames: 3, targetParts: ['body', 'belly'] },
  sleep: { type: 'rest', frames: 2, targetParts: ['body', 'eyeLeft', 'eyeRight'] }
};

export const DEFAULT_GAME_BINDINGS = {
  defaultState: 'idle',
  reactionMap: { 大好物: 'happy', 普通: 'eating', 苦手: 'dislike', 睡眠: 'sleep' }
};

export function buildMonsterJson({ profile, skeleton, parts, canvasModel, source }) {
  return {
    schemaVersion: '0.1',
    id: profile.id,
    name: profile.name,
    source: {
      originalImageName: source?.originalImageName || '',
      pixelSize: 64,
      pixelizedPreviewName: source?.pixelizedPreviewName || ''
    },
    visualProfile: { ...profile, pixelSize: 64 },
    canvasModel: { ...DEFAULT_CANVAS_MODEL, ...canvasModel },
    skeleton,
    parts,
    animations: DEFAULT_ANIMATIONS,
    gameBindings: DEFAULT_GAME_BINDINGS
  };
}
