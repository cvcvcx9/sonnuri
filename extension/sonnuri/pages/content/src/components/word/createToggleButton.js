import { highlightState } from '../../index';
import highlightTextNodes from './highlightTextNodes';
export default function createToggleButton(ctx, canvas, highlights, serverWords, isElementCovered, isHighlighting) {
  const controlPanel = document.createElement('div');

  controlPanel.style.cssText = `
    position: fixed;
    bottom: 120px;
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
  const toggleButtonImg = document.createElement('img');
  toggleButtonImg.id = 'toggle-button-img';
  toggleButtonImg.style.cursor = 'pointer';
  toggleButtonImg.style.border = 'none';
  toggleButtonImg.style.backgroundColor = 'transparent';
  let toggleButtonImgSrc = chrome.runtime.getURL('content/img/highlightOn.png');

  toggleButtonImg.src = toggleButtonImgSrc;
  toggleButtonImg.style.width = '60px';
  toggleButtonImg.style.height = '60px';
  toggleButton.appendChild(toggleButtonImg);
  toggleButton.onclick = e => {
    e.stopPropagation();

    highlightState.isHighlighting = !highlightState.isHighlighting;
    toggleButtonImgSrc = highlightState.isHighlighting
      ? chrome.runtime.getURL('content/img/highlightOff.png')
      : chrome.runtime.getURL('content/img/highlightOn.png');
    toggleButtonImg.src = toggleButtonImgSrc;

    if (highlightState.isHighlighting) {
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
      highlights = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  controlPanel.appendChild(toggleButton);
  document.body.appendChild(controlPanel);

  return { toggleButton, highlights };
}
