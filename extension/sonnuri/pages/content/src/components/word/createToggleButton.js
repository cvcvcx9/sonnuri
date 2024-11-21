import { highlightState } from '../../index';
import highlightTextNodes from './highlightTextNodes';
export default function createToggleButton(ctx, canvas, highlights, serverWords, isElementCovered) {
  const controlPanel = document.createElement('div');

  controlPanel.style.cssText = `
    position: fixed;
    bottom: 50%;
    right: 10px;
    z-index: 10000;
    background: white;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;

  // 토글 버튼
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggle-button';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.border = 'none';
  toggleButton.style.backgroundColor = 'transparent';
  toggleButton.style.transition = 'filter 0.5s ease';

  const toggleButtonImg = document.createElement('img');
  toggleButtonImg.id = 'toggle-button-img';
  toggleButtonImg.style.cursor = 'pointer';
  toggleButtonImg.style.border = 'none';
  toggleButtonImg.style.backgroundColor = 'transparent';
  toggleButtonImg.style.transition = 'filter 0.5s ease';

  const toggleButtonImgSrc = chrome.runtime.getURL('content/img/highlight_icon.png');

  toggleButtonImg.src = toggleButtonImgSrc;
  toggleButtonImg.style.width = '60px';
  toggleButtonImg.style.height = '60px';
  toggleButton.appendChild(toggleButtonImg);

  toggleButton.onclick = e => {
    highlightState.isHighlighting = !highlightState.isHighlighting;

    if (highlightState.isHighlighting) {
      toggleButtonImg.style.filter = 'grayscale(100%)';
      highlights = highlightTextNodes(
        ctx,
        canvas,
        document.body,
        highlights,
        serverWords,
        isElementCovered,
        highlightState,
      );
    } else {
      toggleButtonImg.style.filter = 'none';
      highlights = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

  };

  controlPanel.appendChild(toggleButton);
  document.body.appendChild(controlPanel);

  return { toggleButton, highlights };
}
