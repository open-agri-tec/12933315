export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      reject(new Error('PNG / JPG / WEBP 画像を選択してください。'));
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('画像を読み込めませんでした。'));
    image.src = URL.createObjectURL(file);
  });
}

export function pixelizeImage(image, size = 64, colorStep = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);

  const scale = Math.min(size / image.width, size / image.height);
  const drawWidth = Math.max(1, Math.round(image.width * scale));
  const drawHeight = Math.max(1, Math.round(image.height * scale));
  const dx = Math.floor((size - drawWidth) / 2);
  const dy = Math.floor((size - drawHeight) / 2);
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const step = Number(colorStep) || 32;
  for (let index = 0; index < data.length; index += 4) {
    data[index] = quantize(data[index], step);
    data[index + 1] = quantize(data[index + 1], step);
    data[index + 2] = quantize(data[index + 2], step);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function quantize(value, step) {
  return Math.max(0, Math.min(255, Math.round(value / step) * step));
}
