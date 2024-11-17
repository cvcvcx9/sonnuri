// import func1 from "./image/func1.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";
import handsign from "./image/수어번역그림.jpg";
import handsignimage from "./image/수어단어이미지.png";


function FuncFirst() {
  const videoSrc = "/video/signtranslation.mp4";
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-4 mb-10 h-screen">
        {/* 왼쪽 콘텐츠: 수어번역 정보 */}
        <InfoSection
          number={1}
          title="수어 번역"
          description="단어에 마우스를 올리거나 문장을 드래그하면 수어 영상을 보여줍니다."
          image={handsignimage}
          titleImage={handsign}
          titleImageWidth="180px"
          paddingLeft="60px"
        />

        {/* 오른쪽 콘텐츠: 영상 */}
        <VideoSection key={videoSrc + Date.now()} videoSrc="/video/Signtranslation2.mp4" />
      </div>
      

      <Dot activeIndex={1} />
    </div>
  );
}

export default FuncFirst;
