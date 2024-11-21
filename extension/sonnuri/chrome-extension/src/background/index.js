import { log } from 'node:console';
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
  const urlGroups = {};

  if (!sentences) {
    return [];
  }

  if (!Array.isArray(sentences)) {
    const word = sentences.form;
    urlGroups[word] = urlGroups[word] || [];
    urlGroups[word].push({ url: sentences.url, word, definition: sentences.definition, isFirstIdx: 0 });
  } else {
    sentences.forEach(sentence => {
      if (sentence.words) {
        sentence.words.forEach(word => {
          if (word.url && word.url !== '') {
            const splitUrls = word.url.split(',');
            splitUrls.forEach(url => {
              urlGroups[word.form] = urlGroups[word.form] || [];
              urlGroups[word.form].push({
                url: url.trim(),
                word: word.form,
                definition: word.definition,
                isFirstIdx: urlGroups[word.form].length === 0 ? 0 : -1,
              });
            });
          } else if (word.tokens) {
            word.tokens.forEach(token => {
              if (token.url && token.url !== '') {
                const splitUrls = token.url.split(',');
                splitUrls.forEach(url => {
                  urlGroups[word.form] = urlGroups[word.form] || [];
                  urlGroups[word.form].push({
                    url: url.trim(),
                    word: word.form,
                    definition: token.definition,
                    isFirstIdx: urlGroups[word.form].length === 0 ? 0 : -1,
                  });
                });
              }
            });
          }
        });
      }
    });
  }

  return urlGroups;
};

// 문장 요청
// 문장 요청 후 추출된 링크를 반환
const requestSentence = async (text, type) => {
  try {
    const result = await fetch('http://k11a301.p.ssafy.io:8001/determine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text, type: type }),
    });
    const resultJson = await result.json();
    console.log('resultJson', resultJson);
    const urls = extractUrls(resultJson.sentences);
    // 요청 성공 메시지 전달 - 콘텐츠 페이지에서 처리
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { type: 'success_sentence_result', urls: resultJson.urls, requestType: type });
    });
    return urls;
  } catch (error) {
    // 요청 실패 메시지 전달 - 콘텐츠 페이지에서 처리
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { type: 'error_sentence_result', urls: [], requestType: type });
    });
    return [];
  }
};

// 드래그된 텍스트 저장 및 요청
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'request_sentence') {
    if (request.text) {
      await chrome.storage.local.set({ original_text: request.text });
      await chrome.storage.local.set({ isLoading: true });
      await chrome.storage.local.set({ created_video_url: '' });
      // 드래그된 텍스트로 요청을 보내고, 그 결과를 저장.
      const resultSentence = await requestSentence(request.text, 'sentence');
      const resultFinance = await requestSentence(request.text, 'finance');
      await chrome.storage.local.set({ isLoading: false });
      // console.log('result',result.urls);
      await chrome.storage.local.set({ urls: resultSentence });
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
    console.log('message.urls', message.urls);
    // url이 하나일 경우 바로 저장
    if (!Array.isArray(message.urls)) {
      chrome.storage.local.set({ created_video_url: message.urls });
      console.log('생성된 비디오 링크 - 문장보간 요청안할시', message.urls);
      chrome.runtime.sendMessage({ type: 'make_video_ended', data: message.urls });
      return;
    }
    const result = await requestMakeVideo(message.urls, message.sentence);
    console.log('result생성된 비디오 링크:', result);

    chrome.storage.local.set({ created_video_url: result.video_url });
    console.log('생성된 비디오 링크', result[0]);
    chrome.runtime.sendMessage({ type: 'make_video_ended', data: result.video_url });
  }
  return true;
});

// 사이드패널 열기 요청
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'open_side_panel') {
    chrome.runtime.sendMessage({ type: 'request_send_loading_start' });
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tabId = tabs[0].id;
      chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'side-panel/index.html',
        enabled: true, // 반드시 true로 설정해야 활성화됨
      });
      console.log("사이드패널 열기");
      
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

chrome.runtime.onConnect.addListener(port => {
  console.log('side_panel에서 연결 요청 받음');
  port.onDisconnect.addListener(() => {
    console.log('side_panel에서 연결 끊김');
    chrome.storage.local.set({ interpolated_url: '' });
    chrome.storage.local.set({ isLoading: true });
  });
});
