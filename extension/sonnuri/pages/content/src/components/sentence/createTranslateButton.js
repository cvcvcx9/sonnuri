export default function createTranslateButton() {
    const button = document.createElement('div');
    button.id = 'show-sidebar-button';
    button.style.position = 'absolute';
    button.style.zIndex = 10002; // 버튼이 위에 보이도록 설정
    button.style.padding = '8px 8px';
    button.style.backgroundColor = '#fff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0px 2px 6px rgba(0, 0, 0, 0.2)';
    button.style.display = 'none';
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('content/img/sign-language.png'); // 아이콘 이미지 경로
    icon.alt = 'Icon';
    icon.style.width = '20px'; // 아이콘 크기 조정
    icon.style.height = '20px';
    button.appendChild(icon); // 아이콘을 버튼의 앞에 추가.
  
    document.body.appendChild(button); // 버튼을 문서에 추가
    return button;
  }