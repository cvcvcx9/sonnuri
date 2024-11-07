import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '../../../packages/ui/lib/components/ui';

const SidePanel: React.FC = () => {
  const [sentenceList, setSentenceList] = useState<string[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // 비디오 재생이 끝났을 때 다음 비디오로 넘어가는 핸들러
  const handleVideoEnd = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // URL 추출 로직 수정
  const extractUrls = (sentences: any) => {
    const urls: string[] = [];
    sentences.forEach((sentence: any) => {
      sentence.words.forEach((word: any) => {
        if (word.url) {
          urls.push(word.url);
        }
        if (word.tokens) {
          word.tokens.forEach((token: any) => {
            if (token.url) {
              urls.push(token.url);
            }
          });
        }
      });
    });
    return urls;
  };

  // handleUpdatedTexts 함수 수정
  const handleUpdatedTexts = async (newText: string) => {
    console.log("newText", newText);
    try {
      const response = await fetch("http://k11a301.p.ssafy.io:8001/determine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newText }),
      });
      const data = await response.json();
      const videoUrls = extractUrls(data.result);
      setPlaylist(videoUrls);
      setCurrentVideoIndex(0);
    } catch (error) {
      console.error("에러:", error);
    }
  };

  // 저장된 텍스트 로드 및 스토리지 변경 감지
  useEffect(() => {
    loadSavedTexts();

    const handleStorageChange = async (changes: any, namespace: string) => {
      if (changes.savedTexts) {
        loadSavedTexts();
        const newTexts = changes.savedTexts.newValue;
        handleUpdatedTexts(newTexts[newTexts.length - 1]);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  function loadSavedTexts() {
    chrome.storage.local.get("savedTexts", (data) => {
      setSentenceList(data.savedTexts);
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">손누리</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <h2 className="text-2xl font-semibold">문장</h2>
        <Accordion type="single" collapsible className="w-full">
          {sentenceList && sentenceList.length > 0 ? sentenceList.map((sentence, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{sentence}</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">이것은 첫 번째 항목의 내용입니다.</p>
                <Button>자세히 보기</Button>
              </AccordionContent>
            </AccordionItem>
          )) : <div className="text-center text-gray-500">
            저장된 문장이 없습니다.
          </div>}
        </Accordion>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">수어</h2>
          <div className="player-wrapper">
            {playlist.length > 0 ? (
              <>
                <ReactPlayer
                  url={playlist[currentVideoIndex]}
                  controls
                  playing
                  width="100%"
                  height="300px"
                  onEnded={handleVideoEnd}
                  style={{ backgroundColor: '#000000' }}
                />
                <div className="mt-2">
                  재생 중: {currentVideoIndex + 1} / {playlist.length}
                </div>
              </>
            ) : (
              <div className="bg-black w-full h-[300px] rounded-lg flex items-center justify-center">
                <ReactPlayer
                  width="100%"
                  height="300px"
                  style={{ backgroundColor: '#000000' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
