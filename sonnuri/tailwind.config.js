/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: { 
    extend: { 
      fontFamily: { 
        'hanbit': ['KCCHanbit', 'sans-serif'], 
      }, 
      animation: {
        'slide-up': 'slide-up 0.7s ease forwards', // 애니메이션 이름과 속성 추가
      },
      keyframes: {
        'slide-up': {
          '0%': {
            transform: 'translateY(50px)', // 시작 위치
            opacity: '0',                  // 시작 투명도
          },
          '100%': {
            transform: 'translateY(0)',   // 끝 위치
            opacity: '1',                 // 끝 투명도
          },
        },
      },
    }, 
  }, 
  plugins: [], 
}
