// import func2 from "./image/func2.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";
import speedsign from "./image/속도조절.png"
import speedsignimage from "./image/재생속도조절이미지2.png"



function FuncSecond() {
  const videoSrc = "/video/Speedcontrol2.mp4"
  return (
    <div className="flex flex-row items-center justify-between px-4 mb-10 h-screen">
      {/* 왼쪽 콘텐츠: 수어번역 정보 */}
      <InfoSection
        number={2}
        title="재생 속도 조절"
        description="빠르게, 느리게로 더 편하게 이해할 수 있습니다."
        image={speedsignimage}
        titleImage={speedsign}
        titleImageWidth="400px"
        paddingLeft="40px"
      />

      {/* 오른쪽 콘텐츠: 영상 */}
      <VideoSection key={videoSrc + Date.now()} videoTitle="영상" videoSrc="/video/Speedcontrol2.mp4" />

      <Dot activeIndex={2} />
    </div>
  );
}

export default FuncSecond;
