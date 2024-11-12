/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '../../../packages/ui/lib/components/ui';
import SkeletonLoader from './components/SkeletonLoader';

const SidePanel: React.FC = () => {
  const [sentenceList, setSentenceList] = useState<string[]>([]);
  const [playlistInfo, setPlaylistInfo] = useState<{url: string, word: string}[]>([]); 
  const [playlist, setPlaylist] = useState<string[]>([]); 
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // 비디오 재생이 끝났을 때 다음 비디오로 넘어가는 핸들러
  const handleVideoEnd = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } 
  };
// 버튼 클릭 핸들러 추가
  const handleButtonClick = (index: number) => {
    setCurrentVideoIndex(index); // 클릭한 버튼의 인덱스를 현재 비디오 인덱스로 설정
  };
  // URL 추출 로직 수정
  

  // handleUpdatedTexts 함수 수정
  // const handleUpdatedTexts = async (newText: string) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch("http://k11a301.p.ssafy.io:8001/determine", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },  
  //       body: JSON.stringify({ text: newText }),
  //     });
  //     const data = await response.json();
  //     const videoUrls = extractUrls(data.result);
  //     setPlaylistInfo(videoUrls);
  //     setPlaylist(videoUrls.map((item) => item.url));
  //     setCurrentVideoIndex(0);
  //   } catch (error) {
  //     console.error("에러:", error);
  //   } finally {
  //     setIsLoading(false);
  //     chrome.runtime.sendMessage({type: "success"});
  //   }
  // };

  // 저장된 텍스트 로드 및 스토리지 변경 감지
  useEffect(() => {
    chrome.storage.local.get("urls", (data) => {
      if (data.urls) {
        setPlaylistInfo(data.urls);
        setPlaylist(data.urls.map((item) => item.url));
        console.log(data.urls);
      }
    });
    // 스토리지 변경을 감지하고, 변경된 값을 기반으로, 서버에 요청을 보내는 로직
    const newSentenceListener = (changes: any, namespace: any) => {
      if (changes.urls) {
        setPlaylistInfo(changes.urls.newValue);
      }
    };
    chrome.storage.onChanged.addListener(newSentenceListener);
    return () => {
      chrome.storage.onChanged.removeListener(newSentenceListener);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">손누리</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <h2 className="text-2xl font-semibold">문장</h2>
        <div className="flex flex-wrap gap-2">

          {playlistInfo && playlistInfo.length > 0 ? playlistInfo.map((item, index) => (
            <Button key={index} onClick={() => handleButtonClick(index)} className="text-sm bg-gray-200 px-2 py-1 rounded-full">{item.word}</Button>
            )) : <div className="text-center text-gray-500">
              저장된 문장이 없습니다.
            </div>}
          
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">수어</h2>
          <div className="player-wrapper">
            {isLoading ? (
              <SkeletonLoader />
            ) : playlist.length > 0 ? (
              <>
                <ReactPlayer
                  url={playlist[currentVideoIndex]}
                  controls={false}
                  playing
                  playbackRate={1.5}
                  width="100%"
                  height="200px"
                  onEnded={handleVideoEnd}
                  style={{ backgroundColor: '#000000' }}
                />
                <div className="mt-2">
                  재생 중: {currentVideoIndex + 1} / {playlist.length}
                </div>
              </>
            ) : (
              <div className="bg-black w-full h-[200px] rounded-lg flex items-center justify-center">
                <ReactPlayer
                  width="100%"
                  height="200px"
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