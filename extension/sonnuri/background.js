let savedTexts = [];

// 드래그된 텍스트 저장
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "save_text") {
    savedTexts.push(message.text);
    chrome.storage.local.set({ savedTexts });  // 저장
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