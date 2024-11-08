// //
// import serverWords from './words.js';
// CanvasRenderingContext2D.prototype.roundRect = function (
//   x,
//   y,
//   width,
//   height,
//   radius
// ) {
//   this.beginPath();
//   this.moveTo(x + radius, y);
//   this.lineTo(x + width - radius, y);
//   this.quadraticCurveTo(x + width, y, x + width, y + radius);
//   this.lineTo(x + width, y + height - radius);
//   this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
//   this.lineTo(x + radius, y + height);
//   this.quadraticCurveTo(x, y + height, x, y + height - radius);
//   this.lineTo(x, y + radius);
//   this.quadraticCurveTo(x, y, x + radius, y);
//   this.closePath();
// };

// let highlights = [];

// const modal = document.createElement('div');
// modal.style.cssText = `
//     position: fixed;
//     background: white;
//     border: 1px solid black;
//     padding: 10px;
//     z-index: 10001;
//     width: 480px;
//     height: 360px;
//     display: none; /* 초기에는 숨김 */
//     border-radius: 5px;
//     box-shadow: 0 2px 5px rgba(0,0,0,0.2);
// `;
// modal.textContent = 'word';
// document.body.appendChild(modal);

// // 캔버스 오버레이 생성
// const overlay = document.createElement('div');
// overlay.innerHTML =
//   '<canvas id="highlightCanvas" style="position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999;"></canvas>';
// document.body.appendChild(overlay);

// const canvas = document.getElementById('highlightCanvas');
// const ctx = canvas.getContext('2d');

// // 캔버스 크기 설정
// function resizeCanvas() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }

// // 초기 설정 및 이벤트 리스너
// resizeCanvas();
// window.addEventListener('resize', resizeCanvas);

// // 텍스트 노드를 재귀적으로 찾는 함수
// function findTextNodes(element) {
//   const textNodes = [];
//   const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
//     acceptNode: function (node) {
//       // 보이는 텍스트만 선택
//       if (
//         node.textContent.trim() &&
//         getComputedStyle(node.parentElement).display !== 'none' &&
//         getComputedStyle(node.parentElement).visibility !== 'hidden'
//       ) {
//         return NodeFilter.FILTER_ACCEPT;
//       }
//       return NodeFilter.FILTER_REJECT;
//     },
//   });

//   let node;
//   while ((node = walk.nextNode())) {
//     textNodes.push(node);
//   }
//   return textNodes;
// }

// // 버튼 생성
// const button = document.createElement('div');
// button.id = 'show-sidebar-button';
// button.style.position = 'absolute';
// button.style.zIndex = 10002; // 버튼이 위에 보이도록 설정
// button.style.padding = '8px 8px';
// button.style.backgroundColor = '#fff';
// button.style.color = '#fff';
// button.style.border = 'none';
// button.style.borderRadius = '5px';
// button.style.cursor = 'pointer';
// button.style.boxShadow = '0px 2px 6px rgba(0, 0, 0, 0.2)';
// button.style.display = 'none';



// const icon = document.createElement('img');
// icon.src = chrome.runtime.getURL('content/img/sign-language.png'); // 아이콘 이미지 경로
// icon.alt = 'Icon';
// icon.style.width = '20px'; // 아이콘 크기 조정
// icon.style.height = '20px';
// button.appendChild(icon); // 아이콘을 버튼의 앞에 추가.


// document.body.appendChild(button); // 버튼을 문서에 추가
// // 버튼에 설명하는 수어 이미지 추가
// const translateImgWrapper = document.createElement('div');
// translateImgWrapper.classList.add('translate-img-wrapper');
// translateImgWrapper.style.position = 'absolute';
// translateImgWrapper.style.display = 'none';
// translateImgWrapper.style.zIndex = 10003; // 버튼이 위에 보이도록 설정
// translateImgWrapper.style.boxShadow = '0px 2px 6px rgba(0, 0, 0, 0.2)';
// const translateImg = document.createElement('img');
// translateImg.src = "chrome-extension://" + chrome.runtime.id + "/content/img/translateHandSign.gif";
// translateImg.style.width = '160px';
// translateImg.style.height = '110px';
// translateImg.style.padding = '8px 12px';
// translateImgWrapper.appendChild(translateImg);
// document.body.appendChild(translateImgWrapper);


// button.addEventListener('mouseenter', (e) => {
//   if (translateImgWrapper.style.display === 'none') {
//     console.log("mouseenter");
//     translateImgWrapper.style.left = `${e.pageX+5}px`;
//     translateImgWrapper.style.top = `${e.pageY+5}px`;
//     translateImgWrapper.style.display = 'block';
//   }
// });

