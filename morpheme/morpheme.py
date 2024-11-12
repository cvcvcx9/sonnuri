from kiwipiepy import Kiwi

# 사용자 단어 추가 없이 분석해보겠습니다.

kiwi = Kiwi()

print(*kiwi.analyze('사람을 골리다', top_n=5), sep='\n')