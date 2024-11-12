chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    path: 'side-panel/index.html',
  });
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});

const extractUrls = sentences => {
  const urls = [];
  if (!sentences || sentences.length === 0) {
    return urls;
  }
  sentences.forEach(sentence => {
    sentence.words.forEach(word => {
      if (word.url && word.url !== '') {
        urls.push({ url: word.url, word: word.form });
        return;
      }
      if (word.tokens) {
        word.tokens.forEach(token => {
          if (token.url && token.url !== '') {
            urls.push({ url: token.url, word: token.form });
          }
        });
      }
    });
  });
  return urls;
};

const requestSentence = async text => {
  try {
    const result = await fetch('http://k11a301.p.ssafy.io:8001/determine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    });
    const resultJson = await result.json();
    const urls = extractUrls(resultJson.result);
    chrome.runtime.sendMessage({ type: 'success_sentence_result' });
    return urls;
  } catch (error) {
    console.error('Error fetching data:', error);
    chrome.runtime.sendMessage({ type: 'error_sentence_result' });
  }
};

// 드래그된 텍스트 저장
chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.type === 'request_sentence') {
    if (request.text) {
      // 드래그된 텍스트로 요청을 보내고, 그 결과를 저장.
      const result = await requestSentence(request.text);
      await chrome.storage.local.set({ urls: result });
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'success_sentence_result' });
    }
  }
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'open_side_panel') {
    console.log("open_side_panel 요청 전달받음");
    chrome.tabs.query({active: true, currentWindow: true}, async tabs => {
      const tabId = tabs[0].id;
      chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'side-panel/index.html',
        enabled: true, // 반드시 true로 설정해야 활성화됨
      });
      await chrome.sidePanel.open({tabId: tabId});
    });
  }
  return true;
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'success') {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { action: 'success_request' });
    });
    return true;
  }
});
