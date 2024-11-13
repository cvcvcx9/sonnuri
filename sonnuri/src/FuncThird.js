import func3 from "./image/func3.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";

function FuncThird() {
  return ( 
    <div className="flex flex-row items-center justify-between px-4 mb-10 h-screen"> 
      {/* 왼쪽 콘텐츠: 수어번역 정보 */}  
      <InfoSection 
        number={3} 
        title="위치 고정" 
        description="필요한 위치에 영상 창을 고정할 수 있습니다." 
        image={func3} 
      />

      {/* 오른쪽 콘텐츠: 영상 */}
      <VideoSection 
        videoTitle="영상 보여줘야 함"
      />  
      <Dot activeIndex={3} />
    </div>  
  );  
}  
 
export default FuncThird;
