import React, { useEffect, useRef, useState } from 'react';
import serverWords from '../data/serverWords.js'; // 서버 단어 목록을 가져옵니다.

const HighlightText = () => {
    const canvasRef = useRef(null);
    const [highlights, setHighlights] = useState([]);

    useEffect(() => {
        const highlightTextNodes = () => {
            const textNodes = findTextNodes(document.body);
            const newHighlights = [];

            textNodes.forEach(node => {
                const text = node.textContent;
                const wordRegex = /\S+/g;
                let match;
                const range = document.createRange();

                while ((match = wordRegex.exec(text)) !== null) {
                    const word = match[0];
                    const startOffset = match.index;
                    const matchServerWord = serverWords.find(serverWord => serverWord.word === word);
                    if (matchServerWord) {
                        range.setStart(node, startOffset);
                        range.setEnd(node, startOffset + word.length);
                        const rects = range.getClientRects();
                        rects.forEach(rect => {
                            if (rect.width > 0 && rect.height > 0) {
                                newHighlights.push({ word, rect });
                            }
                        });
                    }
                }
            });

            setHighlights(newHighlights);
            drawHighlights(newHighlights);
        };

        const drawHighlights = (highlights) => {
            const canvas = canvasRef.current;
            if (!canvas) return; // 캔버스가 없으면 종료
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';

            highlights.forEach(({ rect }) => {
                ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
            });
        };

        highlightTextNodes();
        window.addEventListener('resize', highlightTextNodes);
        return () => {
            window.removeEventListener('resize', highlightTextNodes);
        };
    }, []); // 의존성 배열을 비워두어 컴포넌트가 마운트될 때만 실행

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={window.innerWidth} // 캔버스의 너비 설정
                height={window.innerHeight} // 캔버스의 높이 설정
                style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
            />
        </div>
    );
};

// 텍스트 노드를 찾는 함수
const findTextNodes = (element) => {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
            if (node.textContent.trim() && getComputedStyle(node.parentElement).display !== 'none') {
                return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
        },
    });

    let node;
    while ((node = walk.nextNode())) {
        textNodes.push(node);
    }
    return textNodes;
};

export default HighlightText; 