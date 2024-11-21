/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from '@extension/ui/lib/components/ui';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import SkeletonLoader from './components/SkeletonLoader';

const SidePanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // 재생 상태 추가
  const [interpolatedUrl, setInterpolatedUrl] = useState('');
  const [playerSpeed, setPlayerSpeed] = useState(1.5);
  const [originalText, setOriginalText] = useState('');

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
        setIsLoading(false);
        setInterpolatedUrl(data.interpolated_url);
      } else {
        setInterpolatedUrl('');
        setIsLoading(true);
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Received message:', message);

      if (message.type === 'open_side_panel') {
        console.log('Handling open_side_panel message');
        setIsLoading(true);
        setInterpolatedUrl('');
        setInterpolateState('idle');
      }

      if (message.type === 'success_make_video_result') {
        setIsLoading(false);
      }
      if (message.type === 'error_make_video_result') {
        setIsLoading(false);
        setInterpolateState('error');
      }

      if (message.type === 'make_video_started') {
        setIsLoading(true);
        setInterpolatedUrl('');
        setInterpolateState('loading');
        chrome.storage.local.remove('interpolated_url');
      }
      if (message.type === 'make_video_ended') {
        setInterpolatedUrl(message.data);
        setIsLoading(false);
        setInterpolateState('success');
        chrome.storage.local.set({ interpolated_url: message.data });
      }
      if (message.type === 'error_make_video_result') {
        setIsLoading(false);
        setInterpolateState('error');
      }
    });

    // 초기 로딩 시 저장된 URL 불러오기
    chrome.storage.local.get('interpolated_url', data => {
      if (data.interpolated_url) {
        setInterpolatedUrl(data.interpolated_url);
        setIsLoading(false);
      }
    });

    const newSentenceListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.original_text) {
        setOriginalText(changes.original_text.newValue);
      }
      if (areaName === 'local' && changes.isLoading) {
        setIsLoading(changes.isLoading.newValue);
      }
    };
    chrome.runtime.connect({ name: 'side_panel' });
    chrome.storage.onChanged.addListener(newSentenceListener);

    return () => {
      chrome.storage.onChanged.removeListener(newSentenceListener);
    };
  }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full bg-[#DFE7FD]">
        <CardContent className="p-4 min-h-[500px]">
          <h2 className='text-lg font-bold mt-4'>번역 요청 원문</h2>
          <h3 className="text-sm text-center mt-2">{originalText}</h3>
          <h2 className="text-lg font-bold mt-4">번역된 수어 비디오</h2>
          <Card className="w-full">
            <CardContent className="p-4">
              {isLoading ? (
                <SkeletonLoader />
              ) : interpolateState === 'error' ? (
                <div className="flex justify-center items-center h-full">
                  <h3 className="text-red-500">비디오 생성에 실패했습니다.</h3>
                </div>
              ) : (
                <ReactPlayer
                  url={interpolatedUrl}
                  controls={false}
                  playing={isPlaying}
                  playbackRate={playerSpeed}
                  loop={true}
                  onEnded={() => {
                    setIsPlaying(false);
                  }}

                  width="100%"
                  height="200px"
                  style={{ backgroundColor: '#000000' }}
                />
              )}
              {/* <div className="mt-2 text-right">
                    {playerSpeed.toFixed(1)}x
                  </div> */}
              <div className="flex justify-center pt-6 items-center gap-4">
                <button onClick={() => setPlayerSpeed(playerSpeed - 0.1)} disabled={playerSpeed <= 0.5}>
                  <img className="w-8 h-8" src="./slower.png" alt="minus" />
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? (
                    <img className="w-8 h-8" src="./Pause.png" alt="pause" />
                  ) : (
                    <img className="w-8 h-8" src="./Play.png" alt="play" />
                  )}
                </button>
                <button onClick={() => setPlayerSpeed(playerSpeed + 0.1)} disabled={playerSpeed >= 3.0}>
                  <img className="w-8 h-8" src="./faster.png" alt="plus" />
                </button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SidePanel;
