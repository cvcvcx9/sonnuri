/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '../../../packages/ui/lib/components/ui';
import SkeletonLoader from './components/SkeletonLoader';

const SidePanel: React.FC = () => {
  const [sentenceList, setSentenceList] = useState<string[]>([]);
  const [playlistInfo, setPlaylistInfo] = useState<{url: string, word: string, isFirstIdx: number}[]>([]); 
  const [playlist, setPlaylist] = useState<string[]>([]); 
  const [playlistInfoIsFirst, setPlaylistInfoIsFirst] = useState<number[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // 재생 상태 추가
  // 비디오 재생이 끝났을 때 다음 비디오로 넘어가는 핸들러
  const handleVideoEnd = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      const nextIsFirst = playlistInfoIsFirst[currentVideoIndex + 1];
      console.log(nextIsFirst);
      setIsPlaying(nextIsFirst === -1 ? true : false); 
    } 
  };
// 버튼 클릭 핸들러 추가
  const handleButtonClick = (index: number) => {
    setCurrentVideoIndex(index); // 클릭한 버튼의 인덱스를 현재 비디오 인덱스로 설정
    setIsPlaying(true);
  };
  // URL 추출 로직 수정

  // 저장된 텍스트 로드 및 스토리지 변경 감지
  useEffect(() => {
    chrome.storage.local.get("urls", (data) => {
      if (data.urls) {
        console.log(data.urls);
        setPlaylistInfo(data.urls.filter((item: any) => item.isFirstIdx !== -1));
        setPlaylist(data.urls.map((item: any) => item.url));
        setPlaylistInfoIsFirst(data.urls.map((item: any) => item.isFirstIdx));
      }
    });
    // 스토리지 변경을 감지하고, 변경된 값을 
    const newSentenceListener = (changes: any, namespace: any) => {
      if (changes.urls) {
        setCurrentVideoIndex(0);
        setPlaylistInfo(changes.urls.newValue.filter((item: any) => item.isFirstIdx !== -1));
        setPlaylist(changes.urls.newValue.map((item: any) => item.url));
        setPlaylistInfoIsFirst(changes.urls.newValue.map((item: any) => item.isFirstIdx));
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
            <Button key={index} onClick={() => handleButtonClick(item.isFirstIdx)} className="text-sm bg-gray-200 px-2 py-1 rounded-full">{item.word}</Button>
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
                  // url={"https://sonnuri.s3.ap-northeast-2.amazonaws.com/sentence/processed_52a78f3c57b475c024e9a8b7329cbf9c.mp4"}
                  controls={false}
                  playing={isPlaying}
                  // 
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
