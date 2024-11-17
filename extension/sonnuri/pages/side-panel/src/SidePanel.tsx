/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@extension/ui/lib/components/ui';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import SkeletonLoader from './components/SkeletonLoader';

const SidePanel: React.FC = () => {
  // 문장 리스트
  const [sentenceList, setSentenceList] = useState<string[]>([]);
  // 플레이되는 문장의 정보
  const [playlistInfo, setPlaylistInfo] = useState<{ url: string; word: string; definition: string; isFirstIdx: number }[]>([]);
  // 비디오 리스트
  const [playlist, setPlaylist] = useState<string[]>([]);
  // 비디오 리스트의 첫번째 인덱스 정보
  const [playlistInfoIsFirst, setPlaylistInfoIsFirst] = useState<number[]>([]);
  const [allUrls, setAllUrls] = useState<any[]>([]);
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
  const [isPlayAll, setIsPlayAll] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentDefinition, setCurrentDefinition] = useState<string>('');
  const [showAllWords, setShowAllWords] = useState(false);

  // 단어별로 그룹화된 URL 정보 (객체 형태 그대로 사용)
  const [groupedUrls, setGroupedUrls] = useState<{ [key: string]: any[] }>({});

  const [interpolateState, setInterpolateState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    chrome.storage.local.get('original_text', data => {
      if (data.original_text) {
        setOriginalText(data.original_text);
      }
    });

    chrome.storage.local.get('interpolated_url', data => {
      if (data.interpolated_url) {
        setInterpolatedUrl(data.interpolated_url);
      }
    });


    // 저장된 비디오 정보 로드
    chrome.storage.local.get('urls', data => {
      if (data.urls) {
        // urlGroups 객체를 그대로 저장
        setGroupedUrls(data.urls);

        // 전체 URL 리스트는 모든 그룹의 URL을 합쳐서 설정
        const allUrls: any[] = Object.values(data.urls).flat();
        setPlaylistInfo(allUrls.filter((item: any) => item.isFirstIdx !== -1));
        setPlaylist(allUrls.map((item: any) => item.url));
        setPlaylistInfoIsFirst(allUrls.map((item: any) => item.isFirstIdx));

        setIsPlaying(true);
        setIsPlayAll(true);
      }
    });


    // 스토리지 변경을 감하고, 변경된 값을
    const newSentenceListener = (changes: any, namespace: any) => {
      if (changes.urls) {
        setCurrentVideoIndex(0);
        const newUrls = changes.urls.newValue;
        // urlGroups 객체를 그대로 저장
        setGroupedUrls(newUrls);

        // 전체 URL 리스트는 모든 그룹의 URL을 합쳐서 설정
        const allUrls: any[] = Object.values(newUrls).flat();

        setPlaylistInfo(allUrls.filter((item: any) => item.isFirstIdx !== -1));
        setPlaylist(allUrls.map((item: any) => item.url));
        setPlaylistInfoIsFirst(allUrls.map((item: any) => item.isFirstIdx));
      }
      if (changes.original_text) {
        setOriginalText(changes.original_text.newValue);
      }
      if (changes.isLoading) {
        setIsLoading(changes.isLoading.newValue);
      }
    };
    chrome.storage.onChanged.addListener(newSentenceListener);
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'success_make_video_result') {
        setIsLoading(false);
      }
      if (message.type === 'error_make_video_result') {
        setInterpolateLoading(false);
      }

      if (message.type === 'make_video_started') {
        setInterpolateLoading(true);
        setInterpolatedUrl('');
        setInterpolateState('loading');
        chrome.storage.local.remove('interpolated_url');
      }
      if (message.type === 'make_video_ended') {
        setInterpolatedUrl(message.data);
        setInterpolateLoading(false);
        setInterpolateState('success');
        chrome.storage.local.set({ interpolated_url: message.data });
      }
      if (message.type === 'error_make_video_result') {
        setInterpolateLoading(false);
        setInterpolateState('error');
      }
    });

    // 초기 로딩 시 저장된 URL 불러오기
    chrome.storage.local.get('interpolated_url', data => {
      if (data.interpolated_url) {
        setInterpolatedUrl(data.interpolated_url);
        setInterpolateLoading(false);
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(newSentenceListener);
    };
  }, []);

  // 단어 버튼 클릭 핸들러
  const handleWordClick = (word: string) => {
    const wordUrls = groupedUrls[word];
    setPlaylist(wordUrls.map(item => item.url));
    setCurrentVideoIndex(0);
    setIsPlaying(true);
    setIsPlayAll(false);
    setCurrentWord(word);
    // 첫 번째 항목의 definition을 사용
    setCurrentDefinition(wordUrls[0]?.definition || '');
  };

  // 전체 재생 버튼 핸들러
  const handlePlayAll = () => {
    const allUrls = Object.values(groupedUrls).flat();
    // 중복된 URL과 마침표가 포함된 단어 제거
    const uniqueUrls = allUrls.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url) &&
      !item.word.includes('.')
    );

    setPlaylist(uniqueUrls.map(item => item.url));
    setCurrentVideoIndex(0);
    setIsPlaying(true);
    setIsPlayAll(true);
    setCurrentWord('');
    setCurrentDefinition('');
  };

  const getInterpolateStateMessage = () => {
    switch (interpolateState) {
      case 'loading':
        return '비디오 생성중...';
      case 'success':
        return '생성완료';
      case 'error':
        return '영상생성 실패';
      default:
        return '';
    }
  };

  // 표시할 단어 버튼 개수를 계산하는 함수
  const getVisibleWords = () => {
    const words = Object.keys(groupedUrls);
    if (showAllWords || words.length <= 9) {
      return words;
    }
    return words.slice(0, 9);
  };

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
                <img className="w-8 h-8" src="./word_sign_language.png" alt="word" />
              </TabsTrigger>
              <TabsTrigger value="interpolate" className="text-sm w-full" disabled={interpolateLoading}>
                <img className="w-8 h-8" src="./sentence_sign_language.png" alt="word" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sentence">
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <div className="grid md:grid-cols-2">
                  {interpolateState !== 'idle' && (
                    <div className={`text-center ${interpolateState === 'error' ? 'text-red-500' :
                      interpolateState === 'success' ? 'text-green-500' :
                        'text-blue-500'
                      }`}>
                      {getInterpolateStateMessage()}
                    </div>
                  )}
                  <div className="flex flex-col gap-4 mt-4">
                    <button
                      onClick={handlePlayAll}
                      className="text-sm px-4 py-2 bg-[#4A5578] text-white rounded-lg w-full"
                    >
                      전체 재생
                    </button>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getVisibleWords().map((word, index) => (
                        <button
                          key={index}
                          onClick={() => handleWordClick(word)}
                          className={`text-sm px-2 py-1 rounded-full ${currentWord === word
                            ? 'bg-[#2A3250] text-white'
                            : 'border border-[#5B679E] text-[#5B679E] hover:bg-[#5B679E] hover:text-white'
                            }`}
                        >
                          {word}
                        </button>
                      ))}
                      {Object.keys(groupedUrls).length > 9 && (
                        <button
                          onClick={() => setShowAllWords(!showAllWords)}
                          className="text-sm px-2 py-1 rounded-full border border-[#5B679E] text-[#5B679E] hover:bg-[#5B679E] hover:text-white"
                        >
                          {showAllWords ? '...접기' : '...더보기'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="player-wrapper">
                      {playlist.length > 0 ? (
                        <Card className="w-full">
                          <CardContent className="p-4">
                            <ReactPlayer
                              url={playlist[currentVideoIndex]}
                              controls={false}
                              playing={isPlaying}
                              playbackRate={playerSpeed}
                              width="100%"
                              height="200px"
                              style={{ backgroundColor: '#000000' }}
                              onEnded={() => {
                                if (currentVideoIndex < playlist.length - 1) {
                                  setCurrentVideoIndex(prev => prev + 1);
                                } else {
                                  setIsPlaying(false);
                                  setIsPlayAll(false);
                                  setCurrentVideoIndex(0);
                                }
                              }}
                            />
                            {/* <div className="mt-2 text-right">
                              {playerSpeed.toFixed(1)}x
                            </div> */}
                            <div className="flex justify-center pt-6 items-center gap-4">
                              <button onClick={() => setPlayerSpeed(playerSpeed - 0.1)} disabled={playerSpeed <= 0.5}>
                                <img className="w-8 h-8" src="./slower.png" alt="minus" />
                              </button>
                              <button onClick={() => setIsPlaying(!isPlaying)}>
                                {isPlaying ? '일시정지' : '재생'}
                              </button>
                              <button onClick={() => setPlayerSpeed(playerSpeed + 0.1)} disabled={playerSpeed >= 3.0}>
                                <img className="w-8 h-8" src="./faster.png" alt="plus" />
                              </button>
                            </div>
                            <div className="mt-2">
                              <div className="font-bold">단어의 뜻</div>
                              <div className="mt-1 text-gray-700">
                                {currentDefinition || '재생할 단어를 선택해주세요'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="w-full">
                          <CardContent className="p-4">
                            <div className="bg-transparent w-full h-[200px] rounded-lg flex items-center justify-center">
                              <ReactPlayer width="100%" height="200px" style={{ backgroundColor: '#000000' }} />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="interpolate">
              <h2 className="text-lg font-bold">
                원문
              </h2>
              <h3 className="text-sm text-center mt-2">{originalText}</h3>
              <h2 className="text-lg font-bold mt-4">
                번역된 수어 비디오
              </h2>
              <Card className="w-full">
                <CardContent className="p-4">
                  <ReactPlayer
                    url={interpolatedUrl}
                    controls={true}
                    playing={isPlaying}
                    playbackRate={playerSpeed}
                    onEnded={() => {
                      setIsPlaying(false);
                    }}
                    width="100%"
                    height="200px"
                    style={{ backgroundColor: '#000000' }}
                  />
                  {/* <div className="mt-2 text-right">
                    {playerSpeed.toFixed(1)}x
                  </div> */}
                  <div className="flex justify-center pt-6 items-center gap-4">
                    <button onClick={() => setPlayerSpeed(playerSpeed - 0.1)} disabled={playerSpeed <= 0.5}>
                      <img className="w-8 h-8" src="./slower.png" alt="minus" />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? '일시정지' : '재생'}
                    </button>
                    <button onClick={() => setPlayerSpeed(playerSpeed + 0.1)} disabled={playerSpeed >= 3.0}>
                      <img className="w-8 h-8" src="./faster.png" alt="plus" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div >
  );
};

export default SidePanel;
