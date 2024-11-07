import func2 from "./image/func2.png";
import InfoSection from "./InfoSection";
import VideoSection from "./VideoSection";
import Dot from "./Dot";

function FuncSecond() {
  return (
    <div className="flex flex-row items-center justify-between px-20 py-20 h-screen">
      {/* 왼쪽 콘텐츠: 수어번역 정보 */}
      <InfoSection
        number={2}
        title="재생 속도 조절"
        description="빠르게, 느리게로 더 편하게 이해할 수 있습니다."
        image={func2}
      />

      {/* 오른쪽 콘텐츠: 영상 */}
      <VideoSection videoTitle="영상 보여줘야 함" />

      <Dot activeIndex={2} />
    </div>
  );
}

export default FuncSecond;
