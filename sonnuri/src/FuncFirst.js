import func1 from "./image/func1.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";
import handsign from "./image/수어번역그림.jpg"
import signvideo from "./video/수어번역.mp4"

function FuncFirst() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-4 mb-10 h-screen">
        {/* 왼쪽 콘텐츠: 수어번역 정보 */}
        <InfoSection
          number={1}
          title="수어 번역"
          description="단어에 마우스를 올리거나 문장을 드래그하면 수어 영상을 보여줍니다."
          image={func1}
          titleImage={handsign}
          titleImageWidth="180px" 
        />

        {/* 오른쪽 콘텐츠: 영상 */}
        <VideoSection videoTitle="영상" videoSrc={signvideo} />
      </div>
      
        <Dot activeIndex={1} />
      
    </div>
  );
}

export default FuncFirst;
