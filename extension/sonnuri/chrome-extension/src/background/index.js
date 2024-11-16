import requestMakeVideo from './requestMakeVideo';

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
        const splitUrls = word.url.split(',');
        splitUrls.forEach((url, index) => {
          urls.push({ url: url.trim(), word: word.form, isFirstIdx: index === 0 ? urls.length : -1 });
        });
        return;
      }
      if (word.tokens) {
        word.tokens.forEach(token => {
          if (token.url && token.url !== '') {
            const splitUrls = token.url.split(',');

            splitUrls.forEach((url, index) => {
              urls.push({ url: url.trim(), word: token.form, isFirstIdx: index === 0 ? urls.length : -1 });
            });
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
      body: JSON.stringify({ text: text, type: '' }),
    });
    const resultJson = await result.json();
    console.log('resultJson', resultJson);
    const urls = extractUrls(resultJson.sentences);
    // 요청 성공 메시지 전달 - 콘텐츠 페이지에서 처리
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { type: 'success_sentence_result', urls: resultJson.urls });
    });
    return urls;
  } catch (error) {
    // 요청 실패 메시지 전달 - 콘텐츠 페이지에서 처리
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { type: 'error_sentence_result', urls: [] });
    });
    return [];
  }
};

// 드래그된 텍스트 저장 및 요청
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'request_sentence') {
    if (request.text) {
      chrome.storage.local.set({ original_text: request.text });
      // 드래그된 텍스트로 요청을 보내고, 그 결과를 저장.
      const result = await requestSentence(request.text);
      // console.log('result',result.urls);
      await chrome.storage.local.set({ urls: result });
      sendResponse({ success: true });
    }
  }
  return true;
});

// 보간 비디오 생성 요청
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'request_make_video') {
    console.log('request_make_video 요청 전달받음', message.urls);
    // 보간 비디오 생성 요청
    console.log('result', message.urls);
    chrome.runtime.sendMessage({ type: 'make_video_started' });

    const result = await requestMakeVideo(message.urls);
    chrome.storage.local.set({ created_video_url: result.video_url });
    console.log('생성된 비디오 링크', result);
    chrome.runtime.sendMessage({ type: 'make_video_ended', data: result.video_url });
  }
  return true;
});

// 사이드패널 열기 요청
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'open_side_panel') {
    console.log('open_side_panel 요청 전달받음');
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'side-panel/index.html',
        enabled: true, // 반드시 true로 설정해야 활성화됨
      });
      await chrome.sidePanel.open({ tabId: tabId });
      sendResponse({ success: true });
    });
  }
  return true;
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
