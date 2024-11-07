from konlpy.tag import Okt
def conjugate(word):
    # 어간과 어미 분리
    okt = Okt()
    morphs = okt.morphs(word)
    stem = morphs[0]
    print(stem)
    # 활용형 딕셔너리 (주요 어미 형태로 변환)
    conjugations = {
        "현재형": f"{stem}는다",       # 예: 먹는다
        "과거형": f"{stem}었다",       # 예: 먹었다
        "미래형": f"{stem}겠다",       # 예: 먹겠다
        "추측형": f"{stem}을 것이다",   # 예: 먹을 것이다
        "가정형": f"{stem}으면",       # 예: 먹으면
        "명령형": f"{stem}어라",       # 예: 먹어라
        "청유형": f"{stem}자",         # 예: 먹자
        "진행형": f"{stem}고 있다",     # 예: 먹고 있다
        "가능형": f"{stem}을 수 있다",  # 예: 먹을 수 있다
        "의도형": f"{stem}으려고 한다", # 예: 먹으려고 한다
        "조건형": f"{stem}으면",       # 예: 먹으면
        "의문형": f"{stem}느냐",       # 예: 먹느냐
        "높임말 현재형": f"{stem}습니다",  # 예: 먹습니다
        "높임말 과거형": f"{stem}었습니다", # 예: 먹었습니다
        "부정형": f"{stem}지 않다",     # 예: 먹지 않다
    }

    return conjugations

# 메인 실행
if __name__ == "__main__":
    word = input("활용형을 생성할 기본형 단어를 입력하세요 (예: 먹다): ")
    conjugations = conjugate(word)
    
    print("\n[ 다양한 활용형 ]")
    for form, conjugated in conjugations.items():
        print(f"{form}: {conjugated}")
