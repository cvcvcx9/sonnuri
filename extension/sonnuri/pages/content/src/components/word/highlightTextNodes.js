import findTextNodes from './findTextNodes';

const getTopElementAtPointExcludingCanvas = (x, y) => {
  let topElement = document.elementFromPoint(x, y);

  while (topElement && topElement.tagName.toLowerCase() === 'canvas') {
    // canvas를 제외하고 다시 아래의 요소를 가져옴
    topElement.style.pointerEvents = 'none'; // canvas 클릭 무효화
    topElement = document.elementFromPoint(x, y);
  }
  return topElement;
};

const isDescendant = (topElement, targetNode) => {
  if (!topElement || !targetNode) return false;
  return topElement.contains(targetNode);
};

export default function highlightTextNodes(
  ctx,
  canvas,
  documentBody,
  highlights,
  serverWords,
  isElementCovered,
  highlightState,
) {
  console.trace('highlightTextNodes');
  console.log('isHighlighting', highlightState.isHighlighting);
  if (!highlightState.isHighlighting) {
    return [];
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const textNodes = findTextNodes(documentBody);

  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // 반투명한 빨간색
  ctx.strokeStyle = 'red'; // 테두리 색상
  ctx.lineWidth = 1;

  highlights = [];

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
}
