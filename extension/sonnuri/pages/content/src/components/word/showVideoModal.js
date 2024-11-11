
// 비디오 정리를 위한 코드 수정
export default function showVideoModal(highlight, mouseX, mouseY, modal) {
    modal.innerHTML = ''; // 기존 내용 초기화
  
    // let modalLeft = mouseX;
    // let modalTop = mouseY;
  
    // // 위치 조정 로직
    // if (mouseX < window.innerWidth / 2) {
    //   modalLeft = mouseX + 10;
    // } else {
    //   modalLeft = mouseX - modal.offsetWidth - 10;
    // }
  
    // if (mouseY < window.innerHeight / 2) {
    //   modalTop = mouseY + 10;
    // } else {
    //   modalTop = mouseY - modal.offsetHeight - 10;
    // }
  
    // // 텍스트 컨테이너 추가
    // const textContent = document.createElement('div');
    // textContent.textContent = `word: ${highlight.word}`;
    // modal.appendChild(textContent);
  
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
    video.playbackRate = 1.2;
  
    // 소스 추가
    const source = document.createElement('source');
    source.src = highlight.URL;
    source.type = 'video/mp4';
    video.appendChild(source);
  
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