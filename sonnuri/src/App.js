import React, { useEffect, useRef, useState } from "react";
import Slider from "./Slider";

import wordvideo from "./image/단어수어영상.png";
import senvideo from "./image/문장수어영상.png";
import hand from "./image/한국수어.png";
import sonnuri from "./image/sonnuri.png";

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // 요소가 보일 때 상태 업데이트
          observer.disconnect(); // 더 이상 관찰할 필요 없음
        }
      },
      { threshold: 0.05 } // 요소가 5% 보일 때 콜백 호출
    );

    if (ref.current) {
      observer.observe(ref.current); // 요소 관찰 시작
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current); // 컴포넌트 언마운트 시 관찰 종료
      }
    };
  }, []);

  return (
    <div>
      <header className="flex justify-center">
        <img src={sonnuri} className="w-auto h-20 my-2" />
      </header>
      <div className="relative">
        <img
          src={hand}
          alt="수어하는 손 이미지"
          className="w-full h-auto opacity-90"
        />
        <div className="absolute inset-0 bg-gray-800 opacity-40"></div>
        <div
          className="absolute inset-0 flex flex-col justify-center items-center text-white "
          style={{ fontSize: "4.5vw" }}
        >
          <div className="text-5xl md:text-6xl lg:text-7xl text-center animate-slide-up font-semibold">
            손 끝으로 만나는
          </div>
          <div className="text-5xl md:text-6xl lg:text-7xl pt-6 text-center animate-slide-up font-semibold">
            새로운 인터넷 세상
          </div>

          <div className="text-xl md:text-xl lg:text-2xl pt-10 text-center animate-slide-up text-white text-opacity-80">
            모든 콘텐츠를 수어로 쉽게 이해하세요
          </div>

        </div>
      </div>

      {/* About us 부분 */}
      <div className="flex flex-col items-center my-20">
        <div className="w-px h-16 bg-gray-300"></div>
        <div className="mt-4 text-3xl text-gray-400">About us</div>
        <div
          ref={ref} // 요소에 ref 추가
          className={`pt-4 text-3xl mt-8 transition-opacity duration-700 ${
            isVisible ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <span className="text-5xl font-semibold pr-1">손누리</span>는 한국어를
          수어로 번역해주는 확장 프로그램입니다.
        </div>

        <div className="flex flec-col items-center">
          <div>
            <img src={wordvideo} alt="단어 수어 영상" className="w-80 h-auto" />
            <div className="pt-20 text-gray-500 text-2xl">
              <div>청각장애인의 인터넷 소통을 </div>
              <div className="pt-2">더 쉽게 만들어드립니다!</div>
            </div>
          </div>
          <div>
            <div className="w-80 h-auto pt-60 pl-10">
              <img src={senvideo} alt="문장 수어 영상" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Slider />
      </div>
    </div>
  );
}

export default App;
