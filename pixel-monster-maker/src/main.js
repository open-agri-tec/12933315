import './style.css';
import { loadImageFile, pixelizeImage } from './imagePixelizer.js';
import { createDefaultSkeleton, buildPartsFromSkeleton, buildPartsOrder, drawSkeletonBase, drawSkeletonLabels } from './canvasModelEditor.js';
import { renderMonsterFromParts } from './pixelRenderer.js';
import { buildMonsterJson, DEFAULT_CANVAS_MODEL } from './monsterSchema.js';
import { downloadCanvasPng, downloadJson } from './exporter.js';

const CANVAS_SIZE = 64;
const DISPLAY_SIZE = 320;
const COLOR_ROLES = ['body', 'belly', 'limb', 'eye', 'nose', 'pattern', 'accent', 'shadow'];
const PART_TYPES = ['rect', 'circle', 'ellipse', 'line', 'pixelMask', 'spritePatch'];

const state = {
  image: null,
  pixelizedCanvas: null,
  pixelizedImageData: null,
  source: { originalImageName: '', pixelizedPreviewName: 'pixelized-preview.png' },
  colorStep: 32,
  previewState: 'idle',
  selectedKey: null,
  draggingKey: null,
  selectedPartKey: null,
  labelMode: 'selected',
  selection: null,
  selecting: null,
  extractedParts: {},
  profile: {
    id: 'monster_001', name: 'test_monster', skeletonType: 'round', eyeType: 'large', limbType: 'short',
    belly: true, palette: 'green', pixelSize: 64, seed: 1
  },
  skeleton: createDefaultSkeleton('round', CANVAS_SIZE),
  parts: {}
};
rebuildPartsFromState();

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="hero maker-header">
    <div>
      <p class="eyebrow">64×64 Canvas Monster JSON Tool</p>
      <h1>Pixel Monster Maker</h1>
      <p>画像を64×64へピクセル化し、下絵からCanvas再描画用の parts / skeleton / monster.json を作ります。</p>
    </div>
    <section class="panel top-panel source-panel">
      <h2>Source Image</h2>
      <label class="drop-zone"><span>PNG / JPG / WEBPを選択</span><input id="imageInput" type="file" accept="image/png,image/jpeg,image/webp"></label>
      <label>色数削減ステップ<select id="colorStep"><option value="16">16</option><option value="32" selected>32</option><option value="64">64</option></select></label>
    </section>
    <section class="panel top-panel profile-panel">
      <h2>visualProfile</h2>
      <div class="form-grid compact-profile">
        <label>id<input data-profile="id" value="monster_001"></label>
        <label>name<input data-profile="name" value="test_monster"></label>
        <label>skeleton<select data-profile="skeletonType"><option>round</option><option>line</option><option>cluster</option></select></label>
        <label>palette<select data-profile="palette"><option>green</option><option>blue</option><option>red</option><option>purple</option></select></label>
        <label>eye<select data-profile="eyeType"><option>large</option><option>small</option></select></label>
        <label>limb<select data-profile="limbType"><option>short</option><option>long</option></select></label>
        <label class="check"><input data-profile="belly" type="checkbox" checked> belly</label>
      </div>
    </section>
    <section class="panel top-panel export-panel">
      <h2>Canvas Preview / Export</h2>
      <label>状態プレビュー<select id="previewState"><option>idle</option><option>happy</option><option>dislike</option><option>eating</option><option>sleep</option></select></label>
      <div class="button-row export-actions"><button id="exportJson">monster.json</button><button id="exportPixel">64×64 PNG</button><button id="exportCanvas">Canvas PNG</button></div>
    </section>
  </header>

  <main class="workspace-grid">
    <div class="column canvas-column">
      <section class="panel canvases">
        <h2>Pixelize</h2>
        <div class="canvas-stack selectable-stack" data-selection-host="pixel">
          <canvas id="pixelCanvas" width="64" height="64" aria-label="ピクセル化プレビュー"></canvas>
          <canvas id="pixelSelectionCanvas" class="ui-overlay" width="320" height="320" aria-label="範囲選択レイヤー"></canvas>
          <p id="pixelEmptyHint" class="empty-canvas-message">画像を読み込むと64×64プレビューを表示</p>
        </div>
        <p class="hint">ピクセル化画像上でドラッグすると、pixelMask / spritePatch 用の矩形範囲を選択できます。</p>
      </section>

      <section class="panel canvases">
        <h2>Skeleton</h2>
        <div class="canvas-stack skeleton-stack selectable-stack" data-selection-host="skeleton">
          <canvas id="skeletonCanvas" width="64" height="64" aria-label="骨格編集Canvas"></canvas>
          <canvas id="skeletonOverlayCanvas" class="ui-overlay" width="320" height="320" aria-label="骨格ラベル表示レイヤー"></canvas>
        </div>
        <div class="inline-options">
          <label>ラベル表示モード<select id="labelMode"><option value="selected" selected>selected</option><option value="all">all</option><option value="none">none</option></select></label>
        </div>
        <p class="hint">点は64×64座標で管理し、ラベルは320×320の高解像度オーバーレイに描画します。ボーン点以外をドラッグすると範囲選択できます。</p>
      </section>

      <section class="panel canvases">
        <h2>Canvas Preview</h2>
        <canvas id="renderCanvas" width="64" height="64" aria-label="Canvas再描画プレビュー"></canvas>
        <p class="hint">rect / circle / ellipse / line / pixelMask / spritePatch を64×64内部座標で再描画します。</p>
      </section>
    </div>

    <div class="column tools-column">
      <section class="panel controls bone-panel">
        <h2>Skeleton Bones</h2>
        <div class="form-grid">
          <label>追加するボーン種別<select id="bonePreset">
            <option value="wingLeft">wingLeft: 左羽</option>
            <option value="wingRight">wingRight: 右羽</option>
            <option value="legFrontLeft">legFrontLeft: 左前脚</option>
            <option value="legFrontRight">legFrontRight: 右前脚</option>
            <option value="legBackLeft">legBackLeft: 左後脚</option>
            <option value="legBackRight">legBackRight: 右後脚</option>
            <option value="horn">horn: 角</option>
            <option value="tail">tail: 尾</option>
            <option value="antennaLeft">antennaLeft: 左触角</option>
            <option value="antennaRight">antennaRight: 右触角</option>
            <option value="earLeft">earLeft: 左耳</option>
            <option value="earRight">earRight: 右耳</option>
            <option value="custom">custom: カスタム</option>
          </select></label>
          <label>カスタム名<input id="customBoneName" placeholder="customBone"></label>
        </div>
        <div class="button-row bone-actions"><button id="addBone">ボーン追加</button><button id="deleteSelectedBone" class="danger-button">選択中ボーンを削除</button></div>
        <p class="selected-bone">選択中: <strong id="selectedBoneName">なし</strong></p>
        <div id="boneList" class="bone-list"></div>
      </section>

      <section class="panel controls extract-panel">
        <h2>Extract Parts</h2>
        <p id="selectionStatus" class="selection-status">選択範囲: なし</p>
        <div class="form-grid">
          <label>part名<input id="extractPartName" placeholder="facePatch"></label>
          <label>抽出方式<select id="extractType"><option value="pixelMask">pixelMask</option><option value="spritePatch">spritePatch</option></select></label>
          <label>colorRole<select id="extractColorRole">${COLOR_ROLES.map((role) => `<option value="${role}">${role}</option>`).join('')}</select></label>
        </div>
        <button id="extractPart">選択範囲をpart化</button>
        <p class="hint">pixelMaskは不透明ピクセル(alpha &gt; 0)を相対座標で保存し、spritePatchはsourceRect/targetだけをJSONに保存します。</p>
      </section>

      <section class="panel controls parts-panel">
        <h2>Parts Editor</h2>
        <details class="order-details" open><summary>partsOrder</summary><ol id="partsOrderList" class="parts-order-list"></ol></details>
        <div id="partsEditor"></div>
      </section>
    </div>
  </main>

  <section class="panel json-panel">
    <details open>
      <summary>JSON / monster.jsonプレビュー</summary>
      <pre id="jsonPreview" class="json-preview"></pre>
    </details>
  </section>
