const fs = require('fs');
const words = require('./words.js');

// CSV 헤더 생성
const csvHeader = 'NO,word,URL\n';

// 데이터를 CSV 형식으로 변환
const csvContent = words.map(item => {
  return `${item.NO},"${item.word}","${item.URL}"`;
}).join('\n');

// 최종 CSV 내용 생성
const finalCsv = csvHeader + csvContent;

// CSV 파일로 저장
fs.writeFileSync('words.csv', finalCsv, 'utf-8');