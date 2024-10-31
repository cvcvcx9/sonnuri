# 추출된 단어 파일 경로
input_file = "extracted_words.txt"

# 파일을 열어 줄 수(단어 개수) 세기
with open(input_file, "r", encoding="utf-8") as file:
    words = file.readlines()
    word_count = len(words)

print(f"Total unique words in {input_file}: {word_count}")