// VideoSection.js
import React from 'react';
import { FaPauseCircle } from "react-icons/fa"; // 일시정지 아이콘을 위한 라이브러리

function VideoSection({ videoTitle }) {
  return (
    <div className="flex items-center justify-center w-1/2 h-full pt-12 pr-20">
      <div className="flex flex-col items-center justify-center w-[320px] h-[480px] border border-gray-300 bg-white shadow-lg rounded-lg relative">
        <span className="text-gray-500 text-lg">{videoTitle}</span>
        <div className="absolute bottom-4 flex items-center justify-center">
          <div className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-full bg-white">
            <FaPauseCircle className="text-gray-500 text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoSection;
