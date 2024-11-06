// 
import serverWords from './words.js';
import axios from 'axios';
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
};

let highlights = [];
const serverWordsMap = new Map(serverWords.map(item => [item.word, item]));


const modal = document.createElement('div');
modal.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid black;
    padding: 10px;
    z-index: 10001;
    width: 480px;
    height: 360px;
    display: none; /* 초기에는 숨김 */
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;
modal.textContent = "word";
document.body.appendChild(modal);

// 캔버스 오버레이 생성
const overlay = document.createElement('div');
overlay.innerHTML = '<canvas id="highlightCanvas" style="position: fixed; top: 0; left: 0; z-index: 9999; pointer-events: none;"></canvas>';
document.body.appendChild(overlay);

const canvas = document.getElementById('highlightCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 초기 설정 및 이벤트 리스너
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 텍스트 노드를 재귀적으로 찾는 함수
function findTextNodes(element) {
    const textNodes = [];
    const walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 보이는 텍스트만 선택
                if (node.textContent.trim() && 
                    getComputedStyle(node.parentElement).display !== 'none' &&
                    getComputedStyle(node.parentElement).visibility !== 'hidden') {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );

    let node;
    while (node = walk.nextNode()) {
        textNodes.push(node);
    }
    return textNodes;
}

// 텍스트 주변에 반투명한 라운드 직사각형 그리기
function highlightTextNodes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const textNodes = findTextNodes(document.body);
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    
    highlights = [];

    textNodes.forEach(node => {
        const text = node.textContent;
        const wordRegex = /\S+/g;
        let match;
        const range = document.createRange();
        
        while ((match = wordRegex.exec(text)) !== null) {
            const word = match[0];
            let startOffset = match.index;
            
            range.setStart(node, startOffset);
            range.setEnd(node, startOffset + word.length);
            
            const rects = range.getClientRects();
            for (let rect of rects) {
                if (rect.width > 0 && rect.height > 0 &&
                    rect.top >= 0 && rect.top <= window.innerHeight &&
                    rect.left >= 0 && rect.left <= window.innerWidth &&
                    !isElementCovered(rect)) {
                    
                    ctx.roundRect(
                        rect.left,
                        rect.top,
                        rect.width,
                        rect.height,
                        5
                    );
                    highlights.push({
                        word: word,
                        rect: rect,
                        isHovered: false
                    });
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
    });
}

// 요소가 가려져 있는지 확인하는 함수
function isElementCovered(rect) {
    const elements = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return elements.some(element => {
        return getComputedStyle(element).zIndex !== 'auto' && element !== canvas;
    });
}

// 마우스 이동 이벤트 처리
// document.addEventListener('mousemove', (e) => {
//     const mouseX = e.clientX;
//     const mouseY = e.clientY;
//     // 캔버스 위에서 마우스가 움직이고 있는지 처리
    
//     // 마우스가 위에 있는 하이라이트 찾기
//     const hoveredHighlight = highlights.find(highlight => 
//         mouseX >= highlight.rect.left && mouseX <= highlight.rect.right &&
//         mouseY >= highlight.rect.top && mouseY <= highlight.rect.bottom
//     );

//     if (hoveredHighlight) {
//         showModal(hoveredHighlight, mouseX, mouseY);
//     } else {
//         // 모든 하이라이트에서 벗어났을 경우에만 모달 숨김
//         const isMouseOutsideAllHighlights = highlights.every(highlight => 
//             mouseX < highlight.rect.left || mouseX > highlight.rect.right ||
//             mouseY < highlight.rect.top || mouseY > highlight.rect.bottom
//         );

//         if (isMouseOutsideAllHighlights) {
//             modal.style.display = 'none'; // 모든 사각형에서 벗어났을 경우 모달 숨김
//         }
//     }
// });

function showModal(highlight, mouseX, mouseY) {
    let modalLeft = mouseX;
    let modalTop = mouseY;
    // 마우스의 위치에 따라 모달의 위치를 조정
    if (mouseX < window.innerWidth / 2) {
            modalLeft = mouseX + 10; // 마우스 오른쪽에 모달을 배치
    } else {
        modalLeft = mouseX - modal.offsetWidth - 10; // 마우스 왼쪽에 모달을 배치
    }

    if (mouseY < window.innerHeight / 2) {
        modalTop = mouseY + 10; // 마우스 아래에 모달을 배치
    } else {
        modalTop = `${mouseY - modal.offsetHeight - 10}px`; // 마우스 위에 모달을 배치
    }
    modal.textContent = `word: ${highlight.word}`; // 모달에 표시할 내용
    const video = document.createElement('video');
    // 비디오 속성 설정
    video.controls = true;
    video.autoplay = true;
    video.preload = true;
    video.loop = true;
    video.style.width = '100%';
    video.style.borderRadius = '5px';
    // 비디오 소스 추가
    const source = document.createElement('source');
    source.src = highlight.URL;
    source.type = 'video/mp4';
    video.appendChild(source);
    //모달에 비디오 추가
    modal.appendChild(video);
    modal.style.left = `${modalLeft}px`; // 모달 위치 설정 (약간 오른쪽으로)
    modal.style.top = `${modalTop}px`; // 모달 위치 설정 (약간 아래로)
    modal.style.display = 'block'; // 모달 표시
    console.log("모달 띄우기");
}

// 모달 숨기기
canvas.addEventListener('mouseleave', () => {
    modal.style.display = 'none'; // 마우스가 캔버스를 떠날 때 모달 숨김 
});

// 컨트롤 패널 생성
const controlPanel = document.createElement('div');

controlPanel.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 10000;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

// 토글 버튼
const toggleButton = document.createElement('button');
toggleButton.textContent = '하이라이트 켜기';
let isHighlighting = false;


toggleButton.onclick = () => {
    isHighlighting = !isHighlighting;
    toggleButton.textContent = isHighlighting ? '하이라이트 끄기' : '하이라이트 켜기';
    
    if (isHighlighting) {
        highlightTextNodes();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

controlPanel.appendChild(toggleButton);
document.body.appendChild(controlPanel);

// 스크롤 이벤트 처리
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (isHighlighting) {
        // 스크롤 중에는 캔버스 숨기기
        canvas.style.display = 'none';
        
        // 스크롤이 멈추면 다시 그리기
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            canvas.style.display = 'block';
            highlightTextNodes();
        }, 100);
    }
});

// 윈도우 리사이즈 시 다시 그리기
window.addEventListener('resize', () => {
    if (isHighlighting) {
        highlightTextNodes();
    }
});

// 클릭 이벤트 처리 추가
document.addEventListener('click', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const clickedHighlight = highlights.find(highlight => 
        mouseX >= highlight.rect.left && mouseX <= highlight.rect.right &&
        mouseY >= highlight.rect.top && mouseY <= highlight.rect.bottom
    );

    if (clickedHighlight) {
        // API 요청 보내기
        console.log(`Clicked word: ${clickedHighlight.word}`);
        // fetch 요청 예시:
        fetch('http://k11a301.p.ssafy.io:8001/determine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: "cors",      
            body: JSON.stringify({
                text: clickedHighlight.word
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
});

document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      chrome.runtime.sendMessage({ action: "save_text", text: selectedText });
    }
  });

// 아이콘 생성 및 표시 함수
function showIcon(x, y) {
    const icon = document.createElement('div');
    icon.textContent = '🔍'; // 아이콘 내용 (예: 돋보기 아이콘)
    icon.style.position = 'absolute';
    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    icon.style.cursor = 'pointer';
    icon.style.zIndex = 10000; // 다른 요소 위에 표시

    // 아이콘 클릭 이벤트 처리
    icon.addEventListener('click', () => {
        openSidebar(draggedText); // 사이드바 열기
        document.body.removeChild(icon); // 아이콘 제거
    });

    document.body.appendChild(icon);
}