const fs = require('fs');
const path = require('path');

// 원본 데이터 파일 읽기
const originalData = require('./words.js');

// 길이순으로 정렬
const sortedData = originalData.sort((a, b) => b.word.length - a.word.length);

// 정렬된 데이터를 새 파일로 저장
const outputPath = path.join(__dirname, 'sortedWords.js');
const fileContent = `const sortedWords = ${JSON.stringify(sortedData, null, 2)};`;

fs.writeFileSync(outputPath, fileContent);
console.log('Sorted words have been saved to sortedWords.js');