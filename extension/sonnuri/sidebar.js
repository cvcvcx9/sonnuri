document.addEventListener("DOMContentLoaded", () => {
  loadSavedTexts();
  chrome.storage.onChanged.addListener((changes, namespace) => {
    // 변경 시 로드
    if (changes.savedTexts) {
        loadSavedTexts(); // 
        const newTexts = changes.savedTexts.newValue;
        handleUpdatedTexts(newTexts[newTexts.length - 1]);
    }
  });

});

const player = videojs('video-player',{preload: 'auto'});

function loadSavedTexts() {
  chrome.storage.local.get("savedTexts", (data) => {
      const container = document.getElementById("saved-content");
      if (data.savedTexts) {
          container.innerHTML = data.savedTexts.map(text => `<li>${text}</li>`).join("");
      } else {
          container.innerHTML = "<li>저장된 텍스트가 없습니다.</li>"; // 텍스트가 없을 경우
      }
  });
}

// 변경된 텍스트를 처리하는 함수
function handleUpdatedTexts(newText) {
  console.log("변경된 텍스트:", newText);
  fetch("http://k11a301.p.ssafy.io:8001/determine", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text:newText }),
  }).then(response => response.json())
    .then(data => {
      const videoUrls = [];

      function extractUrls(sentences) {
        console.log(sentences);
        sentences.forEach(sentence => {

          sentence.words.forEach(word => {
            console.log(word);
            if (word.url) {
              videoUrls.push({sources: [{src: word.url, type: "video/mp4"}]}); // URL이 있는 경우 추가
              return;
            }
            if (word.tokens) {
              word.tokens.forEach(token => {
                if (token.url) {
                // 비디오js playlist 형식에 맞게 추가하기
                videoUrls.push({sources: [{src: token.url, type: "video/mp4"}]}); // URL이 있는 경우 추가
              // } else {
              //   videoUrls.push("http://example.com/empty-video.mp4"); // 빈 영상 URL 추가
              }
            });
          }
        });
      });
    }
      extractUrls(data.result); // URL 추출
      console.log(videoUrls);
      player.playlist(videoUrls); // 플레이리스트에 추가
      player.playlist.autoadvance(0); // 자동 전환 활성화
      player.play(); 
    })
    .catch(error => console.error("에러:", error));
  // 추가적인 처리 로직을 여기에 작성
}