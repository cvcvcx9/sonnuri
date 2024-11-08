let savedTexts = [];

// 드래그된 텍스트 저장
chrome.runtime.onMessage.addListener ((request, sender, sendResponse) => {
  console.log("백그라운드 메시지 수신");
  if (request.type === "open_side_panel") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tabId = tabs[0].id;
      chrome.sidePanel.setOptions({ 
        tabId: tabId,
        path: 'side-panel/index.html',
        enabled: true, // 반드시 true로 설정해야 활성화됨
      })    
      chrome.sidePanel.open({tabId: tabId})
      savedTexts.push(request.text);
      chrome.storage.local.set({ savedTexts });  // 저장
    });
  }
});

// 사이드바 요청을 위한 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "get_saved_texts") {
    chrome.storage.local.get("savedTexts", (data) => {
      sendResponse(data.savedTexts || []);
    });
    return true; // 비동기 응답을 위한 리턴값
  }
});