
// 비디오 정리를 위한 코드 수정
export default function showVideoModal(highlight, mouseX, mouseY, modal) {
    modal.innerHTML = ''; // 기존 내용 초기화
  
    // 비디오 엘리먼트 생성 및 설정
    const video = document.createElement('video');
    video.style.width = '300px';
    video.style.height = '200px';
    video.style.width = '100%';
    video.style.borderRadius = '5px';
    video.controls = false;
    video.autoplay = true;
    video.preload = 'auto';
    video.loop = true;
    
    // 소스 추가
    const source = document.createElement('source');
    source.src = highlight.URL;
    source.type = 'video/mp4';
    video.appendChild(source);
    
    video.onplay = () => {
      video.playbackRate = 1.5;
    };
    // 에러 처리
    video.onerror = () => {
      console.error('비디오 로드 실패:', highlight.URL);
    };
    
    // 비디오 정리를 위한 이벤트 리스너
    modal.addEventListener('mouseleave', () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
  
    modal.appendChild(video);
    // 
    // modal.style.left = `${modalLeft}px`;
    modal.open();
  }