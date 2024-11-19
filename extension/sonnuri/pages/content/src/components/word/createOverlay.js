export default function createOverlay() {
  const overlay = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.id = 'highlightCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);
  const ctx = canvas.getContext('2d');
  return { overlay, canvas, ctx };
}
