// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/content.js',  // 모듈 import를 포함한 메인 파일
  output: {
    filename: 'content.bundle.js',  // 번들링된 파일 이름
    path: path.resolve(__dirname, 'dist'),  // 번들링된 파일이 저장될 경로
  },
  mode: 'production',  // production 모드로 최적화된 코드 생성
};
