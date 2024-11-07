// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: {
    content: './src/content.js',
    sidebar: './src/sidebar.jsx'
  },
  stats: {
    children: true,  // 하위 컴파일의 자세한 오류 메시지를 표시
  },
  output: {
    path: path.resolve(__dirname, 'dist'),  // 번들링된 파일이 저장될 경로
    filename: '[name].js',  // 번들링된 파일 이름
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader", options: { presets: ['@babel/preset-react'] }}
    ]
  },
  mode: 'production',  // production 모드로 최적화된 코드 생성
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/sidebar.html',
      filename: 'sidebar.html'
    }),
    new CopyPlugin({
      patterns: [
        {from:"public"}
      ]
    })
  ]
};
