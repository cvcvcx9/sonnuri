import React from 'react';

function VideoSection({ videoTitle, videoSrc }) {
  return (
    <div className="flex items-center justify-center w-1/2 h-full pt-40 pr-40">
      <div className="flex flex-col items-center justify-center w-[480px] h-[320px] border border-gray-300 bg-white shadow-lg rounded-lg relative">
        {/* 제목 */}
        <span className="text-gray-500 text-lg absolute top-2">{videoTitle}</span>
        
        {/* 동영상 */}
        <video
          className="w-full h-full rounded-lg"
          controls
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default VideoSection;
