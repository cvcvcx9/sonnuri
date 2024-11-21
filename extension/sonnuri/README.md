# :hand: 손누리 :hand:

## :book: 익스텐션 설명
- 청각 장애인의 웹 접근성을 높이기 위한 서비스 입니다.

### 🎱 주요 기능
- 하이라이트 된 단어에 마우스를 올려놓으면 해당 단어에 대한 수어를 영상으로 보여줍니다.
- 문장을 드래그하여 요청하면, 해당 문장에 대한 영상을 수어 문법에 맞게 재배치 및 생성하여 보여줍니다.
- 단어별로 뚝뚝 끊겨보이는 수어 영상을 RIFE를 통해 자연스럽게 이어지게 하면서 한 사람이 하는 듯한 모습을 보여줍니다.


### 🕹 사용 방법
- 익스텐션을 설치하면 해당 랜딩페이지가 나타납니다.
- 랜딩 페이지에는 수어 및 쉬운 한국어로 서비스의 사용 방법이 제공됩니다.
- 하이라이트 바튼(우하단 켜고 끄기버튼)으로 단어 번역 기능을 활성화 및 비활성화 할 수 있습니다.
- 드래그 해서 번역 버튼을 누르는 것으로, 문장 번역을 요청할 수 있습니다.


### git 컨벤션
- 추후 추가

### branch 컨벤션
- 추후 추가


## 🏓 사용된 주요 라이브러리 및 보일러 플레이트 프로젝트


### 💾 chrome-extension-boilerplate-react-vite
- 익스텐션을 만드는데 기본이 된 보일러 플레이트 프로젝트
- 리액트로 컨텐츠 스크립트, 사이드패널, 옵션, 런타임 등의 스크립트를 모두 접근하고, 바로바로 리로딩이 되는 HMR 이 적용되어있어 빌드하고 재설치하는 과정을 거치지 않아도 되어 편하다.
#### 깃허브 주소
:joystick: [chrome-extensoin-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)

### 사용된 주요 라이브러리

| 패키지 이름                    | 버전       | 설명                                |
|-----------------------------|----------|-----------------------------------|
| `eslint-plugin-tailwindcss` | ^3.17.4  | Tailwind CSS용 ESLint 플러그인        |
| `react`                     | 18.3.1   | React 라이브러리                    |
| `react-dom`                 | 18.3.1   | React DOM 라이브러리                 |

### 개발 의존성

| 패키지 이름                              | 버전      | 설명                                       |
|---------------------------------------|---------|------------------------------------------|
| `@types/chrome`                       | ^0.0.270 | Chrome 타입 정의                            |
| `@types/node`                         | ^20.16.5 | Node.js 타입 정의                           |
| `@types/react`                        | ^18.3.3  | React 타입 정의                            |
| `@types/react-dom`                    | ^18.3.0  | React DOM 타입 정의                        |
| `@typescript-eslint/eslint-plugin`    | ^7.18.0  | TypeScript용 ESLint 플러그인                 |
| `@typescript-eslint/parser`           | ^7.18.0  | TypeScript용 ESLint 파서                    |
| `autoprefixer`                        | ^10.4.20 | CSS 자동 접두사 추가 도구                    |
| `cross-env`                           | ^7.0.3   | 환경 변수 설정을 크로스 플랫폼으로 지원        |
| `esbuild`                             | ^0.23.0  | 빠른 JavaScript 번들러                      |
| `eslint`                              | 8.57.0   | ESLint 정적 분석 도구                        |
| `eslint-config-airbnb-typescript`      | 18.0.0   | Airbnb 스타일 가이드 기반 ESLint 설정         |
| `eslint-config-prettier`               | 9.1.0    | Prettier와 충돌하는 ESLint 규칙 비활성화      |
| `eslint-plugin-import`                 | 2.29.1   | ES6 import/export 구문을 검사하는 ESLint 플러그인 |
| `eslint-plugin-jsx-a11y`               | 6.9.0    | JSX 접근성 관련 검사 플러그인                   |
| `eslint-plugin-prettier`               | 5.2.1    | Prettier를 ESLint 규칙으로 통합                |
| `eslint-plugin-react`                  | 7.35.0   | React 관련 ESLint 플러그인                     |
| `eslint-plugin-react-hooks`            | 4.6.2    | React Hooks 규칙을 검사하는 ESLint 플러그인       |
| `husky`                               | ^9.1.4   | Git hooks 관리 도구                          |
| `lint-staged`                          | ^15.2.7  | Git 스테이징된 파일에만 린트 실행                |
| `postcss`                             | ^8.4.47  | CSS 후처리 도구                              |
| `prettier`                            | ^3.3.3   | 코드 포매터                                 |
| `rimraf`                              | ^6.0.1   | Node.js에서 `rm -rf` 기능 제공                  |
| `tailwindcss`                         | ^3.4.11  | 유틸리티-퍼스트 CSS 프레임워크                 |
| `tslib`                               | ^2.6.3   | TypeScript 표준 라이브러리                      |
| `turbo`                               | ^2.0.12  | 고성능 모노레포 빌드 도구                      |
| `typescript`                          | 5.5.4    | TypeScript 언어                               |
| `vite`                                | 5.4.9    | 빠른 프론트엔드 빌드 도구                       |

## :o: 오픈소스
- 저희 프로젝트는 오픈소스 프로젝트로, 여러분들의 기여를 기다리고 있습니다.
- 또한 pages/content/src/word.js에 형식에 맞춰 단어, 단어에대한 영상을 넣는 것으로 하이라이트 기능은 이용할 수 있씁니다.


## 추후 개발 방향
- 단어 탐지 방법 효율화 (단순 find로 일일히 비교하면서 찾는 방식인데 발전시키고 싶습니다.)
- 영상 뜨는 곳을 정하거나, 하이라이트 버튼을 수정할 수 있도록 할 예정입니다.

## 기여방법

1. 저장소를 포크합니다.
2. 브랜치를 생성합니다 (`git checkout -b feature/새기능`).
3. 변경 사항을 커밋합니다 (`git commit -m '새 기능 추가'`).
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`).
5. 풀 리퀘스트를 생성합니다.

## 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)를 따릅니다.