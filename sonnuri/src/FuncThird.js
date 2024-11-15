import func3 from "./image/func3.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";
import positionsign from "./image/위치고정.png"


function FuncThird() {
  const videoSrc = "/video/Fixposition2.mp4"
  return ( 
    <div className="flex flex-row items-center justify-between px-4 mb-10 h-screen"> 
      {/* 왼쪽 콘텐츠: 수어번역 정보 */}  
      <InfoSection 
        number={3} 
        title="위치 고정" 
        description="필요한 위치에 영상 창을 고정할 수 있습니다." 
        image={func3} 
        titleImage={positionsign}
        titleImageWidth="300px" 
      />

      {/* 오른쪽 콘텐츠: 영상 */}
      <VideoSection key={videoSrc + Date.now()} videoTitle="영상" videoSrc="/video/Fixposition2.mp4" />
      <Dot activeIndex={3} />
    </div>  
  );  
}  
 
export default FuncThird;
