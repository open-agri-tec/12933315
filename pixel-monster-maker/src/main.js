import './style.css';
import { loadImageFile, pixelizeImage } from './imagePixelizer.js';
import { createDefaultSkeleton, buildPartsFromSkeleton, drawSkeletonOverlay } from './canvasModelEditor.js';
import { renderMonsterFromParts } from './pixelRenderer.js';
import { buildMonsterJson, DEFAULT_CANVAS_MODEL } from './monsterSchema.js';
import { downloadCanvasPng, downloadJson } from './exporter.js';

const CANVAS_SIZE = 64;
const state = {
  image: null,
  source: { originalImageName: '', pixelizedPreviewName: 'pixelized-preview.png' },
  colorStep: 32,
  previewState: 'idle',
  selectedKey: null,
  draggingKey: null,
  profile: {
    id: 'monster_001', name: 'test_monster', skeletonType: 'round', eyeType: 'large', limbType: 'short',
    belly: true, palette: 'green', pixelSize: 64, seed: 1
  },
  skeleton: createDefaultSkeleton('round', CANVAS_SIZE),
  parts: {}
};
state.parts = buildPartsFromSkeleton(state.skeleton, state.profile);

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="hero">
    <div><p class="eyebrow">64×64 Canvas Monster JSON Tool</p><h1>Pixel Monster Maker</h1><p>画像を64×64にピクセル化し、骨格・parts・Canvas再描画用 monster.json を生成します。</p></div>
  </header>
  <main class="main-grid">
    <div class="column left-column">
      <section class="panel controls">
        <h2>1. 画像読み込み / 64×64設定</h2>
        <label class="drop-zone"><span>PNG / JPG / WEBPを選択</span><input id="imageInput" type="file" accept="image/png,image/jpeg,image/webp"></label>
        <label>色数削減ステップ<select id="colorStep"><option value="16">16</option><option value="32" selected>32</option><option value="64">64</option></select></label>
      </section>

      <section class="panel controls">
        <h2>2. visualProfile</h2>
        <div class="form-grid">
          <label>id<input data-profile="id" value="monster_001"></label>
          <label>name<input data-profile="name" value="test_monster"></label>
          <label>skeletonType<select data-profile="skeletonType"><option>round</option><option>line</option><option>cluster</option></select></label>
          <label>eyeType<select data-profile="eyeType"><option>large</option><option>small</option></select></label>
          <label>limbType<select data-profile="limbType"><option>short</option><option>long</option></select></label>
          <label>palette<select data-profile="palette"><option>green</option><option>blue</option><option>red</option><option>purple</option></select></label>
          <label class="check"><input data-profile="belly" type="checkbox" checked> belly</label>
        </div>
      </section>

      <section class="panel controls">
        <h2>7. 状態プレビュー</h2>
        <select id="previewState"><option>idle</option><option>happy</option><option>dislike</option><option>eating</option><option>sleep</option></select>
      </section>

      <section class="panel controls">
        <h2>9. 書き出し</h2>
        <div class="button-row"><button id="exportJson">monster.json</button><button id="exportPixel">64×64 PNG</button><button id="exportCanvas">Canvas PNG</button></div>
      </section>
    </div>

    <div class="column center-column">
      <section class="panel canvases">
        <h2>3. ピクセル化プレビューCanvas</h2>
        <div class="canvas-stack">
          <canvas id="pixelCanvas" width="64" height="64" aria-label="ピクセル化プレビュー"></canvas>
          <p id="pixelEmptyHint" class="empty-canvas-message">画像を読み込むと64×64プレビューを表示</p>
        </div>
      </section>

      <section class="panel canvases">
        <h2>4. 骨格編集Canvas</h2>
        <canvas id="skeletonCanvas" width="64" height="64" aria-label="骨格編集Canvas"></canvas>
        <p class="hint">下絵なしでデフォルト骨格を編集可能。骨格点はマウス・タッチでドラッグできます。</p>
      </section>

      <section class="panel canvases">
        <h2>6. Canvas再描画プレビュー</h2>
        <canvas id="renderCanvas" width="64" height="64" aria-label="Canvas再描画プレビュー"></canvas>
        <p class="hint">内部解像度64×64、表示サイズ256×256です。</p>
      </section>
    </div>

    <div class="column right-column">
      <section class="panel parts-panel"><h2>5. 部位編集パネル</h2><div id="partsEditor"></div></section>
      <section class="panel json-panel"><h2>8. monster.jsonプレビュー</h2><pre id="jsonPreview" class="json-preview"></pre></section>
    </div>
  </main>