// button.addEventListener('mouseleave', (e) => {
//   translateImgWrapper.style.display = 'none';
// });

// document.addEventListener('mouseup', (e) => {
//   const selectedText = window.getSelection().toString(); // 드래그된 단어 가져오기
//   if (selectedText) {
//     console.log(selectedText);
//     button.style.top = `${e.pageY}px`; // 버튼 위치 변경
//     button.style.left = `${e.pageX}px`; // 버튼 위치 변경
//     button.style.display = 'flex'; // 플렉스 박스 사용
//     button.style.alignItems = 'center'; // 수직 중앙 정렬
//     button.style.justifyContent = 'center'; // 수평 중앙 정렬

//     // 버튼 클릭 이벤트
//     button.onclick = () => {
//       console.log('버튼 클릭');
//       chrome.runtime.sendMessage({
//         type: 'open_side_panel',
//         text: selectedText,
//       });
//       button.style.display = 'none'; // 버튼 제거
//     };
//   } else {
//     button.style.display = 'none'; // 선택된 텍스트가 없으면 버튼 숨김
//   }
// });

// // 텍스트 주변에 반투명한 라운드 직사각형 그리기
// function highlightTextNodes() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   const textNodes = findTextNodes(document.body);

//   ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // 반투명한 빨간색
//   ctx.strokeStyle = 'red'; // 테두리 색상
//   ctx.lineWidth = 1;

//   highlights = [];

//   textNodes.forEach((node) => {
//     const text = node.textContent; // 공백을 기준으로 word를 나눕니다
//     const wordRegex = /\S+/g;
//     let match;
//     const range = document.createRange();

//     while ((match = wordRegex.exec(text)) !== null) {
//       const word = match[0];
//       let startOffset = match.index; // word의 시작 위치
//       // serverWordList에 포함되는지 확인
//       // const matchServerWord = serverWordsMap.get(word);
//       const matchServerWord = serverWords.find(
//         (serverWord) => serverWord.word === word
//       );
//       range.setStart(node, startOffset); // 현재 word의 시작 위치 설정
//       range.setEnd(node, startOffset + word.length); // 현재 word의 끝 위치 설정

//       // 만약 word가 우리가 가진 word 목록에 없으면 그냥 넘어가기
//       if (matchServerWord) {
//         const rects = range.getClientRects();
//         for (let rect of rects) {
//           // 화면에 보이는 영역만 그리기
//           if (
//             rect.width > 0 &&
//             rect.height > 0 &&
//             rect.top >= 0 &&
//             rect.top <= window.innerHeight &&
//             rect.left >= 0 &&
//             rect.left <= window.innerWidth &&
//             !isElementCovered(rect)
//           ) {
//             // 라운드 직사각형 그리기
//             ctx.roundRect(
//               rect.left,
//               rect.top,
//               rect.width,
//               rect.height,
//               5 // 라운드 반경
//             );
//             highlights.push({
//               word: word, // word
//               rect: rect, // DOMRect 객체
//               isHovered: false, // 마우스 hover 상태
//               URL: matchServerWord.URL, // URL
//             });
//             ctx.fill(); // 내부를 채우기
//             ctx.stroke(); // 테두리 그리기
//           }
//         }
//       }
//     }
//   });
// }

// // 요소가 가려져 있는지 확인하는 함수
// function isElementCovered(rect) {
//   const elements = document.elementsFromPoint(
//     rect.left + rect.width / 2,
//     rect.top + rect.height / 2
//   );
//   return elements.some((element) => {
//     return getComputedStyle(element).zIndex !== 'auto' && element !== canvas;
//   });
// }

// const handleMouseMove = (e) => {
//   const mouseX = e.clientX;
//   const mouseY = e.clientY;
//   // 캔버스 위에서 마우스가 움직이고 있는지 처리

//   // 마우스가 위에 있는 하이라이트 찾기
//   const hoveredHighlight = highlights.find(
//     (highlight) =>
//       mouseX >= highlight.rect.left &&
//       mouseX <= highlight.rect.right &&
//       mouseY >= highlight.rect.top &&
//       mouseY <= highlight.rect.bottom
//   );

//   if (hoveredHighlight) {
//     showModal(hoveredHighlight, mouseX, mouseY);
//   } else {
//     // 모든 하이라이트에서 벗어났을 경우에만 모달 숨김
//     const isMouseOutsideAllHighlights = highlights.every(
//       (highlight) =>
//         mouseX < highlight.rect.left ||
//         mouseX > highlight.rect.right ||
//         mouseY < highlight.rect.top ||
//         mouseY > highlight.rect.bottom
//     );

