import highlightTextNodes from './highlightTextNodes';

export default function createToggleButton(ctx, canvas, highlights, serverWords, isElementCovered) {
  const controlPanel = document.createElement('div');

  controlPanel.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 10000;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

  // 토글 버튼
  const toggleButton = document.createElement('button');
  toggleButton.textContent = '하이라이트 끄기';
  let isHighlighting = true;

  toggleButton.onclick = () => {
    isHighlighting = !isHighlighting;
    console.log('isHighlighting', isHighlighting);
    toggleButton.textContent = isHighlighting ? '하이라이트 끄기' : '하이라이트 켜기';

    if (isHighlighting) {
      highlights = highlightTextNodes(ctx, canvas, document.body, highlights, serverWords, isElementCovered);
    } else {
      highlights = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  controlPanel.appendChild(toggleButton);
  document.body.appendChild(controlPanel);

  return { toggleButton, highlights, isHighlighting };
}
