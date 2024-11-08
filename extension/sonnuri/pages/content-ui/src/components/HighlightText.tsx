/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useRef, useState } from 'react';
import serverWords from '../data/words.js';

const HighlightText: React.FC = () => {
    const [highlights, setHighlights] = useState<{ word: string; rect: DOMRect; URL: string }[]>([]);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ word: '', URL: '' });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('HighlightText loaded');
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvasRef.current!.width = window.innerWidth;
            canvasRef.current!.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const hoveredHighlight = highlights.find(
                (highlight) =>
                    mouseX >= highlight.rect.left &&
                    mouseX <= highlight.rect.right &&
                    mouseY >= highlight.rect.top &&
                    mouseY <= highlight.rect.bottom
            );

            if (hoveredHighlight) {
                showModal(hoveredHighlight, mouseX, mouseY);
            } else {
                hideModal();
            }
        };

        
        const showModal = (highlight: { word: string; rect: ClientRect; URL: string }, mouseX: number, mouseY: number) => {
            setModalContent({ word: highlight.word, URL: highlight.URL });
            modalRef.current!.style.left = `${mouseX + 10}px`;
            modalRef.current!.style.top = `${mouseY + 10}px`;
            modalRef.current!.style.display = 'block';
            setModalVisible(true);
        };

        const hideModal = () => {
            modalRef.current!.style.display = 'none';
            setModalVisible(false);
        };

        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isHighlighting]);

    const findTextNodes = (element: HTMLElement) => {
        const textNodes: Node[] = [];
        const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (
                    node.textContent?.trim() &&
                    node.parentElement &&
                    getComputedStyle(node.parentElement).display !== 'none' &&
                    getComputedStyle(node.parentElement).visibility !== 'hidden'
                ) {
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
    const highlightTextNodes = () => {
        const ctx = canvasRef.current!.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        const textNodes = findTextNodes(document.body);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        const newHighlights: { word: string; rect: ClientRect; URL: string }[] = [];

        textNodes.forEach((node) => {
            const text = node.textContent;
            const wordRegex = /\S+/g;
            let match;
            const range = document.createRange();

            while ((match = wordRegex.exec(text ?? '')) !== null) {
                const word = match[0];
                const startOffset = match.index;
                const matchServerWord = serverWords.find(
                    (serverWord) => serverWord.word === word
                );

                range.setStart(node, startOffset);
                range.setEnd(node, startOffset + word.length);

                if (matchServerWord) {
                    const rects = range.getClientRects();
                    for (let i = 0; i < rects.length; i++) {
                        const rect = rects[i];
                        if (rect.width > 0 && rect.height > 0) {
                            ctx!.roundRect(
                                rect.left,
                                rect.top,
                                rect.width,
                                rect.height,
                                5
                            );
                            newHighlights.push({
                                word: word,
                                rect: rect,
                                URL: matchServerWord.URL || '',
                            });
                            ctx!.fill();
                            ctx!.stroke();
                        }
                    }
                }
            }
        });

        setHighlights(newHighlights);
    };

    const toggleHighlighting = () => {
        setIsHighlighting(!isHighlighting);
        if (!isHighlighting) {
            highlightTextNodes();
        } else {
            const ctx = canvasRef.current!.getContext('2d');
            ctx!.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            setHighlights([]);
        }
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}
            />
            <div
                ref={modalRef}
                style={{
                    position: 'fixed',
                    background: 'white',
                    border: '1px solid black',
                    padding: '10px',
                    zIndex: 10001,
                    display: modalVisible ? 'block' : 'none',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}
            >
                <div>{modalContent.word}</div>
                <video
                    style={{ width: '100%', borderRadius: '5px' }}
                    controls
                    autoPlay
                    loop
                >
                    <source src={modalContent.URL} type="video/mp4" />
                </video>
            </div>
            <button onClick={toggleHighlighting}>
                {isHighlighting ? '하이라이트 끄기' : '하이라이트 켜기'}
            </button>
        </div>
    );
};

export default HighlightText;