`;

const pixelCanvas = document.querySelector('#pixelCanvas');
const skeletonCanvas = document.querySelector('#skeletonCanvas');
const renderCanvas = document.querySelector('#renderCanvas');
const pixelEmptyHint = document.querySelector('#pixelEmptyHint');
const partsEditor = document.querySelector('#partsEditor');
const jsonPreview = document.querySelector('#jsonPreview');

wireEvents();
renderAll(true);

function wireEvents() {
  document.querySelector('#imageInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    state.image = await loadImageFile(file);
    state.source.originalImageName = file.name;
    state.source.pixelizedPreviewName = `${file.name.replace(/\.[^.]+$/, '')}-64.png`;
    renderAll();
  });
  document.querySelector('#colorStep').addEventListener('change', (event) => { state.colorStep = Number(event.target.value); renderAll(); });
  document.querySelector('#previewState').addEventListener('change', (event) => { state.previewState = event.target.value; renderAll(); });
  document.querySelectorAll('[data-profile]').forEach((input) => input.addEventListener('input', handleProfileInput));
  document.querySelector('#exportJson').addEventListener('click', () => downloadJson(currentMonster(), `${state.profile.id || 'monster'}.json`));
  document.querySelector('#exportPixel').addEventListener('click', () => downloadCanvasPng(pixelCanvas, state.source.pixelizedPreviewName || 'pixelized-preview.png'));
  document.querySelector('#exportCanvas').addEventListener('click', () => downloadCanvasPng(renderCanvas, `${state.profile.id || 'monster'}-canvas.png`));
  skeletonCanvas.addEventListener('pointerdown', startDrag);
  skeletonCanvas.addEventListener('pointermove', dragPoint);
  skeletonCanvas.addEventListener('pointerup', stopDrag);
  skeletonCanvas.addEventListener('pointercancel', stopDrag);
}

function handleProfileInput(event) {
  const key = event.target.dataset.profile;
  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  const oldType = state.profile.skeletonType;
  state.profile[key] = value;
  if (key === 'skeletonType' && value !== oldType) state.skeleton = createDefaultSkeleton(value, CANVAS_SIZE);
  state.parts = buildPartsFromSkeleton(state.skeleton, state.profile);
  renderAll(true);
}

function renderAll(rebuildEditor = false) {
  drawPixelPreview();
  drawSkeleton();
  renderMonsterFromParts(renderCanvas, currentMonster(), state.previewState);
  if (rebuildEditor) renderPartsEditor();
  pixelEmptyHint.hidden = Boolean(state.image);
  jsonPreview.textContent = JSON.stringify(currentMonster(), null, 2);
}

function drawPixelPreview() {
  const ctx = pixelCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (state.image) ctx.drawImage(pixelizeImage(state.image, CANVAS_SIZE, state.colorStep), 0, 0);
  else drawEmptyGrid(ctx, 'Load image');
}

function drawSkeleton() {
  const ctx = skeletonCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (state.image) ctx.drawImage(pixelCanvas, 0, 0);
  else drawEmptyGrid(ctx, 'Skeleton');
  ctx.fillStyle = 'rgba(6, 10, 18, 0.35)';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawSkeletonOverlay(ctx, state.skeleton, state.selectedKey);
}

function drawEmptyGrid(ctx, label) {
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = '#243044'; ctx.lineWidth = 0.5;
  for (let i = 0; i <= CANVAS_SIZE; i += 8) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke(); }
  ctx.fillStyle = '#8ea0b8'; ctx.font = '6px monospace'; ctx.fillText(label, 8, 33);
}

function renderPartsEditor() {
  partsEditor.innerHTML = '';
  for (const [key, part] of Object.entries(state.parts)) {
    const details = document.createElement('details'); details.open = true;
    details.innerHTML = `<summary>${key}</summary>`;
    const grid = document.createElement('div'); grid.className = 'part-grid';
    for (const field of ['enabled', 'type', 'x', 'y', 'w', 'h', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'colorRole']) grid.appendChild(partField(key, part, field));
    details.appendChild(grid); partsEditor.appendChild(details);
  }
}

function partField(partKey, part, field) {
  const label = document.createElement('label'); label.textContent = field;
  let input;
  if (field === 'enabled') { input = document.createElement('input'); input.type = 'checkbox'; input.checked = Boolean(part.enabled); }
  else if (field === 'type') { input = document.createElement('select'); ['rect', 'circle', 'ellipse', 'line'].forEach((v) => input.append(new Option(v, v, false, part.type === v))); }
  else if (field === 'colorRole') { input = document.createElement('input'); input.value = part[field] ?? ''; }
  else { input = document.createElement('input'); input.type = 'number'; input.step = '0.5'; input.value = part[field] ?? ''; }
  input.addEventListener('input', () => {
    const value = input.type === 'checkbox' ? input.checked : input.type === 'number' ? (input.value === '' ? undefined : Number(input.value)) : input.value;
    if (value === undefined) delete state.parts[partKey][field]; else state.parts[partKey][field] = value;
    renderAll(false);
  });
  label.appendChild(input); return label;
}

function startDrag(event) {
  const point = canvasPoint(event);
  const hit = nearestSkeletonPoint(point);
  if (hit) { state.draggingKey = hit; state.selectedKey = hit; skeletonCanvas.setPointerCapture(event.pointerId); renderAll(); }
}
function dragPoint(event) {
  if (!state.draggingKey) return;
  const point = canvasPoint(event);
  state.skeleton[state.draggingKey] = { x: clamp(point.x), y: clamp(point.y) };
  state.parts = buildPartsFromSkeleton(state.skeleton, state.profile);
  renderAll(true);
}
function stopDrag() { state.draggingKey = null; }
function canvasPoint(event) {
  const rect = skeletonCanvas.getBoundingClientRect();
  return { x: ((event.clientX - rect.left) / rect.width) * CANVAS_SIZE, y: ((event.clientY - rect.top) / rect.height) * CANVAS_SIZE };
}
function nearestSkeletonPoint(point) {
  let best = null; let dist = 99;
  for (const [key, p] of Object.entries(state.skeleton)) {
    const d = Math.hypot(p.x - point.x, p.y - point.y);
    if (d < 5 && d < dist) { best = key; dist = d; }
  }
  return best;
}
function clamp(value) { return Math.max(0, Math.min(CANVAS_SIZE, Math.round(value))); }
function currentMonster() { return buildMonsterJson({ profile: state.profile, skeleton: state.skeleton, parts: state.parts, canvasModel: DEFAULT_CANVAS_MODEL, source: state.source }); }
