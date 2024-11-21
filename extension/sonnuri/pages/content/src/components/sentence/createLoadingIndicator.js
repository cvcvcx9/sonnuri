export default function createLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.style.position = 'absolute';
  loadingDiv.style.display = 'none';
  loadingDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  loadingDiv.style.color = 'white';
  loadingDiv.style.padding = '8px 12px';
  loadingDiv.style.borderRadius = '4px';
  loadingDiv.style.fontSize = '14px';
  loadingDiv.style.zIndex = '3';
  loadingDiv.textContent = '번역 중...';

  const highlightDiv = document.createElement('div');
  highlightDiv.style.position = 'absolute';
  highlightDiv.style.display = 'none';
  highlightDiv.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
  highlightDiv.style.border = '2px solid rgba(255, 255, 0, 0.5)';
  highlightDiv.style.borderRadius = '2px';
  highlightDiv.style.zIndex = '3';

  document.body.appendChild(highlightDiv);
  document.body.appendChild(loadingDiv);

  const cleanUp = () => {
    loadingDiv.textContent = '번역 완료';
    loadingDiv.onclick = async () => {
      loadingDiv.style.display = 'none';
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      chrome.sidePanel.setOptions({ tabId: tab.id });
      chrome.sidePanel.open();
    };

    highlightDiv.style.display = 'none';
  };
  return { loadingDiv, highlightDiv, cleanUp };
}
