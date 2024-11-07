import func4 from "./image/func4.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";

function FuncForth() {
  return ( 
    <div className="flex flex-row items-center justify-between px-20 py-20 h-screen"> 
      {/* 왼쪽 콘텐츠: 수어번역 정보 */}  
      <InfoSection 
        number={4} 
        title="불투명도 조절" 
        description="원하는 투명도로 영상 창을 조절하여 가독성을 높입니다." 
        image={func4} 
      />

      {/* 오른쪽 콘텐츠: 영상 */}
      <VideoSection 
        videoTitle="영상 보여줘야 함" 
      /> 
      <Dot activeIndex={4} />
    </div>  
  );  
}  
 
export default FuncForth;
