/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button, Card, CardContent } from '@extension/ui/lib/components/ui';
import SkeletonLoader from './components/SkeletonLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@extension/ui/lib/components/ui';

const SidePanel: React.FC = () => {
  // 문장 리스트
  const [sentenceList, setSentenceList] = useState<string[]>([]);
  // 플레이되는 문장의 정보
  const [playlistInfo, setPlaylistInfo] = useState<{ url: string; word: string; isFirstIdx: number }[]>([]);
  // 비디오 리스트
  const [playlist, setPlaylist] = useState<string[]>([]);
  // 비디오 리스트의 첫번째 인덱스 정보
  const [playlistInfoIsFirst, setPlaylistInfoIsFirst] = useState<number[]>([]);
  // 현재 재생중인 비디오 인덱스
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  // 비디오 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // 재생 상태
  const [isPlaying, setIsPlaying] = useState(false); // 재생 상태 추가
  const [interpolateLoading, setInterpolateLoading] = useState(true);
  const [interpolatedUrl, setInterpolatedUrl] = useState('');
  const [playerSpeed, setPlayerSpeed] = useState(1.5);
  // 원본 텍스트
  const [originalText, setOriginalText] = useState('');
  // 비디오 재생이 끝났을 때 다음 비디오로 넘어가는 핸들러
  const handleVideoEnd = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      // 연속재생 아닌경우 주석 처리
      // setCurrentVideoIndex(currentVideoIndex + 1);
      // const nextIsFirst = playlistInfo[currentVideoIndex + 1];
      // console.log(nextIsFirst);
      // setIsPlaying(nextIsFirst.isFirstIdx === -1 ? true : false);
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
    chrome.storage.local.get('original_text', data => {
      if (data.original_text) {
        setOriginalText(data.original_text);
      }
    });

    chrome.storage.local.get('created_video_url', data => {
      if (data.created_video_url) {
        setInterpolatedUrl(data.created_video_url);
        setInterpolateLoading(false);
      }
    });
    // 저장된 비디오 정보 로드
    chrome.storage.local.get('urls', data => {
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
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'success_make_video_result') {
        setIsLoading(false);
      }
      if (message.type === 'make_video_started') {
        setInterpolateLoading(true);

        console.log('보간 비디오 생성 시작');
      }
      if (message.type === 'make_video_ended') {
        setInterpolatedUrl(message.data);
        setInterpolateLoading(false);

        console.log('보간 비디오 생성 완료');
      }
    });
    return () => {
      chrome.storage.onChanged.removeListener(newSentenceListener);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center ">
        <img className="w-16 h-16" src="./sonnuri_logo.png" alt="logo" />
      </div>

      <Card className="w-full bg-[#DFE7FD]">
        <CardContent className="p-4 min-h-[500px]">
          <Tabs defaultValue="sentence" className="w-full">
            <TabsList className="flex justify-center">
          <TabsTrigger value="sentence" className="text-sm w-full">
            단어별 보기
          </TabsTrigger>
          <TabsTrigger value="interpolate" className="text-sm w-full" disabled={interpolateLoading}>
            수어
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sentence">
          <div className="grid md:grid-cols-2 gap-8">
            {interpolateLoading && <div className="text-center text-gray-500">이어보기 비디오 생성중...</div>}
            <div className="flex flex-wrap gap-2">
              {playlistInfo && playlistInfo.length > 0 ? (
                playlistInfo.map((item, index) => (
                  <Button
                    
                    key={index}
                    onClick={() => handleButtonClick(item.isFirstIdx)}
                    className="text-sm bg-[#C1C1C1] px-2 py-1 text-white rounded-full">
                    {item.word}
                  </Button>
                ))
              ) : (
                <div className="text-center text-gray-500">저장된 문장이 없습니다.</div>
              )}
            </div>
            <div className="space-y-4">
              <div className="player-wrapper">
                {isLoading ? (
                  <SkeletonLoader />
                ) : playlist.length > 0 ? (
                  <>
                    <ReactPlayer
                      url={playlist[currentVideoIndex]}
                      // url={"https://sonnuri.s3.ap-northeast-2.amazonaws.com/sentence/processed_52a78f3c57b475c024e9a8b7329cbf9c.mp4"}
                      controls={false}
                      playing
                      playbackRate={playerSpeed}
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
                    <ReactPlayer width="100%" height="200px" style={{ backgroundColor: '#000000' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="interpolate">
          <h2 className="text-md font-bold">
            {originalText}
          </h2>
          <ReactPlayer
            url={interpolatedUrl}
            controls={false}
            playing
            playbackRate={playerSpeed}
            width="100%"
            height="200px"
            onEnded={handleVideoEnd}
            style={{ backgroundColor: '#000000' }}
            />
          <div className="mt-2"></div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-center pt-6 items-center">
        <button onClick={() => setPlayerSpeed(playerSpeed - 0.1)} disabled={playerSpeed <= 0.5}>
          <img className="w-8 h-8" src="./slower.png" alt="minus" />
        </button>
        <button onClick={() => setPlayerSpeed(playerSpeed + 0.1)} disabled={playerSpeed >= 2.0}>
          <img className="w-8 h-8" src="./faster.png" alt="plus" />
        </button>
      </div>
      </CardContent>
      </Card>
      
    </div>
  );
};

export default SidePanel;