//     if (isMouseOutsideAllHighlights) {
//       modal.style.display = 'none'; // 모든 사각형에서 벗어났을 경우 모달 숨김
//     }
//   }
// }
// // 마우스 이동 이벤트 처리
// document.addEventListener('mousemove', handleMouseMove);

// // 비디오 정리를 위한 코드 수정
// function showModal(highlight, mouseX, mouseY) {
//   modal.innerHTML = ''; // 기존 내용 초기화

//   let modalLeft = mouseX;
//   let modalTop = mouseY;

//   // 위치 조정 로직
//   if (mouseX < window.innerWidth / 2) {
//     modalLeft = mouseX + 10;
//   } else {
//     modalLeft = mouseX - modal.offsetWidth - 10;
//   }

//   if (mouseY < window.innerHeight / 2) {
//     modalTop = mouseY + 10;
//   } else {
//     modalTop = mouseY - modal.offsetHeight - 10;
//   }

//   // 텍스트 컨테이너 추가
//   const textContent = document.createElement('div');
//   textContent.textContent = `word: ${highlight.word}`;
//   modal.appendChild(textContent);

//   // 비디오 엘리먼트 생성 및 설정
//   const video = document.createElement('video');
//   video.style.width = '100%';
//   video.style.borderRadius = '5px';
//   video.controls = true;
//   video.autoplay = true;
//   video.preload = 'auto';
//   video.loop = true;

//   // 소스 추가
//   const source = document.createElement('source');
//   source.src = highlight.URL;
//   source.type = 'video/mp4';
//   video.appendChild(source);

//   // 에러 처리
//   video.onerror = () => {
//     console.error('비디오 로드 실패:', highlight.URL);
//   };

//   // 비디오 정리를 위한 이벤트 리스너
//   modal.addEventListener('mouseleave', () => {
//     video.pause();
//     video.removeAttribute('src');
//     video.load();
//   });

//   modal.appendChild(video);
//   modal.style.left = `${modalLeft}px`;
//   modal.style.top = `${modalTop}px`;
//   modal.style.display = 'block';
// }

// // 모달 숨기기 로직 수정
// function hideModal() {
//   const video = modal.querySelector('video');
//   if (video) {
//     video.pause();
//     video.removeAttribute('src');
//     video.load();
//   }
//   modal.style.display = 'none';
// }

// // 이벤트 리스너 수정
// canvas.addEventListener('mouseleave', hideModal);

// // 페이지 언로드 시 정리
// window.addEventListener(
//   'beforeunload',
//   () => {
//     cleanup();
//   },
//   { capture: true }
// );

// // 컨트롤 패널 생성
// const controlPanel = document.createElement('div');

// controlPanel.style.cssText = `
//     position: fixed;
//     bottom: 10px;
//     right: 10px;
//     z-index: 10000;
//     background: white;
//     padding: 10px;
//     border-radius: 5px;
//     box-shadow: 0 2px 5px rgba(0,0,0,0.2);
// `;

// // 토글 버튼
// const toggleButton = document.createElement('button');
// toggleButton.textContent = '하이라이트 켜기';
// let isHighlighting = false;

// toggleButton.onclick = () => {
//   isHighlighting = !isHighlighting;
//   toggleButton.textContent = isHighlighting
//     ? '하이라이트 끄기'
//     : '하이라이트 켜기';

//   if (isHighlighting) {
//     highlightTextNodes();
//   } else {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//   }
// };

// controlPanel.appendChild(toggleButton);
// document.body.appendChild(controlPanel);

// // 스크롤 이벤트 처리
// let scrollTimeout;
// window.addEventListener('scroll', () => {
//   if (isHighlighting) {
//     // 스크롤 중에는 캔버스 숨기기
//     canvas.style.display = 'none';

//     // 스크롤이 멈추면 다시 그리기
//     clearTimeout(scrollTimeout);
//     scrollTimeout = setTimeout(() => {
//       canvas.style.display = 'block';
//       highlightTextNodes();
//     }, 100);
//   }
// });

// // 윈도우 리사이즈 시 다시 그리기
// window.addEventListener('resize', () => {
//   if (isHighlighting) {
//     highlightTextNodes();
//   }
// });

// // cleanup 함수
// function cleanup() {
//   // 비디오 정리
//   const videos = document.querySelectorAll('video');
//   videos.forEach((video) => {
//     video.pause();
//     video.removeAttribute('src');
//     video.load();
//   });

//   // 이벤트 리스너 제거
//   window.removeEventListener('resize', resizeCanvas);
//   document.removeEventListener('mousemove', handleMouseMove);

//   // DOM 요소 정리
//   if (modal) modal.remove();
//   if (canvas) canvas.remove();
//   if (overlay) overlay.remove();

//   // 하이라이트 정리
//   if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
//   highlights = [];
// }