`;

const pixelCanvas = document.querySelector('#pixelCanvas');
const pixelSelectionCanvas = document.querySelector('#pixelSelectionCanvas');
const skeletonCanvas = document.querySelector('#skeletonCanvas');
const skeletonOverlayCanvas = document.querySelector('#skeletonOverlayCanvas');
const renderCanvas = document.querySelector('#renderCanvas');
const pixelEmptyHint = document.querySelector('#pixelEmptyHint');
const partsEditor = document.querySelector('#partsEditor');
const partsOrderList = document.querySelector('#partsOrderList');
const jsonPreview = document.querySelector('#jsonPreview');
const bonePreset = document.querySelector('#bonePreset');
const customBoneName = document.querySelector('#customBoneName');
const selectedBoneName = document.querySelector('#selectedBoneName');
const boneList = document.querySelector('#boneList');
const selectionStatus = document.querySelector('#selectionStatus');
const extractPartName = document.querySelector('#extractPartName');
const extractType = document.querySelector('#extractType');
const extractColorRole = document.querySelector('#extractColorRole');

wireEvents();
renderAll(true);

function wireEvents() {
  document.querySelector('#imageInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    state.image = await loadImageFile(file);
    state.source.originalImageName = file.name;
    state.source.pixelizedPreviewName = `${file.name.replace(/\.[^.]+$/, '')}-64.png`;
    refreshPixelizedCanvas();
    renderAll();
  });
  document.querySelector('#colorStep').addEventListener('change', (event) => { state.colorStep = Number(event.target.value); refreshPixelizedCanvas(); renderAll(); });
  document.querySelector('#previewState').addEventListener('change', (event) => { state.previewState = event.target.value; renderAll(); });
  document.querySelectorAll('[data-profile]').forEach((input) => input.addEventListener('input', handleProfileInput));
  document.querySelector('#exportJson').addEventListener('click', () => downloadJson(currentMonster(), `${state.profile.id || 'monster'}.json`));
  document.querySelector('#exportPixel').addEventListener('click', () => downloadCanvasPng(pixelCanvas, state.source.pixelizedPreviewName || 'pixelized-preview.png'));
  document.querySelector('#exportCanvas').addEventListener('click', () => downloadCanvasPng(renderCanvas, `${state.profile.id || 'monster'}-canvas.png`));
  document.querySelector('#labelMode').addEventListener('change', (event) => { state.labelMode = event.target.value; renderAll(); });
  document.querySelector('#addBone').addEventListener('click', addBone);
  document.querySelector('#deleteSelectedBone').addEventListener('click', () => deleteBone(state.selectedKey));
  document.querySelector('#extractPart').addEventListener('click', extractSelectionToPart);

  pixelSelectionCanvas.addEventListener('pointerdown', (event) => startSelection(event, pixelSelectionCanvas));
  pixelSelectionCanvas.addEventListener('pointermove', updateSelection);
  pixelSelectionCanvas.addEventListener('pointerup', finishSelection);
  pixelSelectionCanvas.addEventListener('pointercancel', finishSelection);

  skeletonCanvas.addEventListener('pointerdown', startSkeletonPointer);
  skeletonCanvas.addEventListener('pointermove', skeletonPointerMove);
  skeletonCanvas.addEventListener('pointerup', stopSkeletonPointer);
  skeletonCanvas.addEventListener('pointercancel', stopSkeletonPointer);
}

function handleProfileInput(event) {
  const key = event.target.dataset.profile;
  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  const oldType = state.profile.skeletonType;
  state.profile[key] = value;
  if (key === 'skeletonType' && value !== oldType) state.skeleton = createDefaultSkeleton(value, CANVAS_SIZE);
  rebuildPartsFromState();
  renderAll(true);
}

function renderAll(rebuildEditor = false) {
  drawPixelPreview();
  drawSkeleton();
  renderMonsterFromParts(renderCanvas, currentMonster(), state.previewState, { spriteSourceImageData: state.pixelizedImageData });
  drawSelectionOverlays();
  if (rebuildEditor) { renderPartsEditor(); renderBoneList(); renderPartsOrder(); }
  updateSelectedBoneDisplay();
  updateSelectionStatus();
  pixelEmptyHint.hidden = Boolean(state.image);
  jsonPreview.textContent = JSON.stringify(currentMonster(), null, 2);
}

function refreshPixelizedCanvas() {
  if (!state.image) {
    state.pixelizedCanvas = null;
    state.pixelizedImageData = null;
    return;
  }
  state.pixelizedCanvas = pixelizeImage(state.image, CANVAS_SIZE, state.colorStep);
  state.pixelizedImageData = state.pixelizedCanvas.getContext('2d').getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function drawPixelPreview() {
  const ctx = pixelCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (state.image) {
    if (!state.pixelizedCanvas) refreshPixelizedCanvas();
    ctx.drawImage(state.pixelizedCanvas, 0, 0);
  } else {
    drawEmptyGrid(ctx, 'Load image');
  }
}

function drawSkeleton() {
  const ctx = skeletonCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (state.image) ctx.drawImage(pixelCanvas, 0, 0);
  else drawEmptyGrid(ctx, 'Skeleton');
  ctx.fillStyle = 'rgba(6, 10, 18, 0.35)';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawSkeletonBase(ctx, state.skeleton, state.selectedKey);
}


function drawSelectionOverlays() {
  drawSelectionOverlay(pixelSelectionCanvas);
  drawSelectionOverlay(skeletonOverlayCanvas);
  const overlayCtx = skeletonOverlayCanvas.getContext('2d');
  drawSkeletonLabels(overlayCtx, state.skeleton, state.selectedKey, { labelMode: state.labelMode, width: DISPLAY_SIZE, height: DISPLAY_SIZE, scale: DISPLAY_SIZE / CANVAS_SIZE, preserveExisting: true });
}

function drawSelectionOverlay(canvas, preserveExisting = false) {
  const ctx = canvas.getContext('2d');
  if (!preserveExisting) ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!state.selection && !state.selecting) return;
  const selection = state.selecting ? normalizedSelection(state.selecting.start, state.selecting.current) : state.selection;
  if (!selection) return;
  const scale = canvas.width / CANVAS_SIZE;
  ctx.save();
  ctx.strokeStyle = '#ffdf6e';
  ctx.fillStyle = 'rgba(255, 223, 110, 0.18)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.fillRect(selection.x * scale, selection.y * scale, selection.w * scale, selection.h * scale);
  ctx.strokeRect(selection.x * scale + 1, selection.y * scale + 1, selection.w * scale - 2, selection.h * scale - 2);
  ctx.restore();
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
    const details = document.createElement('details');
    details.open = key === state.selectedPartKey;
    const summary = document.createElement('summary');
    summary.textContent = `${key} (${part.type})`;
    summary.addEventListener('click', () => { state.selectedPartKey = key; });
    details.appendChild(summary);

    const grid = document.createElement('div');
    grid.className = 'part-grid';
    const fields = fieldsForPart(part);
    for (const field of fields) grid.appendChild(partField(key, part, field));
    details.appendChild(grid);

    if (part.type === 'pixelMask') {
      const meta = document.createElement('p');
      meta.className = 'part-meta';
      meta.textContent = `pixels.length: ${part.pixels?.length || 0}`;
      details.appendChild(meta);
    }
    if (part.type === 'spritePatch') {
      const patchGrid = document.createElement('div');
      patchGrid.className = 'part-grid';
      for (const field of ['sourceRect.x', 'sourceRect.y', 'sourceRect.w', 'sourceRect.h', 'target.x', 'target.y']) patchGrid.appendChild(nestedPartField(key, part, field));
      details.appendChild(patchGrid);
    }
    partsEditor.appendChild(details);
  }
}

function fieldsForPart(part) {
  if (part.type === 'pixelMask') return ['enabled', 'type', 'x', 'y', 'colorRole'];
  if (part.type === 'spritePatch') return ['enabled', 'type'];
  return ['enabled', 'type', 'x', 'y', 'w', 'h', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'lineWidth', 'colorRole'];
}

function partField(partKey, part, field) {
  const label = document.createElement('label'); label.textContent = field;
  let input;
  if (field === 'enabled') { input = document.createElement('input'); input.type = 'checkbox'; input.checked = Boolean(part.enabled); }
  else if (field === 'type') { input = document.createElement('select'); PART_TYPES.forEach((v) => input.append(new Option(v, v, false, part.type === v))); }
  else if (field === 'colorRole') { input = document.createElement('select'); COLOR_ROLES.forEach((v) => input.append(new Option(v, v, false, part.colorRole === v))); }
  else { input = document.createElement('input'); input.type = 'number'; input.step = '0.5'; input.value = part[field] ?? ''; }
  input.addEventListener('input', () => {
    const value = input.type === 'checkbox' ? input.checked : input.type === 'number' ? (input.value === '' ? undefined : Number(input.value)) : input.value;
    if (value === undefined) delete state.parts[partKey][field]; else state.parts[partKey][field] = value;
    syncExtractedPart(partKey);
    renderAll(field === 'type');
  });
  label.appendChild(input); return label;
}

function nestedPartField(partKey, part, path) {
  const [group, field] = path.split('.');
  const label = document.createElement('label');
  label.textContent = path;
  const input = document.createElement('input');
  input.type = 'number';
  input.step = '1';
  input.value = part[group]?.[field] ?? '';
  input.addEventListener('input', () => {
    if (!state.parts[partKey][group]) state.parts[partKey][group] = {};
    state.parts[partKey][group][field] = input.value === '' ? 0 : clamp(Number(input.value), field === 'w' || field === 'h' ? 1 : 0, CANVAS_SIZE);
    syncExtractedPart(partKey);
    renderAll(false);
  });
  label.appendChild(input);
  return label;
}

function renderPartsOrder() {
  partsOrderList.innerHTML = '';
  for (const key of buildPartsOrder(state.parts)) {
    const item = document.createElement('li');
    item.textContent = key;
    partsOrderList.appendChild(item);
  }
}

function startSkeletonPointer(event) {
  const point = canvasPoint(event, skeletonCanvas);
  const hit = nearestSkeletonPoint(point);
  if (hit) {
    state.draggingKey = hit;
    state.selectedKey = hit;
    skeletonCanvas.setPointerCapture(event.pointerId);
    renderAll();
    return;
  }
  startSelection(event, skeletonCanvas);
}

function startSelection(event, canvas) {
  const point = canvasPoint(event, canvas);
  state.selecting = { start: point, current: point, pointerId: event.pointerId, canvas };
  canvas.setPointerCapture?.(event.pointerId);
  renderAll();
}

function updateSelection(event) {
  if (!state.selecting) return;
  state.selecting.current = canvasPoint(event, state.selecting.canvas);
  renderAll();
}

function finishSelection(event) {
  if (!state.selecting) return;
  state.selecting.current = canvasPoint(event, state.selecting.canvas);
  const selection = normalizedSelection(state.selecting.start, state.selecting.current);
  state.selection = selection?.w > 0 && selection?.h > 0 ? selection : null;
  state.selecting = null;
  renderAll();
}

function normalizedSelection(a, b) {
  const x1 = clamp(Math.min(a.x, b.x));
  const y1 = clamp(Math.min(a.y, b.y));
  const x2 = clamp(Math.max(a.x, b.x));
  const y2 = clamp(Math.max(a.y, b.y));
  return { x: x1, y: y1, w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1) };
}

function updateSelectionStatus() {
  selectionStatus.textContent = state.selection ? `選択範囲: x=${state.selection.x}, y=${state.selection.y}, w=${state.selection.w}, h=${state.selection.h}` : '選択範囲: なし';
}

function extractSelectionToPart() {
  if (!state.selection || !state.pixelizedImageData) return;
  const baseName = sanitizeBoneName(extractPartName.value.trim() || extractType.value);
  if (!baseName) return;
  const key = uniquePartName(baseName);
  const { x, y, w, h } = state.selection;
  const type = extractType.value;
  const part = type === 'spritePatch'
    ? { enabled: true, type: 'spritePatch', sourceRect: { x, y, w, h }, target: { x, y } }
    : { enabled: true, type: 'pixelMask', x, y, colorRole: extractColorRole.value, pixels: collectMaskPixels(state.pixelizedImageData, state.selection) };
  state.extractedParts[key] = part;
  state.selectedPartKey = key;
  extractPartName.value = nextExtractName(type);
  rebuildPartsFromState();
  renderAll(true);
}

function collectMaskPixels(imageData, selection) {
  const pixels = [];
  for (let py = selection.y; py < selection.y + selection.h; py += 1) {
    for (let px = selection.x; px < selection.x + selection.w; px += 1) {
      const index = (py * imageData.width + px) * 4;
      if (imageData.data[index + 3] > 0) pixels.push([px - selection.x, py - selection.y]);
    }
  }
  return pixels;
}

function nextExtractName(type) {
  const prefix = type === 'spritePatch' ? 'spritePatch' : 'pixelMask';
  let index = Object.keys(state.extractedParts).length + 1;
  while (state.parts[`${prefix}${index}`]) index += 1;
  return `${prefix}${index}`;
}

function startDrag(event) {
  const point = canvasPoint(event, skeletonCanvas);
  const hit = nearestSkeletonPoint(point);
  if (hit) { state.draggingKey = hit; state.selectedKey = hit; skeletonCanvas.setPointerCapture(event.pointerId); renderAll(); }
}
function dragPoint(event) {
  if (!state.draggingKey) return;
  const point = canvasPoint(event, skeletonCanvas);
  state.skeleton[state.draggingKey] = { x: clamp(point.x), y: clamp(point.y) };
  rebuildPartsFromState();
  renderAll(true);
}
function skeletonPointerMove(event) {
  if (state.selecting) updateSelection(event);
  else dragPoint(event);
}
function stopSkeletonPointer(event) {
  if (state.selecting) finishSelection(event);
  state.draggingKey = null;
}
function stopDrag() { state.draggingKey = null; }
function canvasPoint(event, canvas = skeletonCanvas) {
  const rect = canvas.getBoundingClientRect();
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
function clamp(value, min = 0, max = CANVAS_SIZE) { return Math.max(min, Math.min(max, Math.round(value))); }

function addBone() {
  const preset = bonePreset.value;
  const requestedName = preset === 'custom' ? customBoneName.value.trim() : preset;
  const baseName = sanitizeBoneName(requestedName);
  if (!baseName) return;
  const key = uniqueBoneName(baseName);
  const anchor = state.skeleton.center || state.skeleton.body || state.skeleton.bottom || { x: 32, y: 32 };
  state.skeleton[key] = { x: clamp(anchor.x + 2), y: clamp(anchor.y + 2) };
  state.selectedKey = key;
  rebuildPartsFromState();
  renderAll(true);
}

function renderBoneList() {
  boneList.innerHTML = '';
  for (const [key, point] of Object.entries(state.skeleton)) {
    const row = document.createElement('div');
    row.className = 'bone-row';
    if (key === state.selectedKey) row.classList.add('selected');

    const name = document.createElement('span');
    name.className = 'bone-name';
    name.textContent = key;

    const xInput = boneCoordinateInput(key, 'x', point.x);
    const yInput = boneCoordinateInput(key, 'y', point.y);

    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.textContent = '選択';
    selectButton.addEventListener('click', () => {
      state.selectedKey = key;
      renderAll(true);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'danger-button compact-button';
    deleteButton.textContent = '削除';
    deleteButton.addEventListener('click', () => deleteBone(key));

    row.append(name, xInput, yInput, selectButton, deleteButton);
    boneList.appendChild(row);
  }
}

function boneCoordinateInput(key, axis, value) {
  const label = document.createElement('label');
  label.className = 'compact-field';
  label.textContent = axis;
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(CANVAS_SIZE);
  input.step = '1';
  input.value = value;
  input.addEventListener('input', () => {
    const nextValue = input.value === '' ? 0 : clamp(Number(input.value));
    state.skeleton[key] = { ...state.skeleton[key], [axis]: nextValue };
    rebuildPartsFromState();
    renderAll(false);
  });
  input.addEventListener('change', () => renderAll(true));
  label.appendChild(input);
  return label;
}

function deleteBone(key) {
  if (!key || !state.skeleton[key]) return;
  if (isBasicBone(key) && !confirm(`基本ボーン「${key}」を削除しますか？`)) return;
  delete state.skeleton[key];
  if (state.selectedKey === key) state.selectedKey = null;
  if (state.draggingKey === key) state.draggingKey = null;
  rebuildPartsFromState();
  renderAll(true);
}

function updateSelectedBoneDisplay() {
  selectedBoneName.textContent = state.selectedKey || 'なし';
}

function sanitizeBoneName(name) {
  return name.replace(/[^A-Za-z0-9_]/g, '').replace(/^[0-9]+/, '');
}

function uniqueBoneName(baseName) {
  if (!state.skeleton[baseName]) return baseName;
  let index = 2;
  while (state.skeleton[`${baseName}${index}`]) index += 1;
  return `${baseName}${index}`;
}

function uniquePartName(baseName) {
  if (!state.parts[baseName]) return baseName;
  let index = 2;
  while (state.parts[`${baseName}${index}`]) index += 1;
  return `${baseName}${index}`;
}

function isBasicBone(key) {
  return ['center', 'body', 'head', 'eyeLeft', 'eyeRight'].includes(key);
}

function rebuildPartsFromState() {
  state.parts = { ...buildPartsFromSkeleton(state.skeleton, state.profile), ...state.extractedParts };
}

function syncExtractedPart(partKey) {
  if (state.extractedParts[partKey]) state.extractedParts[partKey] = structuredClone(state.parts[partKey]);
}

function currentMonster() { return buildMonsterJson({ profile: state.profile, skeleton: state.skeleton, parts: state.parts, canvasModel: { ...DEFAULT_CANVAS_MODEL, partsOrder: buildPartsOrder(state.parts) }, source: state.source }); }
