export default async function requestMakeVideo(urls, sentence) {
  // // 같은 주소로 요청이 가고있는게 있다면 취소하기
  // if (requestMakeVideo.abortController) {
  //   requestMakeVideo.abortController.abort();
  //   console.log('요청 취소');
  // }
  // const abortController = new AbortController();
  // requestMakeVideo.abortController = abortController;

  try {
    if (!Array.isArray(urls)) {
      urls = [urls];
    }
    console.log('urls', urls);
    console.log('sentence', sentence);
    const response = await fetch('http://k11a301.p.ssafy.io:8003/process_videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_urls: urls, sentence: sentence }),
      signal: abortController.signal,
    });
    const data = await response.json();
    if (data.status === 'success') {
      return data;
    } else {
      throw new Error('제작된 영상 데이터 요청 실패', data.message);
    }
  } catch (error) {
    chrome.runtime.sendMessage({ type: 'error_make_video_result' });
    console.error('Error fetching data:', error);
  }
}
