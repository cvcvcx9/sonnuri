import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // 아이콘 임포트
import FuncFirst from "./FuncFirst";
import FuncSecond from "./FuncSecond";
import FuncThird from "./FuncThird";
import FuncForth from "./FuncForth";
import { useRef } from "react";

function Slider() {
  const swiperRef = useRef(null); // Swiper 인스턴스에 대한 참조 생성

  return (
    <div className="relative">
      <Swiper
        ref={swiperRef} // Swiper에 ref 추가
        modules={[Navigation, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000 }}
        className="w-full h-auto"
      >
      

        <SwiperSlide className="bg-gray-100 flex items-center justify-center">
          <FuncFirst />
        </SwiperSlide>
        <SwiperSlide className="bg-gray-100 flex items-center justify-center">
          <FuncSecond />
        </SwiperSlide>
        <SwiperSlide className="bg-gray-100 flex items-center justify-center">
          <FuncThird />
        </SwiperSlide>
        <SwiperSlide className="bg-gray-100 flex items-center justify-center">
          <FuncForth />
        </SwiperSlide>
      </Swiper>

      {/* 사용자 정의 이전 버튼 */}
      <div
        className="absolute left-32 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow cursor-pointer"
        onClick={() => swiperRef.current.swiper.slidePrev()} // 슬라이드 이전
      >
        <FaChevronLeft className="text-gray-700 pr-1" size={24} />
      </div>

      {/* 사용자 정의 다음 버튼 */}
      <div
        className="absolute right-32 top-1/2 transform -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow cursor-pointer"
        onClick={() => swiperRef.current.swiper.slideNext()} // 슬라이드 다음
      >
        <FaChevronRight className="text-gray-700 pl-1" size={24} />
      </div>
    </div>
  );
}

export default Slider;
