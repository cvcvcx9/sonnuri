import serverWords from '@src/data/words';
// 캔버스를 제외한 최상위 요소를 가져옴
// 라운드 직사각형 정의하기

const getTopElementAtPointExcludingCanvas = (x, y) => {
  let topElement = document.elementFromPoint(x, y);

  while (topElement && topElement.tagName.toLowerCase() === 'canvas') {
    // canvas를 제외하고 다시 아래의 요소를 가져옴
    topElement.style.pointerEvents = 'none'; // canvas 클릭 무효화
    topElement = document.elementFromPoint(x, y);
  }
  return topElement;
};
function isElementCovered(rect) {
  const elements = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  return elements.some(element => {
    return getComputedStyle(element).zIndex !== 'auto' && element !== 'canvas';
  });
}
// 최상위 요소가 타겟 노드의 자손인지 확인
const isDescendant = (topElement, targetNode) => {
  if (!topElement || !targetNode) return false;
  return topElement.contains(targetNode);
};

export const highlightTextNodes = (canvas, textNodes) => {
  const ctx = canvas.getContext('2d');
  ctx.roundRect = function (x, y, width, height, radius) {
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

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // 반투명한 빨간색
  ctx.strokeStyle = 'red'; // 테두리 색상
  ctx.lineWidth = 1;

  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let highlights = [];

  textNodes.forEach(node => {
    const text = node.textContent; // 공백을 기준으로 word를 나눕니다
    const wordRegex = /\S+/g;
    let match;
    const range = document.createRange();

    while ((match = wordRegex.exec(text)) !== null) {
      const word = match[0];
      let startOffset = match.index; // word의 시작 위치
      // serverWordList에 포함되는지 확인
      // const matchServerWord = serverWordsMap.get(word);
      const matchServerWord = serverWords.find(serverWord => serverWord.word === word);
      range.setStart(node, startOffset); // 현재 word의 시작 위치 설정
      range.setEnd(node, startOffset + word.length); // 현재 word의 끝 위치 설정

      // 만약 word가 우리가 가진 word 목록에 없으면 그냥 넘어가기
      if (matchServerWord) {
        const rects = range.getClientRects();
        for (let rect of rects) {
          // 화면에 보이는 영역만 그리기
          const elementAtPoint = getTopElementAtPointExcludingCanvas(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          if (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top >= 0 &&
            rect.top <= window.innerHeight &&
            rect.left >= 0 &&
            rect.left <= window.innerWidth &&
            !isElementCovered(rect) &&
            isDescendant(elementAtPoint, node)
          ) {
            // 라운드 직사각형 그리기
            ctx.roundRect(
              rect.left,
              rect.top,
              rect.width,
              rect.height,
              5, // 라운드 반경
            );
            highlights.push({
              word: word, // word
              rect: rect, // DOMRect 객체
              isHovered: false, // 마우스 hover 상태
              URL: matchServerWord.URL, // URL
            });
            ctx.fill(); // 내부를 채우기
            ctx.stroke(); // 테두리 그리기
          }
        }
      }
    }
  });
  return highlights;
};
