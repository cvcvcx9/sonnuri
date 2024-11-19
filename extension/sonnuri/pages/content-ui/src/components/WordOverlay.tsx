import handleMouseMoveOnOverlay from '@src/util/handleMouseMoveOnOverlay';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { highlightTextNodes } from '../util/drawHighlightTextNodes';
import findTextNodes from '../util/findNextNodes';

interface Highlight {
  URL: string;
  rect: {
    left: number;
    top: number;
  }
  isHovered: boolean;
  word: string;
}

const WordOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [hoveredHighlight, setHoveredHighlight] = useState<Highlight | null>(null);

  const showVideoModal = (highlight: any) => {
    setHoveredHighlight(highlight);
  }

  const hideVideoModal = () => {
    setHoveredHighlight(null);
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    // 텍스트 본문을 파싱해서 노드들을 찾아옴
    const textNodes = findTextNodes(document.body);
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    const ctx = canvasRef.current.getContext('2d');
    // 찾아온 노드에서 텍스트와 가지고 있는 텍스트를 이용해서 하이라이트 그리기
    const foundHighlights = highlightTextNodes(canvasRef.current, textNodes);
    setHighlights(foundHighlights);
    // 마우스 움직임 감지



    // 노드 변경 감지 - 리액트 라이프사이클 처럼 노드 변경 감지
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          setHighlights(highlightTextNodes(canvasRef.current, textNodes));
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 스크롤 감지
    let scrollTimer: any = null;

    const handleScroll = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (scrollTimer) clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        setHighlights(highlightTextNodes(canvasRef.current, textNodes));
      }, 100);
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      setHighlights(highlightTextNodes(canvasRef.current, textNodes));
    }

    document.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      document.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);


  const handleMouseMove = (e: MouseEvent) => {
    handleMouseMoveOnOverlay(e, highlights, modalRef.current, showVideoModal, hideVideoModal);
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [highlights]);

  return (
    <div>
      <canvas id="canvas" className="fixed top-0 left-0 pointer-events-none z-9999" ref={canvasRef} />
      <div ref={modalRef} className="fixed p-0 m-0 border-0 max-w-[300px] max-h-[200px] bottom-4 right-4 bg-transparent">
        {hoveredHighlight && (
          <div id="video-modal" className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              url={hoveredHighlight?.URL}
              width="100%"
              height="100%"
              controls={false}
              muted={true}
              playing={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default WordOverlay