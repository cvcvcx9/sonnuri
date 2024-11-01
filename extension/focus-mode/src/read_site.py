import requests
from bs4 import BeautifulSoup
from collections import Counter
import re
from typing import Dict, List, Set
import csv
from urllib.parse import urljoin, urlparse
import time

def get_all_links(url: str, soup: BeautifulSoup) -> Set[str]:
    """
    페이지에서 모든 링크를 추출하는 함수
    """
    base_domain = urlparse(url).netloc
    links = set()
    
    for link in soup.find_all('a', href=True):
        href = link['href']
        full_url = urljoin(url, href)
        
        # 같은 도메인의 링크만 수집
        if urlparse(full_url).netloc == base_domain:
            links.add(full_url)
    
    return links

def crawl_website(start_url: str, max_pages: int = 100) -> Dict[str, int]:
    """
    웹사이트를 재귀적으로 크롤링하는 함수
    """
    visited_urls = set()
    to_visit = {start_url}
    all_words = Counter()
    page_count = 0
    
    while to_visit and page_count < max_pages:
        try:
            current_url = to_visit.pop()
            
            if current_url in visited_urls:
                continue
                
            print(f"크롤링 중: {current_url}")
            
            # 웹사이트 요청
            response = requests.get(current_url)
            response.encoding = 'utf-8'
            response.raise_for_status()
            
            # BeautifulSoup으로 HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 텍스트 추출 및 전처리
            text = soup.get_text()
            text = re.sub(r'[^가-힣a-zA-Z\s]', '', text)
            words = text.split()
            
            # 단어 빈도수 업데이트
            all_words.update(words)
            
            # 새로운 링크 추가
            new_links = get_all_links(current_url, soup)
            to_visit.update(new_links - visited_urls)
            
            visited_urls.add(current_url)
            page_count += 1
            
            # 과도한 요청 방지를 위한 딜레이
            time.sleep(1)
            
        except Exception as e:
            print(f"에러 발생 ({current_url}): {e}")
            continue
    
    return dict(sorted(all_words.items(), key=lambda x: x[1], reverse=True))

def save_to_csv(word_freq: Dict[str, int], filename: str = 'word_frequencies_result_personal.csv') -> None:
    """
    단어 빈도수를 CSV 파일로 저장하는 함수
    """
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['단어', '빈도수'])
        for word, count in word_freq.items():
            writer.writerow([word, count])
    print(f"결과가 {filename}에 저장되었습니다.")

if __name__ == "__main__":
    url = input("분석할 웹사이트 URL을 입력하세요: ")
    max_pages = int(input("크롤링할 최대 페이지 수를 입력하세요 (기본값: 100): ") or "100")
    
    print("크롤링을 시작합니다...")
    word_frequencies = crawl_website(url, max_pages)
    
    # 상위 10개 단어 출력
    print("\n상위 10개 단어:")
    for word, count in list(word_frequencies.items())[:10]:
        print(f"{word}: {count}회")
    
    # CSV 파일로 저장
    save_to_csv(word_frequencies)
