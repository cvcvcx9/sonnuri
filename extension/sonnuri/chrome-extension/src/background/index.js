chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    path: 'side-panel/index.html',
  });
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
  
});
 



// 드래그된 텍스트 저장
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'open_side_panel') {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      if(request.text){
        chrome.storage.local.set({ newSentence: request.text });
      }
      const tabId = tabs[0].id;
      chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'side-panel/index.html',
        enabled: true, // 반드시 true로 설정해야 활성화됨
      });
      await chrome.sidePanel.open({ tabId: tabId });
    });
  }
});



// 사이드바 요청을 위한 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get_saved_texts') {
    chrome.storage.local.get('savedTexts', data => {
      sendResponse(data.savedTexts || []);
    });
    return true; // 비동기 응답을 위한 리턴값
  }
});
