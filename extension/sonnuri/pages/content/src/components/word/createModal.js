export default function createModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid black;
      padding: 10px;
      z-index: 10001;
      width: 480px;
      height: 360px;
      display: none; /* 초기에는 숨김 */
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
  modal.textContent = 'word';
  document.body.appendChild(modal);
  return modal;
}
