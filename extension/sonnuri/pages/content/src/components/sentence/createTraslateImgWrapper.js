export default function createTranslateImgWrapper() {
  const translateImgWrapper = document.createElement('div');
  translateImgWrapper.classList.add('translate-img-wrapper');
  translateImgWrapper.style.position = 'absolute';
  translateImgWrapper.style.display = 'none';
  translateImgWrapper.style.zIndex = 10003; // 버튼이 위에 보이도록 설정
  translateImgWrapper.style.boxShadow = '0px 2px 6px rgba(0, 0, 0, 0.2)';
  const translateImg = document.createElement('img');
  translateImg.src = 'chrome-extension://' + chrome.runtime.id + '/content/img/translateHandSign.gif';
  translateImg.style.width = '160px';
  translateImg.style.height = '110px';
  translateImg.style.padding = '8px 12px';
  translateImgWrapper.appendChild(translateImg);
  document.body.appendChild(translateImgWrapper);
  return translateImgWrapper;
}
