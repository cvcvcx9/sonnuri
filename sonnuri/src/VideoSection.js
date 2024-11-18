import React from 'react';

function VideoSection({ videoSrc }) {
  return (
    <div className="flex items-center justify-center w-1/2 h-full pt-20 pr-40">
      <div className="flex flex-col items-center justify-center w-[450px] h-[255px] border border-gray-300 bg-white shadow-lg rounded-lg relative">
        
        
        {/* 동영상 */}
        <video
          className="w-400 h-full rounded-lg"
          controls
          autoPlay
          muted
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default VideoSection;
