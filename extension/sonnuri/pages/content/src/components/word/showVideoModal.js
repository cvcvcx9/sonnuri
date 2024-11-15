export default function showVideoModal(highlight, mouseX, mouseY, modal) {
  modal.innerHTML = '';

  // highlight.URL이 배열인지 문자열인지 확인
  const urls = Array.isArray(highlight.URL) ? highlight.URL : [highlight.URL];
  let currentVideoIndex = 0;

  const video = document.createElement('video');
  video.style.width = '300px';
  video.style.height = '200px';
  video.style.width = '100%';
  video.style.borderRadius = '5px';
  video.controls = false;
  video.autoplay = true;
  video.preload = 'auto';
  video.loop = true;

  // 현재 비디오 소스 설정 함수
  const setVideoSource = index => {
    video.innerHTML = ''; // 기존 소스 제거
    const source = document.createElement('source');
    source.src = urls[index];
    source.type = 'video/mp4';
    video.appendChild(source);
    video.muted = true;
    video.load();
    video.play();
  };

  // 다음 비디오 재생 함수
  const playNextVideo = () => {
    currentVideoIndex = (currentVideoIndex + 1) % urls.length;
    setVideoSource(currentVideoIndex);
  };

  // 비디오 종료 시 다음 비디오 재생
  video.onended = playNextVideo;

  video.onplay = () => {
    video.playbackRate = 1.5;
  };

  video.onerror = () => {
    console.error('비디오 로드 실패:', urls[currentVideoIndex]);
    playNextVideo(); // 에러 발생 시 다음 비디오로 넘어감
  };

  // 초기 비디오 설정
  setVideoSource(currentVideoIndex);

  modal.addEventListener('mouseleave', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });

  modal.appendChild(video);
  modal.open();
}
